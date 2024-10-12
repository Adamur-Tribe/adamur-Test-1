const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    id: Int!
    email: String!
    isVerified: Boolean!
    role: String!
  }

  type AuthPayload {
    token: String
    user: User
  }

  type Query {
    me: User
  }

  type Mutation {
    registerUser(email: String!, password: String!): AuthPayload
    loginUser(email: String!, password: String!): AuthPayload
    verifyAccount(email: String!, otp: String!): User
    requestPasswordReset(email: String!): Boolean
    resetPassword(token: String!, password: String!): Boolean
  }
`;

module.exports = typeDefs;
