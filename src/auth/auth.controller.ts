import {
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express'; // Make sure you import these types explicitly

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('refresh')
  refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // 1. Safe access using Type Casting or custom type signature
    const cookies = req.cookies as Record<string, string> | undefined;
    const refreshToken = cookies?.['refreshToken'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    // 2. No await needed here because your service method executes synchronously
    return this.authService.refreshToken(refreshToken, res);
  }
}
