import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Shop.css';

const API_URL = 'http://localhost:8000';

export default function Shop() {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isCartOpen, setIsCartOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        loadCart();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch(`${API_URL}/products/cards`);
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${API_URL}/categories/`);
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const loadCart = () => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    };

    const addToCart = (product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            let newCart;
            if (existingItem) {
                newCart = prevCart.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                newCart = [...prevCart, { ...product, quantity: 1 }];
            }
            localStorage.setItem('cart', JSON.stringify(newCart));
            return newCart;
        });
    };

    const removeFromCart = (productId) => {
        const newCart = cart.filter(item => item.id !== productId);
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
    };

    const updateQuantity = (productId, delta) => {
        setCart(prevCart => {
            const newCart = prevCart.map(item => {
                if (item.id === productId) {
                    const newQuantity = Math.max(0, item.quantity + delta);
                    return { ...item, quantity: newQuantity };
                }
                return item;
            }).filter(item => item.quantity > 0);
            localStorage.setItem('cart', JSON.stringify(newCart));
            return newCart;
        });
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
    };

    const getCartCount = () => {
        return cart.reduce((count, item) => count + item.quantity, 0);
    };

    const filteredProducts = selectedCategory === 'all'
        ? products
        : products.filter(p => p.category === selectedCategory);

    const handleCheckout = async () => {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        navigate('/checkout', { state: { cart } });
    };

    return (
        <div className="shop-page">
            <header className="shop-header">
                <h1>🛒 Food Delivery Store</h1>
                <button className="cart-btn" onClick={() => setIsCartOpen(true)}>
                    🛒 Cart ({getCartCount()})
                </button>
            </header>

            <div className="categories-filter">
                <button
                    className={selectedCategory === 'all' ? 'active' : ''}
                    onClick={() => setSelectedCategory('all')}
                >
                    All
                </button>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        className={selectedCategory === cat.name ? 'active' : ''}
                        onClick={() => setSelectedCategory(cat.name)}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            <div className="products-grid">
                {filteredProducts.map(product => (
                    <div key={product.id} className="product-card">
                        <div className="product-image">
                            {product.image ? (
                                <img src={`${API_URL}/${product.image}`} alt={product.name} />
                            ) : (
                                <div className="no-image">No Image</div>
                            )}
                        </div>
                        <div className="product-info">
                            <h3>{product.name}</h3>
                            <p className="product-category">{product.category}</p>
                            {product.manufacturer && (
                                <p className="product-manufacturer">by {product.manufacturer}</p>
                            )}
                            {product.weight && <p className="product-weight">{product.weight}g</p>}
                            {product.calories && <p className="product-calories">{product.calories} kcal</p>}
                            {product.structure && <p className="product-structure">{product.structure}</p>}
                            <p className="product-price">${product.price}</p>
                            <p className="product-stock">In stock: {product.stock}</p>
                            <button
                                className="add-to-cart-btn"
                                onClick={() => addToCart(product)}
                                disabled={product.stock === 0}
                            >
                                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {isCartOpen && (
                <div className="cart-modal-overlay" onClick={() => setIsCartOpen(false)}>
                    <div className="cart-modal" onClick={e => e.stopPropagation()}>
                        <h2>Your Cart</h2>
                        {cart.length === 0 ? (
                            <p>Cart is empty</p>
                        ) : (
                            <>
                                <div className="cart-items">
                                    {cart.map(item => (
                                        <div key={item.id} className="cart-item">
                                            <span>{item.name}</span>
                                            <div className="cart-item-controls">
                                                <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                                                <span>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                                                <button className="remove-btn" onClick={() => removeFromCart(item.id)}>×</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="cart-total">
                                    <strong>Total: ${getCartTotal()}</strong>
                                </div>
                                <button className="checkout-btn" onClick={handleCheckout}>
                                    Proceed to Checkout
                                </button>
                            </>
                        )}
                        <button className="close-cart-btn" onClick={() => setIsCartOpen(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}
