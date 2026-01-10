# Deployment Guide: TaskManager

 Follow these steps to deploy your application to the web.

## 1. Prerequisites: Cloud Database (MongoDB Atlas)

Since Render and Vercel cannot access your local computer's database, you need a cloud-hosted MongoDB.

1.  Go to **[MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)** and sign up (Free).
2.  Create a **Deployment** (choose M0 Free Tier).
3.  Create a **Database User** (Username/Password). **Write these down!**
4.  In "Network Access", allow access from **Anywhere (0.0.0.0/0)**.
5.  Get your **Connection String**:
    *   Click "Connect" -> "Drivers".
    *   Copy the string like: `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority`
    *   Replace `<username>` and `<password>` with your actual credentials.

---

## 2. Deploy Backend (Render)

1.  Push your code to **GitHub** (if you haven't already).
2.  Go to **[Render Dashboard](https://dashboard.render.com/)**.
3.  Click **New +** -> **Web Service**.
4.  Connect your GitHub repository.
5.  **Configuration**:
    *   **Root Directory**: `backend` (Important!)
    *   **Runtime**: Node
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
6.  **Environment Variables**:
    Add the following keys:
    *   `MONGO_URI`: *(Paste your Atlas connection string from Step 1)*
    *   `JWT_SECRET`: `lUe/u5RAq8+Xxu5e0xLBGMC1v4y/9btFTD0LfVUjico=`  *(Generated secure secret)*
    *   `PORT`: `5001` (Or let Render choose, typically it sets `PORT` automatically)
7.  Click **Deploy Web Service**.
8.  **Wait** until it says "Live". Copy the **onrender.com URL** (e.g., `https://taskmanager-backend.onrender.com`).

---

## 3. Deploy Frontend (Vercel)

1.  Go to **[Vercel Dashboard](https://vercel.com/dashboard)**.
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  **Configuration**:
    *   **Root Directory**: Click "Edit" and select `frontend`.
    *   **Framework Preset**: Next.js (should detect automatically).
5.  **Environment Variables**:
    *   `NEXT_PUBLIC_API_URL`: Paste your **Render Backend URL** + `/api`
        *   Example: `https://taskmanager-backend.onrender.com/api`
6.  Click **Deploy**.

---

## 4. Final Verification
Open your Vercel URL. Try to:
1.  **Register** a new user (this tests database connection).
2.  **Login** (tests JWT secret).
3.  **Create a Task** (tests full integration).
