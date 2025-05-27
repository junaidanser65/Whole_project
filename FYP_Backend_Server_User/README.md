# Fiesta Carts Vendor App Backend

This is the backend API for the Fiesta Carts Vendor App, providing authentication services for vendors.

## Features

- User authentication (signup and login)
- JWT token-based authentication
- MySQL database integration
- Input validation
- Error handling

## API Endpoints

### Authentication

- `POST /api/signup` - Register a new vendor
  - Request body: `{ "name": "Vendor Name", "email": "vendor@example.com", "password": "password123", "cnic_number": "12345-1234567-1" }`
  - Response: `{ "success": true, "message": "User registered successfully", "token": "jwt_token", "user": { ... } }`

- `POST /api/login` - Login as a vendor
  - Request body: `{ "email": "vendor@example.com", "password": "password123" }`
  - Response: `{ "success": true, "message": "Login successful", "token": "jwt_token", "user": { ... } }`

## Setup Instructions

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a MySQL database named `fiesta_vendor_app`
4. Configure environment variables in `.env` file
5. Start the server: `npm start` or `npm run dev` for development

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=fiesta_vendor_app
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

## Database Schema

### Users Table

- `id` - INT, AUTO_INCREMENT, PRIMARY KEY
- `name` - VARCHAR(100), NOT NULL
- `email` - VARCHAR(100), NOT NULL, UNIQUE
- `password` - VARCHAR(255), NOT NULL (bcrypt hashed)
- `cnic_number` - VARCHAR(50), NULL
- `created_at` - TIMESTAMP, DEFAULT CURRENT_TIMESTAMP
- `updated_at` - TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP