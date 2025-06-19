# MediHelpPvt

MediHelpPvt is a full-stack healthcare platform designed to connect patients, doctors, and emergency services. It provides secure authentication, appointment scheduling, real-time chat, emergency SOS, reviews, and a hospital directory—all in a modern web application.

---

## Features

- **User Authentication:** Register and login as patient, doctor, or admin (JWT/Firebase supported)
- **Profile Management:** Update and view user profiles with role-based access
- **Doctor Directory:** Browse/search doctors, view profiles, filter by specialty
- **Appointment Scheduling:** Book, reschedule, cancel appointments; doctors manage their schedules and patient lists
- **Emergency SOS:** Send emergency requests with geolocation; notifies nearby hospitals by email/SMS
- **Chat/Messaging:** Real-time chat between patients and doctors, with unread tracking
- **Reviews:** Patients can submit/view reviews for doctors and hospitals
- **Hospital Directory:** List hospitals with services, contact, and location
- **Notifications:** Email and SMS for emergencies and reminders
- **Admin Tools:** System health checks and database repair endpoints

---

## Tech Stack

- **Frontend:** React 18+, React Router, Material UI/Chakra UI, Framer Motion
- **Backend:** Node.js, Express 4.x
- **Database:** MongoDB (with Mongoose) or in-memory (for demo/dev)
- **Authentication:** JWT, Firebase Auth (optional)
- **Notifications:** Nodemailer (email), Twilio (SMS)
- **Dev Tools:** ESLint, Nodemon, Concurrently, dotenv

---

## Getting Started

### 1. Clone the repository

git clone https://github.com/BhargavShekokar3425/medihelppvt.git
cd medihelppvt

text

### 2. Install dependencies

npm run install-all


### 3. Configure environment variables

- Copy `.env.example` to `.env`
- Fill in secrets for email, Twilio, JWT, etc.

### 4. Start development servers

npm run dev

text

- Frontend: [http://localhost:5001](http://localhost:5001)
- Backend API: [http://localhost:5000/api](http://localhost:5000/api)

---

## Environment Variables

See `.env.example` for all required variables. Example:

PORT=5001
FRONTEND_URL=http://localhost:5001
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_password
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
REACT_APP_API_URL=http://localhost:5001/api

text


## API Highlights

- **Auth:** `/api/auth/login`, `/api/auth/register`
- **Users:** `/api/users/profile`, `/api/users/doctors`, `/api/users/patients`
- **Appointments:** `/api/appointments`, `/api/appointments/doctor`, `/api/appointments/check-availability`
- **Emergency:** `/api/emergency/sos`, `/api/emergency/:id`, `/api/emergency/hospitals`
- **Chat:** `/api/chat/conversations`, `/api/chat/messages`, `/api/chat/send`
- **Reviews:** `/api/reviews`
- **System Health:** `/api/health`, `/api/monitor/metrics`

---

## How It Works

- **Authentication:** Secure JWT tokens for all users; optional Firebase integration
- **Appointments:** Patients and doctors can book, update, or cancel; conflict checks and notifications included
- **Emergency SOS:** Sends geolocation and user info to hospitals via email/SMS; tracks status
- **Chat:** Real-time, role-based chat between patients and doctors
- **Persistence:** Data saved to disk in dev; MongoDB recommended for production
- **Security:** Passwords hashed, JWT tokens, role-based access
- **Monitoring:** Health check and system metrics for admins

---

## Scripts

npm run install-all # Install all dependencies for frontend and backend
npm run dev # Run backend and frontend concurrently in development mode
npm run server # Start backend server only
npm start # Start React frontend only

text

---

## License

MIT

---

## Credits

Developed as a Software Engineering Project by:
Bhargav Shekokar
Saher Dev
Namya Dhingra
Devesh Labana
Ishan Bhambhare
Nitish Gupta

---

## Contact

For queries or contributions, open an issue or contact the maintainer via mail: bnshekokar@gmail.com
