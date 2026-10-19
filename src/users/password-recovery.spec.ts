import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { MailService } from '../mail/mail.service';
import { User } from './user.entity';
import { PasswordResetToken } from './password-reset.entity';
import { UsersService } from './users.service';

describe('password recovery', () => {
  const user = { id: 7, email: 'client@example.com', password: 'old', tokenVersion: 2 } as User;
  const mail = { send: jest.fn().mockResolvedValue(undefined), isConfigured: jest.fn().mockReturnValue(true) } as unknown as MailService;
  const config = { get: jest.fn().mockReturnValue('https://crefolio.example') } as unknown as ConfigService;

  it('gives the same public response for an unknown address', async () => {
    const users = { findOne: jest.fn().mockResolvedValue(null) } as unknown as Repository<User>;
    const tokens = { save: jest.fn() } as unknown as Repository<PasswordResetToken>;
    const service = new UsersService(users, tokens, mail, config);
    await expect(service.requestPasswordReset('absent@example.com')).resolves.toEqual({ message: 'If an account exists, a recovery link has been sent.' });
    expect(tokens.save).not.toHaveBeenCalled();
  });

  it('rejects a token that has already been claimed', async () => {
    const users = { findOne: jest.fn() } as unknown as Repository<User>;
    const tokens = { findOne: jest.fn().mockResolvedValue({ id: 1, userId: user.id }), update: jest.fn().mockResolvedValue({ affected: 0 }) } as unknown as Repository<PasswordResetToken>;
    const service = new UsersService(users, tokens, mail, config);
    await expect(service.resetPassword('a'.repeat(64), 'NewPassword123')).rejects.toBeInstanceOf(UnauthorizedException);
    expect(users.findOne).not.toHaveBeenCalled();
  });

  it('invalidates existing sessions after a successful reset', async () => {
    const users = { findOne: jest.fn().mockResolvedValue({ ...user }), save: jest.fn(async (item) => item) } as unknown as Repository<User>;
    const tokens = { findOne: jest.fn().mockResolvedValue({ id: 1, userId: user.id }), update: jest.fn().mockResolvedValue({ affected: 1 }), delete: jest.fn().mockResolvedValue({ affected: 1 }) } as unknown as Repository<PasswordResetToken>;
    const service = new UsersService(users, tokens, mail, config);
    await service.resetPassword('a'.repeat(64), 'NewPassword123');
    expect(users.save).toHaveBeenCalledWith(expect.objectContaining({ tokenVersion: 3 }));
    expect(tokens.delete).toHaveBeenCalledWith({ userId: user.id });
  });
});
