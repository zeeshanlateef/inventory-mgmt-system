from pydantic import BaseModel, Field, ConfigDict
from decimal import Decimal
from datetime import datetime
from typing import List, Optional
from app.schemas.product import ProductResponse
from app.schemas.customer import CustomerResponse


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)


class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    product: ProductResponse
    quantity: int
    unit_price: Decimal


class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate] = Field(..., min_length=1)


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_id: int
    customer: CustomerResponse
    items: List[OrderItemResponse]
    status: str
    total_amount: Decimal
    created_at: datetime
    updated_at: Optional[datetime] = None
