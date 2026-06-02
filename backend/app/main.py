from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import products, customers, orders, dashboard
import os

# Import models to ensure they are registered with SQLAlchemy
from app.models import Product, Customer, Order, OrderItem

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Inventory & Order Management API",
    description="Production-ready API for managing products, customers, and orders.",
    version="1.0.0"
)

# CORS
cors_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://localhost:5173,https://inventory-mgmt-system.vercel.app,https://inventory-mgmt-system-frontend.vercel.app,https://inventory-mgmt-system-mu.vercel.app"
).split(",")
cors_origins = [origin.strip() for origin in cors_origins]

# If '*' is in allowed origins, we must set allow_credentials to False to prevent FastAPI startup error
allow_credentials = True
if "*" in cors_origins:
    allow_credentials = False

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(dashboard.router)


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "Inventory Management API is running"}


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}
