import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

export type EmailAttachment = {
  contentBase64: string;
  filename: string;
  type: string;
  disposition: 'attachment' | 'inline';
};

export type SendEmailOptions = {
  to: { email: string; name?: string };
  subject: string;
  text: string;
  html: string;
  attachments?: EmailAttachment[];
  from?: { email: string; name?: string };
  debugFileName?: string;
};

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendEmail(options: SendEmailOptions): Promise<void> {
    if (process.env.SENDGRID_MOCK === 'true') {
      this.writeMockEmail(options);
      return;
    }

    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      throw new InternalServerErrorException('Missing SENDGRID_API_KEY.');
    }

    const fromEmail = options.from?.email || process.env.SENDGRID_FROM_EMAIL || 'noreply@needlist.org';
    const fromName = options.from?.name || process.env.SENDGRID_FROM_NAME || 'NeedList.ORG';

    const payload = {
      personalizations: [
        {
          to: [{ email: options.to.email, name: options.to.name }],
        },
      ],
      from: { email: fromEmail, name: fromName },
      subject: options.subject,
      content: [
        { type: 'text/plain', value: options.text },
        { type: 'text/html', value: options.html },
      ],
      attachments: (options.attachments || []).map((attachment) => ({
        content: attachment.contentBase64,
        filename: attachment.filename,
        type: attachment.type,
        disposition: attachment.disposition,
      })),
    };

    try {
      await axios.post('https://api.sendgrid.com/v3/mail/send', payload, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      });
    } catch (error: any) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      if (status === 401) {
        throw new InternalServerErrorException(
          'SendGrid unauthorized (401). Check SENDGRID_API_KEY and its Mail Send permission.',
        );
      }
      throw new InternalServerErrorException(
        `SendGrid request failed${status ? ` (${status})` : ''}: ${data ? JSON.stringify(data) : error?.message || 'Unknown error'}`,
      );
    }
  }

  private writeMockEmail(options: SendEmailOptions): void {
    const outDir = path.join(process.cwd(), 'tmp', 'mock-emails');
    fs.mkdirSync(outDir, { recursive: true });
    const fileName = options.debugFileName || `email-${Date.now()}.json`;
    const outPath = path.join(outDir, fileName);
    const payload = {
      to: options.to.email,
      from: options.from?.email || process.env.SENDGRID_FROM_EMAIL || 'noreply@needlist.org',
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments || [],
    };
    fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf-8');
    this.logger.log(`Mock email saved to ${outPath}`);
  }
}
