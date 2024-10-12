// app.js

const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { gql } = require('apollo-server-express');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

// GraphQL schema
const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    verified: Boolean!
  }

  type Query {
    users: [User!]!
  }

  type Mutation {
    register(email: String!, password: String!): User!
    login(email: String!, password: String!): String!
    verifyOTP(email: String!, otp: String!): String!
    requestPasswordReset(email: String!): String!
    resetPassword(token: String!, newPassword: String!): String!
  }
`;

// GraphQL resolvers
const resolvers = {
  Query: {
    users: async () => await prisma.user.findMany(),
  },
  Mutation: {
    register: async (_, { email, password }) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { email, password: hashedPassword, verified: false },
      });
      sendOTP(email); // Send OTP for verification
      return user;
    },
    login: async (_, { email, password }) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error('Invalid credentials');
      }
      if (!user.verified) {
        throw new Error('Email not verified');
      }
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      return token;
    },
    verifyOTP: async (_, { email, otp }) => {
      // For simplicity, let's assume the OTP is '123456'
      if (otp !== '123456') throw new Error('Invalid OTP');
      await prisma.user.update({
        where: { email },
        data: { verified: true },
      });
      return 'Email verified successfully';
    },
    requestPasswordReset: async (_, { email }) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) throw new Error('User not found');
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
      await sendResetEmail(email, token); // Send reset email
      return 'Password reset email sent';
    },
    resetPassword: async (_, { token, newPassword }) => {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: payload.userId },
        data: { password: hashedPassword },
      });
      return 'Password reset successfully';
    },
  },
};

// Email setup for Nodemailer
const sendOTP = async (email) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Account Verification OTP',
    text: 'Your OTP is 123456', // In a real app, generate a random OTP
  };

  await transporter.sendMail(mailOptions);
};

const sendResetEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset',
    text: `You can reset your password using the following link: 
    http://localhost:${PORT}/reset-password?token=${token}`,
  };

  await transporter.sendMail(mailOptions);
};

// Initialize Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

// Start the server
const startServer = async () => {
  await server.start();
  server.applyMiddleware({ app });
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}${server.graphqlPath}`);
  });
};

startServer();
