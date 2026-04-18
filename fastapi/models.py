from sqlalchemy import (
    Column, Integer, String, ForeignKey,
    Numeric, Text, Date, Time, DateTime
)
from sqlalchemy.orm import relationship
from database import Base


# =========================
# COMPANIES
# =========================
class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True)
    company_name = Column(String(255), nullable=False)

    shops = relationship("Shop", back_populates="company")


# =========================
# SHOPS
# =========================
class Shop(Base):
    __tablename__ = "shops"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    address = Column(Text, nullable=False)

    company = relationship("Company", back_populates="shops")
    products = relationship("Product", back_populates="shop")


# =========================
# CATEGORIES
# =========================
class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True)
    name = Column(String(150), unique=True, nullable=False)
    description = Column(Text)


# =========================
# MANUFACTURERS
# =========================
class Manufacturer(Base):
    __tablename__ = "manufacturers"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    contact_person = Column(String(255))
    phone_number = Column(String(50))
    email = Column(String(255))
    location = Column(Text)


# =========================
# PRODUCTS
# =========================
class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True)

    shop_id = Column(Integer, ForeignKey("shops.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"))
    manufacturer_id = Column(Integer, ForeignKey("manufacturers.id", ondelete="SET NULL"))

    name = Column(String(255), nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    weight = Column(Numeric(10, 3))
    calories = Column(Numeric(10, 2))
    structure = Column(Text)
    stock_amount = Column(Integer, default=0)

    shop = relationship("Shop", back_populates="products")


# =========================
# PRODUCT IMAGE GROUPS
# =========================
class ProductImageGroup(Base):
    __tablename__ = "product_image_groups"

    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)


# =========================
# IMAGES
# =========================
class Image(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True)
    image_group_id = Column(Integer, ForeignKey("product_image_groups.id", ondelete="CASCADE"), nullable=False)
    link = Column(Text, nullable=False)


# =========================
# CUSTOMERS
# =========================
class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    phone_number = Column(String(50))


# =========================
# PAYMENTS
# =========================
class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True)
    bank_name = Column(String(255), nullable=False)
    payment_link = Column(Text)


# =========================
# POSTS
# =========================
class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True)
    name = Column(String(150), nullable=False)
    salary = Column(Numeric(10, 2), nullable=False)


# =========================
# WORKERS
# =========================
class Worker(Base):
    __tablename__ = "workers"

    id = Column(Integer, primary_key=True)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="SET NULL"))

    full_name = Column(String(255), nullable=False)
    email = Column(String(255))
    phone_number = Column(String(50))


# =========================
# ORDERS
# =========================
class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True)

    courier_id = Column(Integer, ForeignKey("workers.id", ondelete="SET NULL"))
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="RESTRICT"), nullable=False)
    payment_id = Column(Integer, ForeignKey("payments.id", ondelete="SET NULL"))

    delivery_address = Column(Text)
    created_at = Column(DateTime)
    status = Column(String(50), default="new")


# =========================
# ORDER ITEMS
# =========================
class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True)

    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="RESTRICT"), nullable=False)

    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)


# =========================
# CHECKS
# =========================
class Check(Base):
    __tablename__ = "checks"

    id = Column(Integer, primary_key=True)

    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), unique=True, nullable=False)

    created_date = Column(Date)
    created_time = Column(Time)
    total_price = Column(Numeric(10, 2), nullable=False)