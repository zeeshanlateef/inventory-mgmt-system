from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.product import Product
from app.models.customer import Customer
from app.models.order import Order
from app.schemas.product import ProductResponse
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


class DashboardStats(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    total_revenue: float
    low_stock_products: List[ProductResponse]


@router.get("/", response_model=DashboardStats)
def get_dashboard(db: Session = Depends(get_db)):
    total_products = db.query(func.count(Product.id)).scalar() or 0
    total_customers = db.query(func.count(Customer.id)).scalar() or 0
    total_orders = db.query(func.count(Order.id)).scalar() or 0
    total_revenue = db.query(func.sum(Order.total_amount)).scalar() or 0
    low_stock = db.query(Product).filter(Product.quantity < 10).order_by(Product.quantity.asc()).limit(10).all()

    return DashboardStats(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        total_revenue=float(total_revenue),
        low_stock_products=low_stock
    )
