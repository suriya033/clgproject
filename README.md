# College Management Mobile Application

A secure and scalable mobile application built with React Native (Expo) and Node.js.

## Features
- **Role-Based Access Control (RBAC)**: 11 distinct roles (Admin, Student, Staff, HOD, etc.)
- **Secure Authentication**: JWT-based login system.
- **Admin Module**: Full control over user accounts (Create, Read, Update, Delete).
- **Premium UI**: Modern design with Lucide icons and smooth transitions.

## Tech Stack
- **Frontend**: React Native, Expo, React Navigation, Axios.
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT, Bcrypt.

## Getting Started

### Backend
1. Navigate to the backend folder: `cd backend`
2. Install dependencies: `npm install`
3. Start the server: `npm start`
   - *Note: Ensure your IP is whitelisted in MongoDB Atlas if using the provided URI.*

### Frontend
1. Navigate to the frontend folder: `cd frontend`
2. Install dependencies: `npm install`
3. Start the app: `npx expo start`

## Default Admin Credentials
- **User ID**: `admin`
- **Password**: `admin123`

## Roles Supported
- Admin
- Student
- Staff
- HOD
- Transport
- Library
- Hostel
- Placement
- Sports
- Office / Accounts
- Examination Cell
