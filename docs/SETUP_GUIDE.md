# MediHelp — Complete Setup Guide (Beginners)

> **No prior experience needed.** This guide walks you through every tool and account you need, step by step, on **Windows** and **Linux**.

If you already know what you're doing, head back to the [main README](../README.md) for the quick setup.

---

## Table of Contents

1. [Install Node.js & npm](#1-install-nodejs--npm)
2. [Install MongoDB](#2-install-mongodb)
3. [Install Git & Clone the Project](#3-install-git--clone-the-project)
4. [Install Project Dependencies](#4-install-project-dependencies)
5. [Configure Environment (config.env)](#5-configure-environment)
   - [Port](#51-port)
   - [MongoDB URI](#52-mongodb-uri)
   - [JWT Secret](#53-jwt-secret)
   - [Email (Gmail) — Optional](#54-email-gmail--optional)
   - [Twilio SMS — Optional](#55-twilio-sms--optional)
6. [Run the Automated Setup Script](#6-run-the-automated-setup-script)
7. [Seed Sample Data](#7-seed-sample-data)
8. [Start the App](#8-start-the-app)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Install Node.js & npm

Node.js is the JavaScript runtime that powers the backend. npm (Node Package Manager) comes bundled with it.

### Windows

1. Go to [https://nodejs.org](https://nodejs.org)
2. Download the **LTS** version (green button)
3. Run the installer — accept all defaults, make sure **"Add to PATH"** is checked
4. Open **Command Prompt** or **PowerShell** and verify:
   ```
   node --version
   npm --version
   ```
   You should see version numbers like `v18.x.x` and `9.x.x`.

### Linux (Ubuntu / Debian)

```bash
# Update package list
sudo apt update

# Install Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version
npm --version
```

### Linux (Fedora / RHEL)

```bash
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install -y nodejs
```

---

## 2. Install MongoDB

MongoDB is the database where all user accounts, appointments, messages, etc. are stored.

### Option A: MongoDB Atlas (Cloud — Easiest, No Installation)

If you don't want to install anything on your machine:

1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click **"Try Free"** and create an account (Google sign-in works)
3. Create a **free M0 cluster** (choose any cloud provider and region)
4. In the left sidebar, click **Database Access** → **Add New Database User**
   - Username: `medihelp` (or anything you like)
   - Password: click **Autogenerate** and **copy it somewhere safe**
   - Role: **Read and write to any database**
   - Click **Add User**
5. In the left sidebar, click **Network Access** → **Add IP Address**
   - Click **Allow Access from Anywhere** (for development)
   - Click **Confirm**
6. Go back to **Database** → click **Connect** on your cluster
   - Choose **Drivers** → **Node.js**
   - Copy the connection string. It looks like:
     ```
     mongodb+srv://medihelp:<password>@cluster0.xxxxx.mongodb.net/medihelp
     ```
   - Replace `<password>` with the password you created in step 4
   - Add `/medihelp` at the end (before any `?`) — this is your database name

**Your `MONGO_URI` will be:** `mongodb+srv://medihelp:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/medihelp`

### Option B: Local MongoDB (Windows)

1. Go to [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Download the **MSI installer** for Windows
3. Run it — choose **Complete** installation
4. Check **"Install MongoDB as a Service"** (this makes it start automatically)
5. Finish the installer
6. Verify it's running — open Command Prompt:
   ```
   mongosh
   ```
   If you see a `>` prompt, MongoDB is running.

**Your `MONGO_URI` will be:** `mongodb://localhost:27017/medihelp`

### Option B: Local MongoDB (Linux — Ubuntu/Debian)

```bash
# Import MongoDB public key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
  sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg

# Add repository (Ubuntu 22.04 example)
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
  sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod    # Start on boot

# Verify
mongosh
```

**Your `MONGO_URI` will be:** `mongodb://localhost:27017/medihelp`

---

## 3. Install Git & Clone the Project

### Windows

1. Download Git from [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. Run installer — accept all defaults
3. Open **Git Bash** (installed with Git) or **Command Prompt**:
   ```bash
   git clone https://github.com/BhargavShekokar3425/medihelppvt.git
   cd medihelppvt
   ```

### Linux

```bash
sudo apt install -y git    # Ubuntu/Debian
# or: sudo dnf install -y git   # Fedora

git clone https://github.com/BhargavShekokar3425/medihelppvt.git
cd medihelppvt
```

---

## 4. Install Project Dependencies

Inside the `medihelppvt` folder, run:

```bash
npm run install-all
```

This installs packages for both the frontend (React) and backend (Express) in one go. It may take 1–3 minutes depending on your internet speed.

---

## 5. Configure Environment

This is where you set up your personal secrets. **Every developer has their own config.**

### Quick Way (Recommended)

Run the automated setup script — it does everything below for you:

```bash
node scripts/setup.js
```

See [Section 6](#6-run-the-automated-setup-script) for details.

### Manual Way

Copy the example file:

```bash
# Linux / Mac / Git Bash
cp backend/config/config.env.example backend/config/config.env

# Windows (Command Prompt)
copy backend\config\config.env.example backend\config\config.env
```

Then open `backend/config/config.env` in any text editor and fill in each value:

---

### 5.1 Port

```env
PORT=5000
```

This is the port the backend server runs on. Default `5000` works for most people. If you get an error like "port already in use", change it to `5001`, `8000`, etc.

---

### 5.2 MongoDB URI

```env
MONGO_URI=mongodb://localhost:27017/medihelp
```

- **Local MongoDB:** Use `mongodb://localhost:27017/medihelp`
- **Atlas (cloud):** Use the connection string from [Section 2 Option A](#option-a-mongodb-atlas-cloud--easiest-no-installation)

---

### 5.3 JWT Secret

```env
JWT_SECRET=your_very_long_random_string_here
```

**What is this?** JWT (JSON Web Token) is how the app verifies that a logged-in user is who they say they are. The secret is a random password that signs these tokens. **Every installation must have a unique one.**

**How to generate it:**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

This prints a long random string like `a3f8b2c1d4e5...`. Copy the entire output and paste it as your `JWT_SECRET`.

> **Never share your JWT secret.** If someone knows it, they can forge login tokens.

---

### 5.4 Email (Gmail) — Optional

```env
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
```

Used for sending emergency SOS email alerts. **If you skip this, the app still works** — email notifications just won't send.

**How to get an App Password (required if you use Gmail):**

1. Go to [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Make sure **2-Step Verification** is turned ON
3. Go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
4. Select **"Other (Custom name)"** → type `MediHelp` → click **Generate**
5. Google shows a 16-character password like `abcd efgh ijkl mnop`
6. Copy it into `EMAIL_PASS` (spaces included is fine)

---

### 5.5 Twilio SMS — Optional

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

Used for sending SMS alerts during emergencies. **If you skip this, the app still works** — SMS just won't send.

**How to set up Twilio (free trial):**

1. Go to [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up for a free account
3. Verify your phone number
4. From the Twilio Console dashboard, copy:
   - **Account SID** → paste into `TWILIO_ACCOUNT_SID`
   - **Auth Token** → paste into `TWILIO_AUTH_TOKEN`
5. Click **"Get a Trial Phone Number"** → copy the number (e.g. `+15551234567`) → paste into `TWILIO_PHONE_NUMBER`

> **Free trial limits:** You can only send SMS to your verified phone number. Upgrade to send to any number.

---

## 6. Run the Automated Setup Script

Instead of manually editing `config.env`, you can run:

```bash
node scripts/setup.js
```

The script will:

1. Check if Node.js and MongoDB are installed
2. Create `backend/config/config.env` from the template
3. **Automatically generate** a unique JWT secret for you
4. Ask you for your MongoDB URI (or use the default local one)
5. Optionally ask for email and Twilio credentials
6. Install all dependencies if not already installed
7. Verify the MongoDB connection

It works on both **Windows** and **Linux** — no bash required.

---

## 7. Seed Sample Data

To populate the database with sample doctors and patients for testing:

```bash
cd backend
node seed.js
```

This creates demo accounts you can log in with immediately.

---

## 8. Start the App

From the project root (`medihelppvt` folder):

```bash
npm run dev
```

This starts both servers:

| Service | URL |
|---|---|
| Frontend (React) | [http://localhost:5001](http://localhost:5001) |
| Backend API | [http://localhost:5000/api](http://localhost:5000/api) |

Open [http://localhost:5001](http://localhost:5001) in your browser — you should see the MediHelp landing page!

To stop the servers, press `Ctrl + C` in the terminal.

---

## 9. Troubleshooting

### "command not found: node"

Node.js isn't installed or isn't in your PATH. Reinstall from [nodejs.org](https://nodejs.org) and make sure "Add to PATH" is checked.

### "command not found: mongosh" or MongoDB won't connect

- **Windows:** Open Services (`Win + R` → `services.msc`) → find "MongoDB Server" → make sure it's **Running**
- **Linux:** Run `sudo systemctl start mongod`
- **Atlas:** Make sure your IP is allowed in Network Access and the password is correct

### "EADDRINUSE: port already in use"

Another program is using port 5000 or 5001. Either:
- Close the other program, or
- Change `PORT` in `config.env` to a different number (e.g. `8000`)

### "Cannot find module" errors

Run `npm run install-all` again from the project root.

### "ECONNREFUSED 127.0.0.1:27017"

MongoDB isn't running locally. Either start it (`sudo systemctl start mongod` on Linux) or switch to Atlas (cloud).

### Still stuck?

Open an issue at [github.com/BhargavShekokar3425/medihelppvt/issues](https://github.com/BhargavShekokar3425/medihelppvt/issues) with:
- Your OS (Windows/Linux/Mac)
- The full error message
- What step you were on

---

<p align="center">
  <a href="../README.md">← Back to Main README</a>
</p>
