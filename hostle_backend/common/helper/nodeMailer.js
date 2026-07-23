import nodemailer from "nodemailer";

// ----nodemailer otp verification code

export const nodeMailerOtpHelper = async (to, sub, message) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.USER_EMAIL,
      to: to,
      subject: sub,
      text: message,
    });

    console.log("Email sent: ", info.messageId);

    return info;
  } catch (err) {
    console.log("Error sending email", err.message || err);
    return null;
  }
};
