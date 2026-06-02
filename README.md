# 📦 InventoryPro — Inventory & Order Management System

A production-ready, fully containerized full-stack web application for managing products, customers, and orders.

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite, React Router DOM, Axios |
| **Backend** | Python 3.11, FastAPI, SQLAlchemy 2.0, Pydantic v2 |
| **Database** | PostgreSQL 15 |
| **Containerization** | Docker + Docker Compose |
| **Frontend Server** | Nginx (Alpine) |

---

## 📁 Project Structure

```
inventory-management/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app, CORS, startup
│   │   ├── database.py        # SQLAlchemy engine + session
│   │   ├── models/            # SQLAlchemy ORM models
│   │   ├── schemas/           # Pydantic request/response schemas
│   │   └── routers/           # API route handlers
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable Layout components
│   │   ├── pages/             # Dashboard, Products, Customers, Orders
│   │   ├── services/          # Axios API layer
│   │   └── context/           # Toast notification context
│   ├── Dockerfile             # Multi-stage: Node build + Nginx serve
│   ├── nginx.conf
│   └── .env.example
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- [Git](https://git-scm.com/)
- [Node.js 20+](https://nodejs.org/) (only if running frontend without Docker)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/inventory-management.git
cd inventory-management
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
```

Edit `.env` if you want to change the database password (optional for local dev):
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=yourpassword
POSTGRES_DB=inventory_db
VITE_API_URL=http://localhost:8000
CORS_ORIGINS=http://localhost:3000,http://localhost:80
```

### 3. Build and Start All Services
```bash
docker-compose up --build
```

This will:
1. Pull PostgreSQL 15 Alpine image
2. Build the FastAPI backend image
3. Build the React frontend image (multi-stage: Node → Nginx)
4. Start all 3 services

### 4. Access the Application

| Service | URL |
|---------|-----|
| **Frontend** (React) | http://localhost:3000 |
| **Backend API** (FastAPI) | http://localhost:8000 |
| **API Documentation** (Swagger) | http://localhost:8000/docs |
| **API Documentation** (ReDoc) | http://localhost:8000/redoc |
| **PostgreSQL** | localhost:5432 |

### 5. Stop the Application
```bash
docker-compose down
```

To also remove the database volume:
```bash
docker-compose down -v
```

---

## 🛠️ Running Without Docker (Development Mode)

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt

# Set environment variable
set DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inventory_db  # Windows
# export DATABASE_URL=...    # macOS/Linux

uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env         # VITE_API_URL=http://localhost:8000
npm run dev                  # Runs on http://localhost:3000
```

---

## 📡 API Reference

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/products` | Create a new product |
| `GET` | `/products` | List all products |
| `GET` | `/products?low_stock=true` | List low-stock products (< 10 units) |
| `GET` | `/products/{id}` | Get product by ID |
| `PUT` | `/products/{id}` | Update product |
| `DELETE` | `/products/{id}` | Delete product |

### Customers

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/customers` | Create a new customer |
| `GET` | `/customers` | List all customers |
| `GET` | `/customers/{id}` | Get customer by ID |
| `DELETE` | `/customers/{id}` | Delete customer |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/orders` | Create a new order (deducts stock) |
| `GET` | `/orders` | List all orders |
| `GET` | `/orders/{id}` | Get order with full details |
| `DELETE` | `/orders/{id}` | Cancel order (restores stock) |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/dashboard` | Summary stats + low stock products |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API status |
| `GET` | `/health` | Health check |

---

## ⚙️ Business Logic

- **SKU uniqueness**: Enforced at DB level; returns HTTP 409 on duplicate
- **Email uniqueness**: Same as SKU
- **Quantity ≥ 0**: Enforced by Pydantic schema + DB CHECK constraint
- **Insufficient stock**: Returns HTTP 422 with specific error message
- **Order creation**: Uses `SELECT FOR UPDATE` for concurrent-safe stock deduction
- **Order cancellation**: Automatically restores stock quantities
- **Total calculation**: Computed server-side as `Σ(unit_price × quantity)`

---

## 🌐 Deployment Guide

### Option A: Backend on Render + Frontend on Vercel (Recommended Free)

#### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: Inventory Management System"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/inventory-management.git
git push -u origin main
```

#### Step 2: Deploy Backend on Render

1. Go to [render.com](https://render.com) and sign up/login
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `inventory-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add a **PostgreSQL** database:
   - Click **New** → **PostgreSQL**
   - Name it `inventory-db`
   - Copy the **Internal Database URL**
6. Add environment variables to the Web Service:
   ```
   DATABASE_URL=<paste Internal Database URL from step 5>
   CORS_ORIGINS=https://your-frontend.vercel.app
   ```
7. Click **Deploy**
8. Note your backend URL: `https://inventory-backend-xxxx.onrender.com`

#### Step 3: Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click **New Project** → Import your GitHub repo
3. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variable:
   ```
   VITE_API_URL=https://inventory-backend-xxxx.onrender.com
   ```
5. Click **Deploy**
6. Note your frontend URL: `https://inventory-app-xxxx.vercel.app`

#### Step 4: Update CORS on Backend

Go back to Render → your backend service → Environment Variables:
```
CORS_ORIGINS=https://inventory-app-xxxx.vercel.app,http://localhost:3000
```
Redeploy the backend.

---

### Option B: Backend on Railway

1. Go to [railway.app](https://railway.app) and sign up
2. Click **New Project** → **Deploy from GitHub repo**
3. Add a **PostgreSQL** plugin
4. Set environment variables:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   CORS_ORIGINS=https://your-frontend.vercel.app
   ```
5. Set `Root Directory` to `backend`
6. Set **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

---

## 🐳 Docker Hub (Optional)

To push the backend image to Docker Hub:

```bash
# Login to Docker Hub
docker login

# Build the image
docker build -t YOUR_DOCKERHUB_USERNAME/inventory-backend:latest ./backend

# Push to Docker Hub
docker push YOUR_DOCKERHUB_USERNAME/inventory-backend:latest
```

To use from Docker Hub in docker-compose:
```yaml
backend:
  image: YOUR_DOCKERHUB_USERNAME/inventory-backend:latest
  # (remove the build: section)
```

---

## 🔒 Security Notes

- Never commit the `.env` file (it's in `.gitignore`)
- Change `POSTGRES_PASSWORD` in production
- Update `CORS_ORIGINS` to only include your actual frontend domain in production
- Consider adding API authentication (JWT) for production use

---

## 📊 Database Schema

```
products
├── id (PK)
├── name
├── sku (UNIQUE)
├── price (DECIMAL, >= 0)
├── quantity (INT, >= 0)
├── description
├── created_at
└── updated_at

customers
├── id (PK)
├── full_name
├── email (UNIQUE)
├── phone
├── created_at
└── updated_at

orders
├── id (PK)
├── customer_id (FK → customers.id)
├── status (pending|confirmed|cancelled)
├── total_amount
├── created_at
└── updated_at

order_items
├── id (PK)
├── order_id (FK → orders.id, CASCADE DELETE)
├── product_id (FK → products.id)
├── quantity
└── unit_price
```

---

## 📝 License

MIT License — free to use, modify, and distribute.
