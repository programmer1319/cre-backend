import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/users/user.entity';
import { JwtPayload } from './jwt/jwt-payload';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  private get cookieConfig() {
    return {
      httpOnly: true,
      secure: true,
      sameSite: 'none' as const,
      partitioned: true,
    };
  }

  async login(email: string, password: string, res: Response) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    this.issueTokens(user, res);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  verifyToken(token: string) {
    return this.jwtService.verify<JwtPayload>(token);
  }
  private issueTokens(user: User, res: Response) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    res.cookie('accessToken', accessToken, {
      ...this.cookieConfig,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      ...this.cookieConfig,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  refreshToken(refreshToken: string, res: Response) {
    if (!refreshToken)
      throw new UnauthorizedException('No refresh token provided');

    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken);

      const newAccessToken = this.jwtService.sign(
        { sub: payload.sub, email: payload.email, role: payload.role },
        { expiresIn: '15m' },
      );

      res.cookie('accessToken', newAccessToken, {
        ...this.cookieConfig,
        maxAge: 15 * 60 * 1000,
      });

      return { success: true };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  logout(res: Response) {
    res.clearCookie('accessToken', this.cookieConfig);
    res.clearCookie('refreshToken', this.cookieConfig);
    return { message: 'Logged out successfully' };
  }
}
