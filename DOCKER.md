# Docker Guide for Blog Application

This project is fully dockerized to ensure consistency across development and production environments. It uses **Next.js (standalone output)**, **MongoDB**, and **Mongo Express**.

---

## 🚀 Quick Start

1.  **Prepare Environment Variables**
    Copy the example environment file and fill in the required secrets:
    ```bash
    cp .env.example .env
    ```
    *Note: Ensure `AUTH_SECRET` is set. You can generate one using `npx auth secret`.*

2.  **Build and Start Containers**
    ```bash
    docker-compose up --build
    ```
    - **App:** [http://localhost:3000](http://localhost:3000)
    - **Database Admin (Mongo Express):** [http://localhost:8081](http://localhost:8081)

---

## 🧠 Core Concepts

### Dockerfile vs. Docker Compose

| File | Analogy | Role in this Project |
| :--- | :--- | :--- |
| **Dockerfile** | The Recipe | Defines how to build the **Next.js image**. It installs Node.js, copies your code, and builds the app for production. |
| **docker-compose.yml** | The Orchestrator | Manages the **entire stack**. it tells Docker to start the App, MongoDB, and Mongo Express together and connects them via a private network. |

---

## 🛠️ Common Docker Commands

### 1. Management
- **Start in background:** `docker-compose up -d`
- **Stop containers:** `docker-compose down`
- **Stop and remove volumes (Wipe Database):** `docker-compose down -v`
- **Restart a specific service:** `docker-compose restart app`

### 2. Monitoring & Logs
- **View all logs:** `docker-compose logs -f`
- **View app logs only:** `docker-compose logs -f app`
- **Check container status:** `docker-compose ps`

### 3. Execution
- **Access App Shell:** `docker exec -it blog-app sh`
- **Access MongoDB Shell:** `docker exec -it mongodb mongosh`

---

## 🏗️ Services Overview

| Service | Port | Description |
| :--- | :--- | :--- |
| **app** | 3000 | Next.js frontend and API routes. |
| **mongodb** | 27017 | Primary database storing posts, users, and comments. |
| **mongo-express** | 8081 | Web-based GUI for MongoDB management. |

---

## 📝 Configuration Details

### Standalone Build
The `Dockerfile` uses Next.js **Output Tracing**. This drastically reduces image size by only including files necessary for production. This requires `output: 'standalone'` in `next.config.ts`.

### Database Connection
Inside the Docker network, the app connects to MongoDB using:
`MONGODB_URI=mongodb://mongodb:27017/blog`
*(Note the hostname is `mongodb`, matching the service name in `docker-compose.yml`)*

### Persistence
Database data is persisted in a Docker volume named `mongodb_data`. Your data will remain even if you stop or delete the containers, unless you run `docker-compose down -v`.

---

## ⚠️ Troubleshooting

- **Port Conflict:** If port 3000 or 27017 is already in use, change the mapping in `docker-compose.yml`.
- **Environment Changes:** If you modify `.env`, you must restart the containers: `docker-compose up -d`.
- **Build Errors:** If dependencies change, run `docker-compose up --build` to force a fresh install in the container.
