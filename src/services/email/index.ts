import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.elasticemail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendEmail = async ({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to,
      subject,
      text: text || '',
      html,
    });
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};