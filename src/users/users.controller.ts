import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  Req,
  UnauthorizedException,
  ForbiddenException,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import type { Response, Request } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { JwtGuard } from 'src/auth/jwt/jwt.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from './roles.decorater';
import { UserRole } from './user-role.enum';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LoginDto } from './dto/login.dto';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
@Controller('user')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  @Post('login')
  @UseGuards(ThrottlerGuard)
  login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(body.email, body.password, res);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }

  @Post('refresh')
  refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refreshToken'] as string;
    if (typeof refreshToken !== 'string') {
      throw new UnauthorizedException('Refresh token missing');
    }

    return this.authService.refreshToken(refreshToken, res);
  }

  @Post()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 4, ttl: 60_000 } })
  createUser(@Body() body: CreateUserDto) {
    if (process.env.NODE_ENV === 'production' && process.env.PUBLIC_REGISTRATION_ENABLED !== 'true') {
      throw new ForbiddenException('Public registration is temporarily closed');
    }
    return this.usersService.create(body);
  }

  @Post('forgot-password')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  forgotPassword(@Body() body: RequestPasswordResetDto) {
    return this.usersService.requestPasswordReset(body.email);
  }

  @Post('reset-password')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.usersService.resetPassword(body.token, body.password);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  async getUsers() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtGuard)
  @Get('me')
  me(@Req() req: Request & { user: { id: number } }) {
    return this.usersService.findOne(String(req.user.id));
  }

  @UseGuards(JwtGuard)
  @Patch('me')
  updateProfile(@Req() req: Request & { user: { id: number } }, @Body() body: UpdateProfileDto) {
    return this.usersService.updateProfile(Number(req.user.id), body);
  }

  @UseGuards(JwtGuard)
  @Patch('security/password')
  changePassword(@Req() req: Request & { user: { id: number } }, @Body() body: ChangePasswordDto) {
    return this.usersService.changePassword(
      Number(req.user.id),
      body.currentPassword,
      body.newPassword,
    );
  }
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
