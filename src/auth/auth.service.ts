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
    const production = process.env.NODE_ENV === 'production';
    return {
      httpOnly: true,
      secure: production,
      sameSite: production ? ('none' as const) : ('lax' as const),
      path: '/',
    };
  }

  async login(email: string, password: string, res: Response) {
    const user = await this.userRepository.findOne({
      where: { email: email.trim().toLowerCase() },
    });

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

  async session(accessToken: string | undefined, refreshToken: string | undefined, res: Response) {
    const accessUser = accessToken ? await this.userForToken(accessToken) : null;
    if (accessUser) return { user: this.publicUser(accessUser) };

    const refreshUser = refreshToken ? await this.userForToken(refreshToken) : null;
    if (refreshUser) {
      this.issueAccessToken(refreshUser, res);
      return { user: this.publicUser(refreshUser) };
    }

    if (accessToken || refreshToken) {
      res.clearCookie('accessToken', this.cookieConfig);
      res.clearCookie('refreshToken', this.cookieConfig);
    }
    return { user: null };
  }

  private issueTokens(user: User, res: Response) {
    const payload = { sub: user.id, email: user.email, role: user.role, ver: user.tokenVersion ?? 0 };

    this.issueAccessToken(user, res);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    res.cookie('refreshToken', refreshToken, {
      ...this.cookieConfig,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

  }

  async refreshToken(refreshToken: string, res: Response) {
    if (!refreshToken)
      throw new UnauthorizedException('No refresh token provided');

    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken);
      const user = await this.userRepository.findOne({ where: { id: payload.sub } });
      if (!user) throw new UnauthorizedException('Account no longer exists');
      if ((payload.ver ?? 0) !== (user.tokenVersion ?? 0)) throw new UnauthorizedException('Session expired');

      this.issueAccessToken(user, res);
 
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

  private issueAccessToken(user: User, res: Response) {
    const accessToken = this.jwtService.sign(
      { sub: user.id, email: user.email, role: user.role, ver: user.tokenVersion ?? 0 },
      { expiresIn: '15m' },
    );
    res.cookie('accessToken', accessToken, {
      ...this.cookieConfig,
      maxAge: 15 * 60 * 1000,
    });
  }

  private async userForToken(token: string): Promise<User | null> {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(token);
    } catch {
      return null;
    }

    const user = await this.userRepository.findOne({ where: { id: payload.sub } });
    if (!user || (payload.ver ?? 0) !== (user.tokenVersion ?? 0)) return null;
    return user;
  }

  private publicUser(user: User) {
    const { password: _password, tokenVersion: _tokenVersion, ...publicUser } = user;
    return publicUser;
  }
}
