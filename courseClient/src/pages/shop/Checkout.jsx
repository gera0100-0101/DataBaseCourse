import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Checkout.css';

const API_URL = 'http://localhost:8000';

export default function Checkout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        paymentMethod: 'card'
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [orderId, setOrderId] = useState(null);

    const cart = location.state?.cart || [];

    const getTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.phone || !formData.address) {
            alert('Please fill in all required fields');
            return;
        }

        setIsProcessing(true);

        try {
            const orderItems = cart.map(item => ({
                product_id: item.id,
                quantity: item.quantity
            }));

            const response = await fetch(`${API_URL}/orders/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    customer_name: formData.name,
                    customer_phone: formData.phone,
                    delivery_address: formData.address,
                    items: orderItems,
                    payment_method: formData.paymentMethod
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to create order');
            }

            const result = await response.json();
            setOrderId(result.order_id);
            setOrderComplete(true);
            
            // Clear cart
            localStorage.removeItem('cart');
        } catch (error) {
            alert('Error creating order: ' + error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    if (cart.length === 0 && !orderComplete) {
        return (
            <div className="checkout-page">
                <h2>Your cart is empty</h2>
                <button onClick={() => navigate('/shop')}>Back to Shop</button>
            </div>
        );
    }

    if (orderComplete) {
        return (
            <div className="checkout-page">
                <div className="order-success">
                    <h1>✅ Order Placed Successfully!</h1>
                    <p>Order ID: #{orderId}</p>
                    <p>Total paid: ${getTotal()}</p>
                    <p>Your order will be delivered to: {formData.address}</p>
                    <button onClick={() => navigate('/shop')}>Continue Shopping</button>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <h1>Checkout</h1>
            
            <div className="checkout-container">
                <div className="checkout-form">
                    <h2>Delivery Information</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Full Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="form-group">
                            <label>Phone Number *</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                                placeholder="+1 234 567 8900"
                            />
                        </div>

                        <div className="form-group">
                            <label>Delivery Address *</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                required
                                placeholder="123 Main St, Apt 4B, New York, NY 10001"
                                rows="3"
                            />
                        </div>

                        <div className="form-group">
                            <label>Payment Method</label>
                            <select
                                name="paymentMethod"
                                value={formData.paymentMethod}
                                onChange={handleInputChange}
                            >
                                <option value="card">Credit/Debit Card</option>
                                <option value="cash">Cash on Delivery</option>
                                <option value="bank">Bank Transfer</option>
                            </select>
                        </div>

                        <button type="submit" className="place-order-btn" disabled={isProcessing}>
                            {isProcessing ? 'Processing...' : `Place Order - $${getTotal()}`}
                        </button>
                    </form>
                </div>

                <div className="order-summary">
                    <h2>Order Summary</h2>
                    <div className="summary-items">
                        {cart.map(item => (
                            <div key={item.id} className="summary-item">
                                <span>{item.name} x {item.quantity}</span>
                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="summary-total">
                        <strong>Total:</strong>
                        <strong>${getTotal()}</strong>
                    </div>
                </div>
            </div>
        </div>
    );
}
