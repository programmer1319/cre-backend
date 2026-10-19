import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import { MailService } from './mail.service';

jest.mock('nodemailer', () => ({ __esModule: true, default: { createTransport: jest.fn() } }));

describe('MailService', () => {
  const config = { get: (key: string) => ({
    SMTP_HOST: 'smtp.gmail.com', SMTP_PORT: '587', SMTP_USER: 'sender@example.com',
    SMTP_PASS: 'test-only', MAIL_FROM: 'Portico <sender@example.com>',
  } as Record<string, string>)[key] } as ConfigService;

  it('rejects an SMTP response that accepted no recipient', async () => {
    const sendMail = jest.fn().mockResolvedValue({ accepted: [], rejected: ['admin@example.com'] });
    jest.mocked(nodemailer.createTransport).mockReturnValue({ sendMail } as never);
    const mail = new MailService(config);
    await expect(mail.send({ to: 'admin@example.com', subject: 'Test', text: 'Test' }))
      .rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('returns a delivery ID when SMTP accepted the recipient', async () => {
    const sendMail = jest.fn().mockResolvedValue({ accepted: ['admin@example.com'], messageId: '<test@example.com>' });
    jest.mocked(nodemailer.createTransport).mockReturnValue({ sendMail } as never);
    const mail = new MailService(config);
    await expect(mail.send({ to: 'admin@example.com', subject: 'Test', text: 'Test' }))
      .resolves.toMatchObject({ messageId: '<test@example.com>' });
  });

  it('uses the authenticated Gmail sender when MAIL_FROM claims another domain', async () => {
    const sendMail = jest.fn().mockResolvedValue({ accepted: ['admin@example.com'] });
    jest.mocked(nodemailer.createTransport).mockReturnValue({ sendMail } as never);
    const wrongFrom = { get: (key: string) => key === 'MAIL_FROM' ? 'Portico <no-reply@other.example>' : config.get(key) } as ConfigService;
    await new MailService(wrongFrom).send({ to: 'admin@example.com', subject: 'Test', text: 'Test' });
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ from: 'Portico <sender@example.com>' }));
  });
});
