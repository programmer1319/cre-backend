import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { User } from '../users/user.entity';
import type { Response } from 'express';

describe('AuthService', () => {
  let service: AuthService;
  const jwt = { verify: jest.fn(), sign: jest.fn(() => 'new-access-token') };
  const users = { findOne: jest.fn() };
  const response = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: jwt },
        { provide: getRepositoryToken(User), useValue: users },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns null without producing a 401 when the visitor has no session cookies', async () => {
    await expect(service.session(undefined, undefined, response)).resolves.toEqual({ user: null });
    expect(users.findOne).not.toHaveBeenCalled();
  });

  it('returns a safe user for a valid access token', async () => {
    jwt.verify.mockReturnValue({ sub: 7, ver: 2 });
    users.findOne.mockResolvedValue({
      id: 7,
      name: 'Demo Admin',
      email: 'admin@example.com',
      role: 'admin',
      password: 'hash',
      tokenVersion: 2,
    });

    await expect(service.session('access', undefined, response)).resolves.toEqual({
      user: {
        id: 7,
        name: 'Demo Admin',
        email: 'admin@example.com',
        role: 'admin',
      },
    });
  });

  it('refreshes the access cookie inside the session check when only refresh is valid', async () => {
    jwt.verify
      .mockImplementationOnce(() => { throw new Error('expired'); })
      .mockReturnValueOnce({ sub: 7, ver: 2 });
    users.findOne.mockResolvedValue({
      id: 7,
      name: 'Demo Admin',
      email: 'admin@example.com',
      role: 'admin',
      password: 'hash',
      tokenVersion: 2,
    });

    await expect(service.session('expired', 'refresh', response)).resolves.toMatchObject({
      user: { id: 7 },
    });
    expect(response.cookie).toHaveBeenCalledWith(
      'accessToken',
      'new-access-token',
      expect.objectContaining({ httpOnly: true, maxAge: 15 * 60 * 1000 }),
    );
  });
});
