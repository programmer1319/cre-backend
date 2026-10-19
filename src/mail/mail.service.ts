import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    const configuredFrom = this.config.get<string>('MAIL_FROM')?.trim();
    const fromAddress = configuredFrom?.match(/<([^<>]+)>$/)?.[1] ?? configuredFrom;
    if (host?.toLowerCase() === 'smtp.gmail.com' && user && configuredFrom && fromAddress?.trim().toLowerCase() !== user.toLowerCase()) {
      this.logger.warn('MAIL_FROM differs from the authenticated Gmail account; using SMTP_USER as sender');
      this.from = `CreFolio <${user}>`;
    } else {
      // Keep deployment sender addresses while the product owns the display name.
      this.from = fromAddress ? `CreFolio <${fromAddress.trim()}>` : (user ? `CreFolio <${user}>` : 'CreFolio');
    }
    const secure = this.config.get('SMTP_SECURE') === 'true';
    this.transporter = host && user && pass ? nodemailer.createTransport({ host, port: Number(this.config.get('SMTP_PORT') ?? 587), secure, requireTLS: !secure, auth: { user, pass }, connectionTimeout: 10_000, greetingTimeout: 10_000 }) : null;
  }

  async send(options: { to: string; subject: string; text: string; replyTo?: string }) {
    if (!this.transporter) throw new ServiceUnavailableException('Email service is not configured');
    const result = await this.transporter.sendMail({ from: this.from, ...options });
    if (!result.accepted?.some((address: string) => address.toLowerCase() === options.to.toLowerCase())) {
      throw new ServiceUnavailableException('Email provider did not accept the recipient');
    }
    return result;
  }

  isConfigured() { return this.transporter !== null; }
}
