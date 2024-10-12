const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');

function generateOTP() {
  return otpGenerator.generate(6, { upperCase: false, specialChars: false });
}

async function sendOTP(email, otp) {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Account Verification OTP',
    text: `Your OTP is ${otp}. It expires in 10 minutes.`,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { generateOTP, sendOTP };
