from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

import shutil
import uuid
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from database import SessionLocal, engine, Base
import models
from models import Company, Shop, Product, Category, Customer, Order, OrderItem, Payment, ProductImageGroup, Image
import os
os.makedirs("static", exist_ok=True)

app = FastAPI(title="Retail Store API")

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
    return {"status": "ok"}


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


@app.get("/companies/{id}")
def get_company(id: int, db: Session = Depends(get_db)):
    obj = db.query(Company).filter(Company.id == id).first()
    if not obj:
        raise HTTPException(404)
    return obj


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

# ===============================
# CUSTOMERS
# ===============================
@app.post("/customers/")
def create_customer(name: str, phone_number: str | None = None, db: Session = Depends(get_db)):
    obj = Customer(name=name, phone_number=phone_number)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@app.get("/customers/")
def get_customers(db: Session = Depends(get_db)):
    return db.query(Customer).all()

# ===============================
# PRODUCTS
# ===============================
@app.post("/products/")
def create_product(
    shop_id: int,
    category_id: int,
    name: str,
    weight: int,
    price: float,
    stock_amount: int,
    db: Session = Depends(get_db)
):
    shop = db.query(Shop).filter(Shop.id == shop_id).first()

    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")

    category = db.query(Category).filter(Category.id == category_id).first()

    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    product = Product(
        shop_id=shop_id,
        category_id=category_id,
        name=name,
        weight=weight,
        price=price,
        stock_amount=stock_amount
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return product

@app.get("/products/cards")
def get_products_cards(db: Session = Depends(get_db)):
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

        result.append({
            "id": product.id,
            "name": product.name,
            "price": float(product.price),
            "stock": product.stock_amount,
            "category": category.name if category else "",
            "image": image,
            "rating": 4.8,
            "discount": 15
        })

    return result

@app.post("/products/{product_id}/image")
def upload_product_image(
    product_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # 1. проверка продукта
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(404, "Product not found")

    # 2. создаём группу (если нет)
    group = db.query(ProductImageGroup).filter(
        ProductImageGroup.product_id == product_id
    ).first()

    if not group:
        group = ProductImageGroup(product_id=product_id)
        db.add(group)
        db.commit()
        db.refresh(group)

    # 3. сохраняем файл
    filename = f"{uuid.uuid4()}.png"
    path = f"static/{filename}"

    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 4. сохраняем в БД
    img = Image(
        image_group_id=group.id,
        link=path
    )

    db.add(img)
    db.commit()
    db.refresh(img)

    return {"image": img.link}

@app.get("/products/")
def get_products(db: Session = Depends(get_db)):
    return db.query(Product).all()


@app.get("/products/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(404)

    group = db.query(ProductImageGroup).filter(
        ProductImageGroup.product_id == product_id
    ).first()

    images = []
    if group:
        images = db.query(Image).filter(Image.image_group_id == group.id).all()

    return {
        "product": product,
        "images": [img.link for img in images]
    }
# ===============================
# ORDERS
# ===============================
@app.post("/orders/")
def create_order(
    customer_id: int,
    courier_id: int | None,
    payment_id: int | None,
    delivery_address: str,
    db: Session = Depends(get_db)
):
    obj = Order(
        customer_id=customer_id,
        courier_id=courier_id,
        payment_id=payment_id,
        delivery_address=delivery_address,
        status="new"
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@app.get("/orders/")
def get_orders(db: Session = Depends(get_db)):
    return db.query(Order).all()

# ===============================
# ORDER ITEMS
# ===============================
@app.post("/order-items/")
def create_order_item(
    order_id: int,
    product_id: int,
    quantity: int,
    unit_price: float,
    db: Session = Depends(get_db)
):
    obj = OrderItem(
        order_id=order_id,
        product_id=product_id,
        quantity=quantity,
        unit_price=unit_price
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

# ===============================
# PAYMENTS
# ===============================
@app.post("/payments/")
def create_payment(bank_name: str, payment_link: str | None = None, db: Session = Depends(get_db)):
    obj = Payment(bank_name=bank_name, payment_link=payment_link)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj