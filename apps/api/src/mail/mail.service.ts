import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
}

/**
 * Correo transaccional por SMTP (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM).
 * Sin configuración no envía nada y devuelve false: los flujos ofrecen el enlace al administrador.
 * Nunca registra el contenido del mensaje (lleva tokens).
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null | undefined;

  constructor(private readonly config: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(
      this.config.get<string>('SMTP_HOST') &&
      this.config.get<string>('SMTP_USER'),
    );
  }

  async send(message: MailMessage): Promise<boolean> {
    const transporter = this.getTransporter();
    if (!transporter) return false;
    try {
      await transporter.sendMail({
        from:
          this.config.get<string>('MAIL_FROM') ??
          this.config.get<string>('SMTP_USER'),
        to: message.to,
        subject: message.subject,
        text: message.text,
      });
      return true;
    } catch (error) {
      this.logger.error(
        `mail_send_failed ${error instanceof Error ? error.name : 'Error'}`,
      );
      return false;
    }
  }

  private getTransporter(): Transporter | null {
    if (this.transporter !== undefined) return this.transporter;
    if (!this.isConfigured()) {
      this.transporter = null;
      return null;
    }
    const port = Number(this.config.get<string>('SMTP_PORT') ?? 465);
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST'),
      port,
      secure: port === 465,
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASS'),
      },
      connectionTimeout: 10_000,
    });
    return this.transporter;
  }
}
