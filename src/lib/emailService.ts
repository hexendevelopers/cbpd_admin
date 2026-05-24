import transporter from './nodemailer';
import { emailTemplates } from './emailTemplates';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export class EmailService {
  private static async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.SMTP_USER || process.env.GMAIL_USER || `info@cbpd.co.uk`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  static async sendRegistrationConfirmation(
    email: string,
    institutionName: string,
    contactName: string
  ): Promise<boolean> {
    const template = emailTemplates.registrationConfirmation(institutionName, contactName);
    
    return await this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  static async sendApprovalNotification(
    email: string,
    institutionName: string,
    contactName: string,
    loginEmail: string
  ): Promise<boolean> {
    const template = emailTemplates.approvalNotification(institutionName, contactName, loginEmail);
    
    return await this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  static async sendPasswordReset(
    email: string,
    institutionName: string,
    contactName: string,
    resetToken: string
  ): Promise<boolean> {
    const template = emailTemplates.passwordReset(institutionName, contactName, resetToken);
    
    return await this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  static async sendCertificateUnderReview(
    email: string,
    institutionName: string
  ): Promise<boolean> {
    const template = emailTemplates.certificateUnderReview(institutionName);
    
    return await this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  static async sendCertificateApproved(
    email: string,
    institutionName: string,
    batchNumber: string
  ): Promise<boolean> {
    const template = emailTemplates.certificateApproved(institutionName, batchNumber);
    
    return await this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  static async sendCertificateRejected(
    email: string,
    institutionName: string,
    batchNumber: string
  ): Promise<boolean> {
    const template = emailTemplates.certificateRejected(institutionName, batchNumber);
    
    return await this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }
}