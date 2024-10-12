const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { generateOTP, sendOTP } = require('../utils/otp');
const { hashPassword, comparePassword } = require('../utils/password');

const resolvers = {
  Query: {
    me: async (_, __, { user, prisma }) => {
      if (!user) throw new Error("Not authenticated");
      return prisma.user.findUnique({ where: { id: user.userId } });
    },
  },

  Mutation: {
    registerUser: async (_, { email, password }, { prisma }) => {
      const hashedPassword = await hashPassword(password);
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiry

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          otp,
          otpExpiry,
        },
      });

      await sendOTP(email, otp);

      return { token: null, user };
    },

    loginUser: async (_, { email, password }, { prisma }) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) throw new Error("User not found");

      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) throw new Error("Incorrect password");

      if (!user.isVerified) throw new Error("Account not verified");

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      return { token, user };
    },

    verifyAccount: async (_, { email, otp }, { prisma }) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) throw new Error("User not found");

      if (user.otp !== otp || user.otpExpiry < new Date()) {
        throw new Error("Invalid or expired OTP");
      }

      const updatedUser = await prisma.user.update({
        where: { email },
        data: { isVerified: true, otp: null, otpExpiry: null },
      });

      return updatedUser;
    },

    requestPasswordReset: async (_, { email }, { prisma }) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) throw new Error("User not found");

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
      // Send password reset email (not implemented here, add your logic)
      return true;
    },

    resetPassword: async (_, { token, password }, { prisma }) => {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const hashedPassword = await hashPassword(password);

      await prisma.user.update({
        where: { id: decoded.userId },
        data: { password: hashedPassword },
      });

      return true;
    },
  },
};

module.exports = resolvers;
