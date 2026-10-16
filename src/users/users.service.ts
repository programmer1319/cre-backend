import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
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
    await this.userRepo.save(user);
    return { message: 'Password updated successfully' };
  }

  private toPublicUser(user: User) {
    const { password: _password, ...publicUser } = user;
    return publicUser;
  }
}
