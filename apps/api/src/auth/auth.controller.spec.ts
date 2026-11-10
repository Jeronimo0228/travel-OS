import { HttpException, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthController } from './auth.controller';
import type { AuthService } from './auth.service';

const response = { cookie: jest.fn() } as unknown as Response;
const request = { ip: '203.0.113.7' } as Request;
const input = {
  email: 'Asesor@Demo.com',
  password: 'incorrecta',
  agencySlug: 'demo',
} as never;

describe('AuthController login brute-force protection', () => {
  it('blocks after 10 wrong passwords for the same IP and email', async () => {
    const login = jest.fn().mockRejectedValue(new UnauthorizedException());
    const controller = new AuthController({ login } as unknown as AuthService);
    for (let i = 0; i < 10; i++) {
      await expect(
        controller.login(input, response, request),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    }
    const blocked = controller.login(input, response, request);
    await expect(blocked).rejects.toBeInstanceOf(HttpException);
    await expect(blocked).rejects.toMatchObject({ status: 429 });
    expect(login).toHaveBeenCalledTimes(10);
  });

  it('does not count other errors and keeps other users unaffected', async () => {
    const login = jest
      .fn()
      .mockRejectedValueOnce(new Error('db down'))
      .mockResolvedValue({ accessToken: 't', user: { id: 'u' } });
    const controller = new AuthController({ login } as unknown as AuthService);
    await expect(controller.login(input, response, request)).rejects.toThrow(
      'db down',
    );
    await expect(controller.login(input, response, request)).resolves.toEqual({
      user: { id: 'u' },
    });
  });
});
