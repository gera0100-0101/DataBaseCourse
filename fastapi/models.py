from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Numeric,
    ForeignKey,
    Date,
    Time,
    TIMESTAMP,
    CheckConstraint,
    UniqueConstraint,
    func,
    Index,
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


# =========================
# Companies
# =========================
class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(255), nullable=False)

    shops = relationship("Shop", back_populates="company", cascade="all, delete")


# =========================
# Shops
# =========================
class Shop(Base):
    __tablename__ = "shops"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    address = Column(Text, nullable=False)

    company = relationship("Company", back_populates="shops")
    products = relationship("Product", back_populates="shop", cascade="all, delete")


# =========================
# Categories
# =========================
class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, nullable=False)
    description = Column(Text)

    products = relationship("Product", back_populates="category")


# =========================
# Manufacturers
# =========================
class Manufacturer(Base):
    __tablename__ = "manufacturers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    contact_person = Column(String(255))
    phone_number = Column(String(50))
    email = Column(String(255))
    location = Column(Text)

    products = relationship("Product", back_populates="manufacturer")


# =========================
# Products
# =========================
class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    shop_id = Column(Integer, ForeignKey("shops.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"))
    manufacturer_id = Column(Integer, ForeignKey("manufacturers.id", ondelete="SET NULL"))

    name = Column(String(255), nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    weight = Column(Numeric(10, 3))
    calories = Column(Numeric(10, 2))
    structure = Column(Text)
    stock_amount = Column(Integer, nullable=False, default=0)

    __table_args__ = (
        CheckConstraint("price >= 0"),
        CheckConstraint("stock_amount >= 0"),
        Index("idx_products_shop", "shop_id"),
        Index("idx_products_category", "category_id"),
    )

    shop = relationship("Shop", back_populates="products")
    category = relationship("Category", back_populates="products")
    manufacturer = relationship("Manufacturer", back_populates="products")

    image_groups = relationship("ProductImageGroup", back_populates="product", cascade="all, delete")
    order_items = relationship("OrderItem", back_populates="product")


# =========================
# Product Image Groups
# =========================
class ProductImageGroup(Base):
    __tablename__ = "product_image_groups"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)

    product = relationship("Product", back_populates="image_groups")
    images = relationship("Image", back_populates="group", cascade="all, delete")


# =========================
# Images
# =========================
class Image(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    image_group_id = Column(
        Integer,
        ForeignKey("product_image_groups.id", ondelete="CASCADE"),
        nullable=False
    )
    link = Column(Text, nullable=False)

    group = relationship("ProductImageGroup", back_populates="images")


# =========================
# Customers
# =========================
class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    phone_number = Column(String(50))

    orders = relationship("Order", back_populates="customer")


# =========================
# Payments
# =========================
class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    bank_name = Column(String(255), nullable=False)
    payment_link = Column(Text)

    orders = relationship("Order", back_populates="payment")


# =========================
# Posts
# =========================
class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    salary = Column(Numeric(10, 2), nullable=False)

    __table_args__ = (
        CheckConstraint("salary >= 0"),
    )

    workers = relationship("Worker", back_populates="post")


# =========================
# Workers
# =========================
class Worker(Base):
    __tablename__ = "workers"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="SET NULL"))
    full_name = Column(String(255), nullable=False)
    email = Column(String(255))
    phone_number = Column(String(50))

    post = relationship("Post", back_populates="workers")
    deliveries = relationship("Order", back_populates="courier")


# =========================
# Orders
# =========================
class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)

    courier_id = Column(Integer, ForeignKey("workers.id", ondelete="SET NULL"))
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="RESTRICT"), nullable=False)
    payment_id = Column(Integer, ForeignKey("payments.id", ondelete="SET NULL"))

    delivery_address = Column(Text)
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now())
    status = Column(String(50), nullable=False, default="new")

    customer = relationship("Customer", back_populates="orders")
    payment = relationship("Payment", back_populates="orders")
    courier = relationship("Worker", back_populates="deliveries")

    items = relationship("OrderItem", back_populates="order", cascade="all, delete")
    check = relationship("Check", back_populates="order", uselist=False, cascade="all, delete")


# =========================
# Order Items
# =========================
class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)

    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="RESTRICT"), nullable=False)

    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)

    __table_args__ = (
        CheckConstraint("quantity > 0"),
        CheckConstraint("unit_price >= 0"),
        Index("idx_order_items_order", "order_id"),
        Index("idx_order_items_product", "product_id"),
    )

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")


# =========================
# Checks
# =========================
class Check(Base):
    __tablename__ = "checks"

    id = Column(Integer, primary_key=True, index=True)

    order_id = Column(
        Integer,
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False,
        unique=True
    )

    created_date = Column(Date, nullable=False, server_default=func.current_date())
    created_time = Column(Time, nullable=False, server_default=func.current_time())
    total_price = Column(Numeric(10, 2), nullable=False)

    __table_args__ = (
        CheckConstraint("total_price >= 0"),
    )

    order = relationship("Order", back_populates="check")