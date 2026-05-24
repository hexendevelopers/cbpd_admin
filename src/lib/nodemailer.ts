import nodemailer from 'nodemailer';

const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 465;

const transporter = nodemailer.createTransport({
  host: process.env.HOST,
  port: smtpPort,
  secure: smtpPort === 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || process.env.GMAIL_USER,
    pass: process.env.SMTP_PASSWORD || process.env.GMAIL_PASSWORD,
  },
});

export default transporter;