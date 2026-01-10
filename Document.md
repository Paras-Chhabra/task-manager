# TaskFlow - Advanced Task Management System

A full-stack task management application built with **Next.js**, **Express.js**, and **MongoDB**.

---

## 1. Environment Setup

### Prerequisites
- **Node.js** (v18+ recommended)
- **MongoDB** (Local instance or Atlas)

### Installation & Configuration

#### A. Database (MongoDB)
Ensure MongoDB is running locally on port `27017`.
```bash
# Start MongoDB locally (example command)
mongod --dbpath /path/to/data
```

#### B. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   The `.env` file is already configured with default values:
   ```env
   MONGO_URI=mongodb://localhost:27017/taskmanager
   JWT_SECRET=your_jwt_secret_here_change_in_production
   PORT=5001
   ```
4. Start the server:
   ```bash
   npm run dev
   ```
   *Server runs at: `http://localhost:5001`*

#### C. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the application:
   ```bash
   npm run dev
   ```
   *App available at: `http://localhost:3000`*

---

## 2. Database Schema

### User Collection
Stores user authentication details.
| Field | Type | Description |
|-------|------|-------------|
| `username` | String | Unique username (min 3 chars) |
| `email` | String | Unique email address |
| `password` | String | Hashed password (bcrypt) |
| `createdAt` | Date | Timestamp |

### Task Collection
Stores task information.
| Field | Type | Description |
|-------|------|-------------|
| `title` | String | Task title (indexed for search) |
| `description` | String | Detailed description (indexed) |
| `priority` | String | `Low`, `Medium`, `High` |
| `status` | String | `To Do`, `In Progress`, `Completed` |
| `dueDate` | Date | Deadline for the task |
| `owner` | ObjectId | Reference to `User` (Creator) |

---

## 3. API Usage and Endpoints

**Base URL:** `http://localhost:5001/api`

### Authentication
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| **POST** | `/auth/register` | Register new user | `{ "username": "...", "email": "...", "password": "..." }` |
| **POST** | `/auth/login` | Login user | `{ "email": "...", "password": "..." }` |
| **GET** | `/auth/me` | Get current user | *(Requires Bearer Token)* |

### Tasks
*All task endpoints require `Authorization: Bearer <token>` header.*

| Method | Endpoint | Description | Params / Body |
|--------|----------|-------------|---------------|
| **GET** | `/tasks` | Get all tasks | Query Params: `search`, `status`, `priority` |
| **POST** | `/tasks` | Create task | Body: `{ "title": "...", "priority": "...", ... }` |
| **PUT** | `/tasks/:id` | Update task | Body: Fields to update |
| **DELETE** | `/tasks/:id` | Delete task | - |
| **GET** | `/tasks/analytics` | Get statistics | Returns counts: `{ total, completed, pending }` |

---

### API Response Format

**Success (200/201):**
```json
{
  "_id": "65ae...",
  "title": "Task Name",
  "status": "To Do",
  ...
}
```

**Error (4xx/5xx):**
```json
{
  "message": "Error description here"
}
```
