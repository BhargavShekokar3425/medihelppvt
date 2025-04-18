# MediHelp Application

## Setup Instructions

### Prerequisites
- Node.js (v14 or newer)
- npm (comes with Node.js)

### Installation Steps

1. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Install frontend dependencies:
   ```bash
   cd ..
   npm install
   ```

3. Create a `.env` file in the backend directory based on the sample configuration in `config.env`

### Running the Application

1. Start both backend and frontend:
   ```bash
   npm start
   ```

2. Or run them separately:
   - Backend: `cd backend && npm start`
   - Frontend: `npm run client`

### Troubleshooting

If you encounter an error like "Cannot find module 'socket.io'" or any other missing module:

1. Make sure you've installed dependencies for both frontend and backend:
   ```bash
   cd backend && npm install
   cd .. && npm install
   ```

2. Check if the package is properly listed in package.json and reinstall if needed:
   ```bash
   npm install socket.io@4.7.2 --save
   ```

## Features

- Real-time chat using Socket.io
- User authentication with JWT
- Doctor appointment scheduling
- Prescription management
- Patient-doctor communication
- And more...

## Technology Stack

- Frontend: React.js
- Backend: Node.js with Express
- Real-time Communication: Socket.io
- Database: In-memory data store
- Authentication: JWT
