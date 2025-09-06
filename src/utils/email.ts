import nodemailer from "nodemailer";
import { config } from "../config";

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: false,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

export const sendVerificationEmail = async (
  email: string,
  token: string
): Promise<void> => {
  const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify?token=${token}`;

  const mailOptions = {
    from: config.smtp.user,
    to: email,
    subject: "Flamingo 계정 이메일 인증",
    html: `
      <h2>이메일 인증</h2>
      <p>안녕하세요!</p>
      <p>아래 링크를 클릭하여 계정을 인증해주세요:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>이 링크는 24시간 후 만료됩니다.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Email sending error:", error);
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  token: string
): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;

  const mailOptions = {
    from: config.smtp.user,
    to: email,
    subject: "Flamingo 비밀번호 재설정",
    html: `
      <h2>비밀번호 재설정</h2>
      <p>안녕하세요!</p>
      <p>아래 링크를 클릭하여 비밀번호를 재설정해주세요:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>이 링크는 1시간 후 만료됩니다.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Email sending error:", error);
  }
};
