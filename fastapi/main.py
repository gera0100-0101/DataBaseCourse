from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Body
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date, time
import decimal

import shutil
import uuid
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from database import SessionLocal, engine, Base
import models
from models import (
    Company, Shop, Product, Category, Manufacturer, Customer, 
    Order, OrderItem, Payment, ProductImageGroup, Image, 
    Post, Worker, Check
)
import os
os.makedirs("static", exist_ok=True)

app = FastAPI(title="Food Delivery Store API")

app.mount("/static", StaticFiles(directory="static"), name="static")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


# ===============================
# Pydantic Schemas
# ===============================
class ProductCreate(BaseModel):
    shop_id: int
    category_id: int
    manufacturer_id: Optional[int] = None
    name: str
    price: float
    weight: Optional[float] = None
    calories: Optional[float] = None
    structure: Optional[str] = None
    stock_amount: int = 0


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    weight: Optional[float] = None
    calories: Optional[float] = None
    structure: Optional[str] = None
    stock_amount: Optional[int] = None
    category_id: Optional[int] = None
    manufacturer_id: Optional[int] = None


class CartItem(BaseModel):
    product_id: int
    quantity: int


class OrderCreate(BaseModel):
    customer_name: str
    customer_phone: Optional[str] = None
    delivery_address: str
    items: List[CartItem]
    payment_method: str = "card"


class OrderResponse(BaseModel):
    id: int
    status: str
    total_price: float
    created_at: datetime
    
    class Config:
        from_attributes = True


# ===============================
# DB Session
# ===============================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ===============================
# ROOT
# ===============================
@app.get("/")
def root():
    return {"status": "ok", "message": "Food Delivery Store API"}


# ===============================
# MANUFACTURERS
# ===============================
@app.post("/manufacturers/")
def create_manufacturer(
    name: str,
    contact_person: Optional[str] = None,
    phone_number: Optional[str] = None,
    email: Optional[str] = None,
    location: Optional[str] = None,
    db: Session = Depends(get_db)
):
    obj = Manufacturer(
        name=name,
        contact_person=contact_person,
        phone_number=phone_number,
        email=email,
        location=location
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@app.get("/manufacturers/")
def get_manufacturers(db: Session = Depends(get_db)):
    return db.query(Manufacturer).all()


@app.delete("/manufacturers/{id}")
def delete_manufacturer(id: int, db: Session = Depends(get_db)):
    obj = db.query(Manufacturer).filter(Manufacturer.id == id).first()
    if not obj:
        raise HTTPException(404)
    db.delete(obj)
    db.commit()
    return {"ok": True}


# ===============================
# COMPANIES
# ===============================
@app.post("/companies/")
def create_company(name: str, db: Session = Depends(get_db)):
    obj = Company(company_name=name)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@app.get("/companies/")
def get_companies(db: Session = Depends(get_db)):
    return db.query(Company).all()


@app.delete("/companies/{id}")
def delete_company(id: int, db: Session = Depends(get_db)):
    obj = db.query(Company).filter(Company.id == id).first()
    if not obj:
        raise HTTPException(404)
    db.delete(obj)
    db.commit()
    return {"ok": True}


# ===============================
# SHOPS
# ===============================
@app.post("/shops/")
def create_shop(company_id: int, address: str, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    shop = Shop(company_id=company_id, address=address)
    db.add(shop)
    db.commit()
    db.refresh(shop)
    return shop


@app.get("/shops/")
def get_shops(db: Session = Depends(get_db)):
    return db.query(Shop).all()


@app.delete("/shops/{id}")
def delete_shop(id: int, db: Session = Depends(get_db)):
    obj = db.query(Shop).filter(Shop.id == id).first()
    if not obj:
        raise HTTPException(404)
    db.delete(obj)
    db.commit()
    return {"ok": True}


# ===============================
# CATEGORIES
# ===============================
@app.post("/categories/")
def create_category(name: str, description: str = "", db: Session = Depends(get_db)):
    category = Category(name=name, description=description)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@app.get("/categories/")
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()


@app.delete("/categories/{id}")
def delete_category(id: int, db: Session = Depends(get_db)):
    obj = db.query(Category).filter(Category.id == id).first()
    if not obj:
        raise HTTPException(404)
    db.delete(obj)
    db.commit()
    return {"ok": True}


# ===============================
# PRODUCTS - Admin Panel
# ===============================
@app.post("/admin/products/")
def admin_create_product(product: ProductCreate, db: Session = Depends(get_db)):
    """Admin endpoint to create a product"""
    shop = db.query(Shop).filter(Shop.id == product.shop_id).first()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")

    category = db.query(Category).filter(Category.id == product.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    manufacturer = None
    if product.manufacturer_id:
        manufacturer = db.query(Manufacturer).filter(Manufacturer.id == product.manufacturer_id).first()
        if not manufacturer:
            raise HTTPException(status_code=404, detail="Manufacturer not found")

    db_product = Product(
        shop_id=product.shop_id,
        category_id=product.category_id,
        manufacturer_id=product.manufacturer_id,
        name=product.name,
        price=decimal.Decimal(str(product.price)),
        weight=decimal.Decimal(str(product.weight)) if product.weight else None,
        calories=decimal.Decimal(str(product.calories)) if product.calories else None,
        structure=product.structure,
        stock_amount=product.stock_amount
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


@app.put("/admin/products/{product_id}")
def admin_update_product(product_id: int, product: ProductUpdate, db: Session = Depends(get_db)):
    """Admin endpoint to update a product"""
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = product.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "price" and value is not None:
            value = decimal.Decimal(str(value))
        elif field in ["weight", "calories"] and value is not None:
            value = decimal.Decimal(str(value))
        setattr(db_product, field, value)

    db.commit()
    db.refresh(db_product)
    return db_product


@app.delete("/admin/products/{product_id}")
def admin_delete_product(product_id: int, db: Session = Depends(get_db)):
    """Admin endpoint to delete a product"""
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(db_product)
    db.commit()
    return {"ok": True, "message": "Product deleted"}


@app.get("/admin/products/")
def admin_get_products(db: Session = Depends(get_db)):
    """Admin endpoint to get all products with full details"""
    products = db.query(Product).all()
    result = []
    for p in products:
        category = db.query(Category).filter(Category.id == p.category_id).first()
        manufacturer = db.query(Manufacturer).filter(Manufacturer.id == p.manufacturer_id).first() if p.manufacturer_id else None
        shop = db.query(Shop).filter(Shop.id == p.shop_id).first()
        
        group = db.query(ProductImageGroup).filter(ProductImageGroup.product_id == p.id).first()
        images = []
        if group:
            imgs = db.query(Image).filter(Image.image_group_id == group.id).all()
            images = [img.link for img in imgs]
        
        result.append({
            "id": p.id,
            "name": p.name,
            "price": float(p.price),
            "weight": float(p.weight) if p.weight else None,
            "calories": float(p.calories) if p.calories else None,
            "structure": p.structure,
            "stock_amount": p.stock_amount,
            "category": category.name if category else None,
            "manufacturer": manufacturer.name if manufacturer else None,
            "shop_address": shop.address if shop else None,
            "images": images
        })
    return result

@app.get("/products/cards")
def get_products_cards(db: Session = Depends(get_db)):
    """Get products for customer display"""
    products = db.query(Product).all()

    result = []

    for product in products:
        group = db.query(ProductImageGroup).filter(
            ProductImageGroup.product_id == product.id
        ).first()

        image = None

        if group:
            img = db.query(Image).filter(
                Image.image_group_id == group.id
            ).first()

            if img:
                image = img.link

        category = db.query(Category).filter(
            Category.id == product.category_id
        ).first()

        manufacturer = db.query(Manufacturer).filter(
            Manufacturer.id == product.manufacturer_id
        ).first() if product.manufacturer_id else None

        result.append({
            "id": product.id,
            "name": product.name,
            "price": float(product.price),
            "stock": product.stock_amount,
            "category": category.name if category else "",
            "manufacturer": manufacturer.name if manufacturer else "",
            "weight": float(product.weight) if product.weight else None,
            "calories": float(product.calories) if product.calories else None,
            "structure": product.structure,
            "image": image
        })

    return result


@app.get("/products/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get single product with details"""
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(404, detail="Product not found")

    group = db.query(ProductImageGroup).filter(
        ProductImageGroup.product_id == product_id
    ).first()

    images = []
    if group:
        images = db.query(Image).filter(Image.image_group_id == group.id).all()

    category = db.query(Category).filter(Category.id == product.category_id).first()
    manufacturer = db.query(Manufacturer).filter(Manufacturer.id == product.manufacturer_id).first() if product.manufacturer_id else None

    return {
        "id": product.id,
        "name": product.name,
        "price": float(product.price),
        "weight": float(product.weight) if product.weight else None,
        "calories": float(product.calories) if product.calories else None,
        "structure": product.structure,
        "stock_amount": product.stock_amount,
        "category": category.name if category else None,
        "manufacturer": manufacturer.name if manufacturer else None,
        "images": [img.link for img in images]
    }


# ===============================
# CART & ORDERS
# ===============================
@app.post("/orders/create")
def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    """Create a new order with items - handles cart checkout"""
    # Create or find customer
    customer = db.query(Customer).filter(
        Customer.name == order_data.customer_name,
        Customer.phone_number == order_data.customer_phone
    ).first()
    
    if not customer:
        customer = Customer(name=order_data.customer_name, phone_number=order_data.customer_phone)
        db.add(customer)
        db.commit()
        db.refresh(customer)

    # Create payment record
    payment = Payment(bank_name=order_data.payment_method, payment_link=None)
    db.add(payment)
    db.commit()
    db.refresh(payment)

    # Create order
    order = Order(
        customer_id=customer.id,
        payment_id=payment.id,
        delivery_address=order_data.delivery_address,
        status="new",
        created_at=datetime.now()
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    # Add order items and calculate total
    total_price = 0.0
    for item in order_data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        
        if product.stock_amount < item.quantity:
            raise HTTPException(status_code=400, detail=f"Not enough stock for {product.name}")

        # Reduce stock
        product.stock_amount -= item.quantity
        
        # Create order item
        order_item = OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=product.price
        )
        db.add(order_item)
        total_price += float(product.price) * item.quantity

    db.commit()

    # Create check
    check = Check(
        order_id=order.id,
        created_date=date.today(),
        created_time=datetime.now().time(),
        total_price=decimal.Decimal(str(total_price))
    )
    db.add(check)
    db.commit()

    # Update payment with link (simulate payment processing)
    payment.payment_link = f"/payments/{payment.id}/process"
    db.commit()

    return {
        "order_id": order.id,
        "status": order.status,
        "total_price": total_price,
        "created_at": order.created_at,
        "items_count": len(order_data.items),
        "payment_link": payment.payment_link
    }


@app.get("/orders/")
def get_orders(db: Session = Depends(get_db)):
    """Get all orders (admin view)"""
    orders = db.query(Order).all()
    result = []
    for order in orders:
        customer = db.query(Customer).filter(Customer.id == order.customer_id).first()
        items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
        check = db.query(Check).filter(Check.order_id == order.id).first()
        
        order_items = []
        for item in items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            order_items.append({
                "product_name": product.name if product else "Unknown",
                "quantity": item.quantity,
                "unit_price": float(item.unit_price),
                "total": float(item.unit_price) * item.quantity
            })
        
        result.append({
            "id": order.id,
            "customer": customer.name if customer else "Unknown",
            "delivery_address": order.delivery_address,
            "status": order.status,
            "created_at": order.created_at,
            "items": order_items,
            "total_price": float(check.total_price) if check else 0
        })
    return result


@app.get("/orders/{order_id}")
def get_order(order_id: int, db: Session = Depends(get_db)):
    """Get single order details"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(404, detail="Order not found")
    
    customer = db.query(Customer).filter(Customer.id == order.customer_id).first()
    items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    check = db.query(Check).filter(Check.order_id == order.id).first()
    
    order_items = []
    for item in items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        order_items.append({
            "product_id": item.product_id,
            "product_name": product.name if product else "Unknown",
            "quantity": item.quantity,
            "unit_price": float(item.unit_price),
            "total": float(item.unit_price) * item.quantity
        })
    
    return {
        "id": order.id,
        "customer": customer.name if customer else "Unknown",
        "customer_phone": customer.phone_number if customer else None,
        "delivery_address": order.delivery_address,
        "status": order.status,
        "created_at": order.created_at,
        "items": order_items,
        "total_price": float(check.total_price) if check else 0
    }


@app.patch("/orders/{order_id}/status")
def update_order_status(order_id: int, status: str, db: Session = Depends(get_db)):
    """Update order status (admin function)"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(404, detail="Order not found")
    
    valid_statuses = ["new", "confirmed", "preparing", "on_delivery", "delivered", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    order.status = status
    db.commit()
    db.refresh(order)
    
    return {"id": order.id, "status": order.status}


# ===============================
# PAYMENTS
# ===============================
@app.post("/payments/process/{payment_id}")
def process_payment(payment_id: int, db: Session = Depends(get_db)):
    """Simulate payment processing"""
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(404, detail="Payment not found")
    
    # Simulate successful payment
    return {
        "payment_id": payment.id,
        "bank_name": payment.bank_name,
        "status": "completed",
        "message": "Payment processed successfully"
    }


@app.get("/payments/")
def get_payments(db: Session = Depends(get_db)):
    """Get all payments (admin view)"""
    return db.query(Payment).all()


# ===============================
# IMAGE UPLOAD
# ===============================
@app.post("/products/{product_id}/image")
def upload_product_image(
    product_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload product image"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(404, "Product not found")

    group = db.query(ProductImageGroup).filter(
        ProductImageGroup.product_id == product_id
    ).first()

    if not group:
        group = ProductImageGroup(product_id=product_id)
        db.add(group)
        db.commit()
        db.refresh(group)

    filename = f"{uuid.uuid4()}.png"
    path = f"static/{filename}"

    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    img = Image(
        image_group_id=group.id,
        link=path
    )

    db.add(img)
    db.commit()
    db.refresh(img)

    return {"image": img.link}


# ===============================
# WORKERS & POSTS (Admin)
# ===============================
@app.post("/posts/")
def create_post(name: str, salary: float, db: Session = Depends(get_db)):
    """Create a job post (admin)"""
    obj = Post(name=name, salary=decimal.Decimal(str(salary)))
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@app.get("/posts/")
def get_posts(db: Session = Depends(get_db)):
    """Get all job posts"""
    return db.query(Post).all()


@app.post("/workers/")
def create_worker(full_name: str, post_id: Optional[int] = None, email: Optional[str] = None, phone_number: Optional[str] = None, db: Session = Depends(get_db)):
    """Create a worker (admin)"""
    obj = Worker(full_name=full_name, post_id=post_id, email=email, phone_number=phone_number)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@app.get("/workers/")
def get_workers(db: Session = Depends(get_db)):
    """Get all workers (for courier assignment)"""
    return db.query(Worker).all()