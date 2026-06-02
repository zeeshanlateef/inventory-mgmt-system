# 📦 InventoryPro — Containerized Inventory & Order Management System

[![Frontend Deployment](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel&logoColor=white)](https://inventory-mgmt-system-mu.vercel.app/)
[![Backend Deployment](https://img.shields.io/badge/Backend-Render-darkviolet?logo=render&logoColor=white)](https://inventory-mgmt-backend-code.onrender.com)
[![Database](https://img.shields.io/badge/Database-Neon_PostgreSQL-00e599?logo=postgresql&logoColor=white)](https://neon.tech)
[![Docker](https://img.shields.io/badge/Containerization-Docker-blue?logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An enterprise-ready, fully containerized full-stack web application designed to manage products, customers, and orders. Features real-time stock orchestration, automated total calculations, database constraints, and a responsive modern dashboard.

---

## 🔗 Live Deployments

* **🖥️ Live Demo Application:** [https://inventory-mgmt-system-mu.vercel.app/](https://inventory-mgmt-system-mu.vercel.app/)
* **⚙️ Live Backend REST API (Swagger Documentation):** [https://inventory-mgmt-backend-code.onrender.com/docs](https://inventory-mgmt-backend-code.onrender.com/docs)
* **💾 Production Database:** Hosted on Neon Serverless PostgreSQL (AWS Region `us-east-1`).

---

## 🏗️ Architecture & Component Workflow

```text
  ┌────────────────────────────────────────────────────────┐
  │                   React Client (Vite)                  │
  │            (https://...-mu.vercel.app)                 │
  └──────────────────────────┬─────────────────────────────┘
                             │ HTTPS (JSON)
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │                    FastAPI API Server                  │
  │           (https://...-code.onrender.com)              │
  └──────────────────────────┬─────────────────────────────┘
                             │ PostgreSQL Protocol
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │                Neon Serverless Database                │
  │                    (PostgreSQL 16)                     │
  └────────────────────────────────────────────────────────┘
```

* **Frontend:** Built with React 18, React Router v6, Axios, and styled using custom Vanilla CSS.
* **Backend:** Powered by Python 3.11 with FastAPI (ASGI framework) and SQLAlchemy 2.0 ORM.
* **Database:** Production PostgreSQL 16 hosted serverless on Neon with connection pooling enabled.
* **Containerization:** Production-ready multi-stage Dockerfiles for both frontend (Node build + Nginx serve) and backend (Slim Python).

---

## 🚀 Local Quick Start (Docker Compose)

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
* [Git](https://git-scm.com/) installed.

### 1. Clone the Repository
```bash
git clone https://github.com/zeeshanlateef/inventory-mgmt-system.git
cd inventory-mgmt-system
```

### 2. Configure Environment Variables
Copy `.env.example` at the root directory:
```bash
cp .env.example .env
```

Your `.env` should look like this:
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=changeme_in_production
POSTGRES_DB=inventory_db
DATABASE_URL=postgresql://postgres:changeme_in_production@db:5432/inventory_db
VITE_API_URL=http://localhost:8000
CORS_ORIGINS=http://localhost:3000,http://localhost:80
```

### 3. Run with Docker Compose
Build and run the entire stack (React, FastAPI, PostgreSQL) with a single command:
```bash
docker-compose up --build
```

Access the services locally:
* **Frontend Application:** `http://localhost:3000`
* **FastAPI Docs (Swagger UI):** `http://localhost:8000/docs`
* **Backend Health Check:** `http://localhost:8000/health`

To stop all services:
```bash
docker-compose down -v
```

---

## 🛠️ Running Without Docker (Manual Development Setup)

### 🐍 Backend (FastAPI) Setup
1. Navigate to the backend directory and create a virtual environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # macOS/Linux
   venv\Scripts\activate     # Windows
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set your local environment variable for the database (e.g. SQLite for local fallback or a local Postgres instance):
   ```bash
   set DATABASE_URL=sqlite:///./inventory.db  # Windows Command Prompt
   # or export DATABASE_URL="sqlite:///./inventory.db" on macOS/Linux
   ```
4. Start the development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### ⚛️ Frontend (React/Vite) Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```
2. Copy the `.env.example` file:
   ```bash
   cp .env.example .env
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 📡 API Reference

### 📦 Products Endpoint

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/products` | Create a new product (validates non-negative quantity & unique SKU) |
| `GET` | `/products` | Retrieve all products |
| `GET` | `/products/{id}` | Retrieve a specific product by ID |
| `PUT` | `/products/{id}` | Update product details |
| `DELETE` | `/products/{id}` | Delete a product |

### 👥 Customers Endpoint

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/customers` | Register a new customer (validates unique email format) |
| `GET` | `/customers` | Retrieve all customers |
| `GET` | `/customers/{id}` | Retrieve customer details by ID |
| `DELETE` | `/customers/{id}` | Delete a customer record |

### 🧾 Orders Endpoint

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/orders` | Create an order (validates stock, deducts inventory, calculates price) |
| `GET` | `/orders` | Retrieve all orders |
| `GET` | `/orders/{id}` | Retrieve details of a specific order |
| `DELETE` | `/orders/{id}` | Cancel/delete an order (automatically restores stock) |

---

## ⚙️ Core Business Logic Enforcements

* **SKU Uniqueness:** Database constraint prevents duplicate SKU codes (returns `400 Bad Request` or `409 Conflict`).
* **Email Uniqueness:** Customers cannot sign up with the same email.
* **Negative Stock Prevention:** Stock amounts are constrained to `ge=0`.
* **Atomic Transactions:** Order creation uses transaction locking (`SELECT FOR UPDATE`) to prevent race conditions during concurrent stock deductions.
* **Price Calculation:** Backend automatically calculates the sum: `Σ(unit_price * quantity)` for security.

---

## 💾 Database Schema

```text
  products
   ├── id (PK)
   ├── name (VARCHAR)
   ├── sku (VARCHAR, UNIQUE)
   ├── price (DECIMAL)
   └── quantity (INTEGER)

  customers
   ├── id (PK)
   ├── full_name (VARCHAR)
   ├── email (VARCHAR, UNIQUE)
   └── phone (VARCHAR)

  orders
   ├── id (PK)
   ├── customer_id (FK -> customers.id)
   ├── total_amount (DECIMAL)
   └── created_at (TIMESTAMP)

  order_items
   ├── id (PK)
   ├── order_id (FK -> orders.id, ON DELETE CASCADE)
   ├── product_id (FK -> products.id)
   ├── quantity (INTEGER)
   └── unit_price (DECIMAL)
```

---

## 🐳 Docker Hub Image Creation

To push the backend image to Docker Hub for deployment validation:

1. Log in to Docker Hub:
   ```bash
   docker login
   ```
2. Build the backend image tagged with your username:
   ```bash
   docker build -t <your-dockerhub-username>/inventory-mgmt-backend:latest ./backend
   ```
3. Push the image to Docker Hub:
   ```bash
   docker push <your-dockerhub-username>/inventory-mgmt-backend:latest
   ```

---

## 📝 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
