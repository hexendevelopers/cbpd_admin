import nodemailer from 'nodemailer';

const port = process.env.PORT ? parseInt(process.env.PORT) : 587;

const transporter = nodemailer.createTransport({
  host: process.env.HOST,
  port: port,
  secure: port === 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || process.env.GMAIL_USER,
    pass: process.env.SMTP_PASSWORD || process.env.GMAIL_PASSWORD,
  },
});

export default transporter;