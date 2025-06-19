import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom'; // Import JSDOM

@Injectable()
export class EmailService {
  private transporter: Mail;
  private readonly logger = new Logger(EmailService.name);
  private readonly emailReceiver: string;
  private readonly emailUser: string;
  private domPurify: any; // Declare domPurify instance

  constructor(private configService: ConfigService) {
    // Initialize JSDOM and DOMPurify for server-side sanitization
    const window = new JSDOM('').window;
    this.domPurify = DOMPurify(window as any);

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

    // Modernized HTML email template for form submissions
    let htmlBody = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.8; color: #333; background-color: #f4f7f6; padding: 20px; border-radius: 8px; max-width: 600px; margin: 20px auto; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
            <h2 style="color: #2c3e50; text-align: center; margin-bottom: 25px; font-size: 24px;">Handl Alert 📩</h2>
            <div style="background-color: #ffffff; padding: 25px; border-radius: 8px; border: 1px solid #e0e0e0; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
              <h3 style="color: #34495e; margin-top: 0; font-size: 20px;">Form: "${formId}"</h3>
              <p style="font-size: 15px; color: #555;">Here goes:</p>
              <table style="width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 20px; border-radius: 8px; overflow: hidden;">
                <thead style="background-color: #e9ecef;">
                  <tr>
                    <th style="padding: 12px 15px; text-align: left; color: #495057; font-size: 14px; border-bottom: 1px solid #dee2e6;">Field</th>
                    <th style="padding: 12px 15px; text-align: left; color: #495057; font-size: 14px; border-bottom: 1px solid #dee2e6;">Value</th>
                  </tr>
                </thead>
                <tbody>
        `;

    let textBody = `"${formId}"\n\nDetails:\n`;

    for (const key in formData) {
      if (Object.prototype.hasOwnProperty.call(formData, key)) {
        const value = formData[key];
        let displayValue = typeof value === 'object' && value !== null
          ? JSON.stringify(value, null, 2)
          : String(value);

        // Sanitize displayValue to prevent XSS in HTML email
        displayValue = this.domPurify.sanitize(displayValue);

        htmlBody += `
                <tr>
                  <td style="padding: 12px 15px; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #495057; width: 30%;">
                    ${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()}:
                  </td>
                  <td style="padding: 12px 15px; border-bottom: 1px solid #f0f0f0; color: #6c757d;">${displayValue}</td>
                </tr>
            `;
        textBody += `  ${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()}: ${displayValue}\n`;
      }
    }

    htmlBody += `
                </tbody>
              </table>
            </div>
            <p style="font-size: 13px; color: #999; text-align: center; margin-top: 30px;">
              This email was sent automatically by your Handl application.
            </p>
          </div>
        `;
    textBody += `\nThis email was sent automatically by your Handl application.`;


    const mailOptions = {
      from: `"Handl Form Alert🔔"`,
      to: this.emailReceiver,
      subject: `A new message from ${formId}`,
      html: htmlBody,
      text: textBody,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      // const info = {
      //   messageId: 'testing sent email',
      // };
      this.logger.log(`Email sent successfully for form ${formId}: ${info.messageId}`);
      // this.logger.debug(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    } catch (error) {
      this.logger.error(`Failed to send email notification for form ${formId}:`, error.message, error.stack);
      throw new InternalServerErrorException('Failed to send email notification.');
    }
  }
}
