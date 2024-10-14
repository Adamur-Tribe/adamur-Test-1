

# Adamur Scholarship Backend System

## Project Description

This project is a backend user management system designed for the Adamur educational platform, which helps African developers master tech skills. The system handles:

- User registration and validation
- Secure login with JWT tokens
- Email-based account verification (using OTP)
- Password reset functionality

The system is built using modern tools, including GraphQL, Prisma, and PostgreSQL, ensuring scalability and security.

---

## Features

### 1. **User Registration**
   - Users can register with an email and password.
   - Passwords are hashed using `bcryptjs`.
   - Email validation and strong password enforcement are applied.
   - OTP is sent via email for account verification.

### 2. **User Login**
   - Users can log in using email and password.
   - JWT token is returned for successful logins.
   - Non-verified users are notified.

### 3. **Account Verification**
   - An OTP is sent to the user’s email for verification after registration.
   - Users can verify their account using the OTP.

### 4. **Password Reset**
   - Users can request a password reset via email.
   - A reset link with a secure token is sent via email.
   - Users can reset their password using the token.

---

## Technology Stack

- **Backend**: Node.js, Express, GraphQL
- **Database**: Prisma (PostgreSQL)
- **Authentication**: JWT
- **Email Service**: Nodemailer (Gmail or other SMTP)

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Adamur-Tribe/adamur-Test-1.git
cd adamur-Test-1
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set up Environment Variables

Create a `.env` file in the root directory and add the following:

```
DATABASE_URL=postgresql://postgres:Pure@localhost:5432/mydb?schema=public
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

### 4. Migrate the Database

```bash
npx prisma migrate dev --name init
```

### 5. Run the Application

```bash
npm run dev
```

The application will be running at `http://localhost:4000/`.

---

## GraphQL Endpoints

### 1. **User Registration**

```graphql
mutation {
  registerUser(email: "example@example.com", password: "Password123") {
    message
  }
}
```

### 2. **User Login**

```graphql
mutation {
  login(email: "example@example.com", password: "Password123") {
    token
  }
}
```

### 3. **Verify Account**

```graphql
mutation {
  verifyAccount(otp: "123456") {
    message
  }
}
```

### 4. **Request Password Reset**

```graphql
mutation {
  requestPasswordReset(email: "example@example.com") {
    message
  }
}
```

### 5. **Reset Password**

```graphql
mutation {
  resetPassword(token: "reset_token", newPassword: "NewPassword123") {
    message
  }
}
```

---

## Testing

To run unit and integration tests:

```bash
npm test
```

---

## License

This project is licensed under the MIT License.

---

