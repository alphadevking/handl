import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import DOMPurify from 'isomorphic-dompurify'; // Import isomorphic-dompurify

@Injectable()
export class EmailService {
  private transporter: Mail;
  private readonly logger = new Logger(EmailService.name);
  private readonly emailReceiver: string;
  private readonly emailUser: string;

  constructor(private configService: ConfigService) {
    this.emailUser = this.configService.get<string>('EMAIL_USER')!;
    this.emailReceiver = this.configService.get<string>('EMAIL_RECEIVER')!;

    if (!this.emailUser || !this.emailReceiver) {
      this.logger.error('Email sender or receiver not configured. Email notifications will not work.');
    }

    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST')!,
      port: this.configService.get<number>('EMAIL_PORT')!,
      secure: this.configService.get<boolean>('EMAIL_SECURE')!,
      auth: {
        user: this.emailUser,
        pass: this.configService.get<string>('EMAIL_PASS')!,
      },
    });
    this.logger.log('Nodemailer transporter initialized.');
  }

  async sendFormEmail(formId: string, formData: Record<string, any>): Promise<void> {
    if (!this.emailUser || !this.emailReceiver) {
      this.logger.warn('Email service not fully configured. Skipping email sending.');
      return;
    }

    let htmlBody = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>New Submission for Form: "${formId}"</h2>
            <p>Details:</p>
            <div style="border: 1px solid #eee; padding: 10px; background-color: #f9f9f9;">
              <table style="width: 100%; border-collapse: collapse;">
        `;

    let textBody = `New Submission for Form: "${formId}"\n\nDetails:\n`;

    for (const key in formData) {
      if (Object.prototype.hasOwnProperty.call(formData, key)) {
        const value = formData[key];
        let displayValue = typeof value === 'object' && value !== null
          ? JSON.stringify(value, null, 2)
          : String(value);

        // Sanitize displayValue to prevent XSS in HTML email
        displayValue = DOMPurify.sanitize(displayValue);

        htmlBody += `
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; width: 30%;">
                    ${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()}:
                  </td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${displayValue}</td>
                </tr>
            `;
        textBody += `  ${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()}: ${displayValue}\n`;
      }
    }

    htmlBody += `
              </table>
            </div>
            <p style="font-size: 0.8em; color: #777; margin-top: 20px;">
              This email was sent automatically by your Handl application.
            </p>
          </div>
        `;
    textBody += `\nThis email was sent automatically by your Handl application.`;


    const mailOptions = {
      from: `"Handl Form" <${this.emailUser}>`,
      to: this.emailReceiver,
      subject: `New Handl Form Submission: ${formId}`,
      html: htmlBody,
      text: textBody,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully for form ${formId}: ${info.messageId}`);
      this.logger.debug(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    } catch (error) {
      this.logger.error(`Failed to send email notification for form ${formId}:`, error.message, error.stack);
      throw new InternalServerErrorException('Failed to send email notification.');
    }
  }
}
