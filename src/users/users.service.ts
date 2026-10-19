import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ServiceUnavailableException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PasswordResetToken } from './password-reset.entity';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'crypto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(PasswordResetToken)
    private resetRepo: Repository<PasswordResetToken>,
    private mail: MailService,
    private config: ConfigService,
  ) {}

  async create(userData: CreateUserDto) {
    const email = userData.email.trim().toLowerCase();
    if (await this.userRepo.exists({ where: { email } })) {
      throw new ConflictException('An account with this email already exists');
    }
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = this.userRepo.create({
      ...userData,
      name: userData.name.trim(),
      email,
      password: hashedPassword,
    });
    const saved = await this.userRepo.save(user);
    await this.mail.send({ to: saved.email, subject: 'Welcome to CreFolio', text: `Hello ${saved.name},\n\nYour CreFolio account is ready. You can sign in to explore properties and manage your shortlist.\n\nIf you did not create this account, contact our team.` }).catch((error: unknown) => this.logger.error('Welcome email failed', error));
    return this.toPublicUser(saved);
  }

  async findAll() {
    const users = await this.userRepo.find();
    return users.map((user) => this.toPublicUser(user));
  }

  async findOne(id: string) {
    const user = await this.userRepo.findOne({ where: { id: parseInt(id) } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.toPublicUser(user);
  }

  async updateProfile(userId: number, values: UpdateProfileDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (values.email) {
      const email = values.email.trim().toLowerCase();
      if (email !== user.email && (!values.currentPassword || !(await bcrypt.compare(values.currentPassword, user.password)))) {
        throw new UnauthorizedException('Current password is required to change your email');
      }
      const owner = await this.userRepo.findOne({ where: { email } });
      if (owner && owner.id !== userId) {
        throw new ConflictException('An account with this email already exists');
      }
      if (email !== user.email) {
        const oldEmail = user.email;
        user.email = email;
        await this.userRepo.save(user);
        await Promise.allSettled([
          this.mail.send({ to: oldEmail, subject: 'Your CreFolio email changed', text: `Your CreFolio account email changed to ${email}. If this was not you, contact our team immediately.` }),
          this.mail.send({ to: email, subject: 'CreFolio email address updated', text: 'This email address is now associated with your CreFolio account.' }),
        ]);
      }
    }

    if (values.name !== undefined) user.name = values.name.trim();
    if (values.jobTitle !== undefined) user.jobTitle = values.jobTitle.trim();
    if (values.phone !== undefined) user.phone = values.phone.trim();
    if (values.bio !== undefined) user.bio = values.bio.trim();
    return this.toPublicUser(await this.userRepo.save(user));
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    if (await bcrypt.compare(newPassword, user.password)) {
      throw new ConflictException('New password must be different from the current password');
    }
    user.password = await bcrypt.hash(newPassword, 12);
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    await this.userRepo.save(user);
    await this.mail.send({ to: user.email, subject: 'Your CreFolio password changed', text: 'Your CreFolio password was changed. If you did not make this change, contact our team immediately.' }).catch((error: unknown) => this.logger.error('Password change email failed', error));
    return { message: 'Password updated successfully' };
  }

  async requestPasswordReset(address: string) {
    const base = this.config.get<string>('FRONTEND_URL');
    if (!base || !this.mail.isConfigured()) throw new ServiceUnavailableException('Password recovery is temporarily unavailable');
    const user = await this.userRepo.findOne({ where: { email: address.trim().toLowerCase() } });
    if (user) {
      const token = randomBytes(32).toString('hex');
      await this.resetRepo.delete({ userId: user.id });
      await this.resetRepo.save(this.resetRepo.create({ userId: user.id, tokenHash: this.hashToken(token), expiresAt: new Date(Date.now() + 30 * 60 * 1000), usedAt: null }));
      const url = `${base.replace(/\/$/, '')}/reset-password?token=${token}`;
      await this.mail.send({ to: user.email, subject: 'Reset your CreFolio password', text: `A password reset was requested for your CreFolio account.\n\nOpen this link within 30 minutes:\n${url}\n\nIf you did not request this, you can ignore this email.` }).catch((error: unknown) => this.logger.error('Recovery email failed', error));
    }
    return { message: 'If an account exists, a recovery link has been sent.' };
  }

  async resetPassword(token: string, password: string) {
    const record = await this.resetRepo.findOne({ where: { tokenHash: this.hashToken(token), usedAt: IsNull(), expiresAt: MoreThan(new Date()) } });
    if (!record) throw new UnauthorizedException('Recovery link is invalid or has expired');
    const claim = await this.resetRepo.update({ id: record.id, usedAt: IsNull(), expiresAt: MoreThan(new Date()) }, { usedAt: new Date() });
    if (!claim.affected) throw new UnauthorizedException('Recovery link is invalid or has expired');
    const user = await this.userRepo.findOne({ where: { id: record.userId } });
    if (!user) throw new NotFoundException('User not found');
    user.password = await bcrypt.hash(password, 12);
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    await this.userRepo.save(user);
    await this.resetRepo.delete({ userId: user.id });
    await this.mail.send({ to: user.email, subject: 'Your CreFolio password was reset', text: 'Your CreFolio password was reset. If you did not make this change, contact our team immediately.' }).catch((error: unknown) => this.logger.error('Reset confirmation email failed', error));
    return { message: 'Password reset. You can now sign in.' };
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private toPublicUser(user: User) {
    const { password: _password, tokenVersion: _tokenVersion, ...publicUser } = user;
    return publicUser;
  }
}
