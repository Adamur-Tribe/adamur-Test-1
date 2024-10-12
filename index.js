require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { PrismaClient } = require('@prisma/client');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const jwt = require('jsonwebtoken');

const app = express();
const prisma = new PrismaClient();

// Middleware to check authentication
const getUser = (token) => {
  try {
    if (token) {
      return jwt.verify(token, process.env.JWT_SECRET);
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Initialize Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers.authorization || '';
    const user = getUser(token);
    return { prisma, user };
  },
});

async function startServer() {
  await server.start();
  server.applyMiddleware({ app });

  app.listen({ port: 4000 }, () =>
    console.log(`Server ready at http://localhost:4000${server.graphqlPath}`)
  );
}

startServer();
