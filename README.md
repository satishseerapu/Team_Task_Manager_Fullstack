# Team Task Manager — Full-Stack Application

A full-stack team task management application built with **React + Vite** (frontend) and **Node.js + Express + MongoDB** (backend). It supports organization-based multi-tenancy, role-based access control, real-time notifications via Socket.IO, and rich analytics dashboards.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Sample Credentials](#sample-credentials)
- [API Endpoints](#api-endpoints)
- [Role-Based Access](#role-based-access)
- [Organization & Data Isolation](#organization--data-isolation)

---

## Features

### Authentication & Security
- JWT-based authentication with configurable expiry
- Secure password hashing with bcrypt
- Organization name and email uniqueness enforced at database level
- Every signup creates a **new organization** — the signing-up user becomes its **Admin**
- All data is strictly scoped per organization; no cross-org data leakage

### Dashboard & Analytics
- Personal task stats: total tasks, in-progress, completed, overdue
- Admin-only org stats: total members, total projects, org-wide task overview
- Interactive charts powered by Chart.js:
  - Task status distribution (pie chart)
  - Tasks per project (bar chart)
- "My Tasks" list aggregated across all projects

### Project Management
- Create, view, and delete projects
- Add and remove project members
- Admins see all org projects; members see only projects they belong to

### Task Management
- Create tasks with title, description, due date, and assigned user
- Filter tasks by status and assignee
- Update task status: `To Do → In Progress → Done`
- Reassign tasks; real-time notification sent to the assignee

### User & Organization Management (Admin Only)
- Create new organization members directly from the Admin panel
- Update member roles (Admin / Member)
- Remove members from the organization
- View all users in the organization

### Real-Time Notifications
- Socket.IO integration for instant push notifications
- Notifications on task assignment and project activity
- Mark individual or all notifications as read

---

## Tech Stack

### Backend
| Package | Version | Purpose |
|---------|---------|---------|
| Node.js | ≥ 18 | Runtime |
| Express | ^5.2 | HTTP framework |
| Mongoose | ^9.6 | MongoDB ODM |
| Socket.IO | ^4.8 | Real-time events |
| jsonwebtoken | ^9.0 | JWT auth |
| bcryptjs | ^3.0 | Password hashing |
| express-validator | ^7.3 | Request validation |
| dotenv | ^17 | Env config |
| nodemon | ^3.1 | Dev hot-reload |

### Frontend
| Package | Version | Purpose |
|---------|---------|---------|
| React | ^18.2 | UI framework |
| Vite | ^5.0 | Build tool & dev server |
| Redux Toolkit | ^2.11 | Global state management |
| React Router v6 | ^6.20 | Client-side routing |
| Axios | ^1.6 | HTTP client |
| Socket.IO Client | ^4.6 | Real-time events |
| Chart.js + react-chartjs-2 | ^4.4 / ^5.2 | Charts |
| Tailwind CSS | ^3.3 | Utility-first styling |
| date-fns | ^3.0 | Date formatting |

### Database
- **MongoDB Atlas** (cloud) — default
- Compatible with **MongoDB local** (just change `MONGO_URI`)

---

## Project Structure

```
Team_Task_Manager_Fullstack/
├── backend/
│   ├── server.js                  # Entry point — HTTP + Socket.IO server
│   ├── .env.example               # Environment variable template
│   └── src/
│       ├── app.js                 # Express app setup, middleware, routes
│       ├── config/
│       │   └── db.js              # MongoDB connection
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── projectController.js
│       │   ├── taskController.js
│       │   ├── userController.js
│       │   ├── notificationController.js
│       │   └── statsController.js
│       ├── middleware/
│       │   ├── auth.js            # protect + adminOnly guards
│       │   ├── errorHandler.js
│       │   └── validate.js
│       ├── models/
│       │   ├── User.js
│       │   ├── Organization.js
│       │   ├── Project.js
│       │   ├── Task.js
│       │   └── Notification.js
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── projectRoutes.js
│       │   ├── taskRoutes.js
│       │   ├── userRoutes.js
│       │   ├── notificationRoutes.js
│       │   └── statsRoutes.js
│       ├── socket/
│       │   └── socket.js          # Socket.IO event handlers
│       └── utils/
│           ├── jwt.js
│           └── response.js
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── .env.example
    └── src/
        ├── App.jsx                # Routes + auth/admin/guest guards
        ├── main.jsx
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── SignupPage.jsx
        │   ├── DashboardPage.jsx
        │   ├── ProjectsPage.jsx
        │   ├── ProjectDetailPage.jsx
        │   ├── TasksPage.jsx
        │   ├── NotificationsPage.jsx
        │   ├── ProfilePage.jsx
        │   └── AdminPage.jsx
        ├── components/
        │   ├── admin/
        │   ├── dashboard/
        │   ├── layout/
        │   ├── notifications/
        │   ├── projects/
        │   ├── tasks/
        │   └── ui/
        ├── context/               # AuthContext, NotificationContext, ToastContext
        ├── store/                 # Redux slices (auth, projects, tasks, stats, users)
        ├── hooks/                 # useDashboard, etc.
        ├── services/              # API service functions (authService, projectService…)
        └── utils/                 # storage, helpers
```

---

## Prerequisites

Make sure the following are installed on your machine:

- **Node.js** v18 or later — [nodejs.org](https://nodejs.org)
- **npm** v9 or later (bundled with Node.js)
- **MongoDB** — either:
  - A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster, **or**
  - MongoDB installed locally (v6+)
- **Git** — [git-scm.com](https://git-scm.com)

---

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/Team_Task_Manager_Fullstack.git
cd Team_Task_Manager_Fullstack
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

Open `backend/.env` and fill in your values (see [Environment Variables](#environment-variables) below).

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

Open `frontend/.env` and set `VITE_API_URL` to your backend URL (defaults to `http://localhost:5000`).

---

## Environment Variables

### `backend/.env`

```env
# Server
PORT=5000

# MongoDB
# Atlas example:
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/team_task_manager
# Local example:
# MONGO_URI=mongodb://localhost:27017/team_task_manager

# JWT
JWT_SECRET=replace_this_with_a_long_random_secret_string
JWT_EXPIRES_IN=7d

# CORS — must match your frontend URL
CLIENT_URL=http://localhost:5173
```

> **Important:** Never commit your `.env` file to version control. It is listed in `.gitignore`.

### `frontend/.env`

```env
VITE_API_URL=http://localhost:5000
```

---

## Running the Application

Open **two terminals** — one for the backend, one for the frontend.

### Terminal 1 — Backend

```bash
cd backend

# Development (hot-reload via nodemon)
npm run dev

# Production
npm start
```

Backend runs on **http://localhost:5000**

### Terminal 2 — Frontend

```bash
cd frontend

# Development
npm run dev

# Build for production
npm run build
npm run preview
```

Frontend runs on **http://localhost:5173**

> The Vite dev server proxies all `/api` and `/socket.io` requests to `http://localhost:5000` automatically — no CORS issues in development.

---

## API Endpoints

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/signup` | No | Create account + new organization (user becomes Admin) |
| POST | `/login` | No | Login, returns JWT token |
| GET | `/me` | Yes | Get current user profile |
| PATCH | `/me` | Yes | Update name or password |

### Projects — `/api/projects`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | Yes | Create a new project |
| GET | `/` | Yes | List org projects (all for Admin, own for Member) |
| GET | `/:id` | Yes | Get project details |
| POST | `/:id/members` | Yes | Add members to project |
| DELETE | `/:id/members` | Yes | Remove members from project |
| DELETE | `/:id` | Admin | Delete project |

### Tasks — `/api/tasks`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | Yes | Create a task |
| GET | `/project/:projectId` | Yes | List tasks for a project (filter by status/assignee) |
| GET | `/:id` | Yes | Get task details |
| PATCH | `/:id/assign` | Yes | Assign task to a user |
| PATCH | `/:id/status` | Yes | Update task status |
| PATCH | `/:id` | Yes | Update task title, description, due date |
| DELETE | `/:id` | Yes | Delete task |

### Users — `/api/users`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Admin | List all users in the organization |
| POST | `/` | Admin | Create a new user in the organization |
| PATCH | `/:id/role` | Admin | Update a user's role |
| DELETE | `/:id` | Admin | Remove a user from the organization |

### Notifications — `/api/notifications`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Yes | Get all notifications |
| PATCH | `/:id/read` | Yes | Mark a notification as read |
| PATCH | `/read-all` | Yes | Mark all notifications as read |

### Statistics — `/api/stats`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/org` | Admin | Get org-wide stats (tasks, projects, members, overdue) |

### Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Server health check |

---

## Role-Based Access

| Feature | Admin | Member |
|---------|-------|--------|
| Sign up (create new org) | Yes | — |
| View dashboard | Yes | Yes (personal stats only) |
| View org-wide stats & charts | Yes | No |
| Create projects | Yes | Yes |
| View all org projects | Yes | No (own projects only) |
| Delete projects | Yes | No |
| Create tasks | Yes | Yes |
| Assign tasks | Yes | Yes |
| Update / delete tasks | Yes | Yes (own tasks) |
| Create users | Yes | No |
| Update user roles | Yes | No |
| Delete users | Yes | No |
| View all org members | Yes | No |
| Receive real-time notifications | Yes | Yes |

---

## Organization & Data Isolation

- Every user belongs to exactly **one organization**
- Every project, task, and notification is tagged with an `organization` field
- All API queries are scoped to `organization: req.user.organization` — users can never access data outside their own org
- **Organization names are globally unique** — no two organizations can share the same name
- **Email addresses are globally unique** across the entire system
- New members are created by an Admin from within the application — there is no self-registration path into an existing organization

---

## Sample Credentials

Use these pre-seeded accounts to explore the application. Both accounts belong to the organization **"Test Organization"**.

### Admin Account

| Field | Value |
|-------|-------|
| **Email** | admin@testorganization.com |
| **Password** | Admin@123 |
| **Role** | Admin |
| **Access** | Full access — manage users, view org stats, create/delete projects, manage all tasks |

### Member Account

| Field | Value |
|-------|-------|
| **Email** | user@testorganization.com |
| **Password** | User@123 |
| **Role** | Member |
| **Access** | View and work on projects they are added to, manage their own tasks |

> **Note:** These accounts have been created in deployed application you can use these credentials to explore the application.