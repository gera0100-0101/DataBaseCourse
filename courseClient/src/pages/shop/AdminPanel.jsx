import { useState, useEffect } from 'react';
import './AdminPanel.css';

const API_URL = 'http://localhost:8000';

export default function AdminPanel() {
    const [activeTab, setActiveTab] = useState('products');
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [manufacturers, setManufacturers] = useState([]);
    const [shops, setShops] = useState([]);
    const [orders, setOrders] = useState([]);
    
    // Product form state
    const [productForm, setProductForm] = useState({
        name: '',
        price: '',
        weight: '',
        calories: '',
        structure: '',
        stock_amount: 0,
        category_id: '',
        manufacturer_id: '',
        shop_id: ''
    });

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchManufacturers();
        fetchShops();
        fetchOrders();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch(`${API_URL}/admin/products/`);
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

    const fetchManufacturers = async () => {
        try {
            const response = await fetch(`${API_URL}/manufacturers/`);
            const data = await response.json();
            setManufacturers(data);
        } catch (error) {
            console.error('Error fetching manufacturers:', error);
        }
    };

    const fetchShops = async () => {
        try {
            const response = await fetch(`${API_URL}/shops/`);
            const data = await response.json();
            setShops(data);
        } catch (error) {
            console.error('Error fetching shops:', error);
        }
    };

    const fetchOrders = async () => {
        try {
            const response = await fetch(`${API_URL}/orders/`);
            const data = await response.json();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/admin/products/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...productForm,
                    price: parseFloat(productForm.price),
                    weight: productForm.weight ? parseFloat(productForm.weight) : null,
                    calories: productForm.calories ? parseFloat(productForm.calories) : null,
                    stock_amount: parseInt(productForm.stock_amount),
                    category_id: parseInt(productForm.category_id),
                    manufacturer_id: productForm.manufacturer_id ? parseInt(productForm.manufacturer_id) : null,
                    shop_id: parseInt(productForm.shop_id)
                })
            });

            if (!response.ok) throw new Error('Failed to create product');
            
            alert('Product created successfully!');
            setProductForm({
                name: '',
                price: '',
                weight: '',
                calories: '',
                structure: '',
                stock_amount: 0,
                category_id: '',
                manufacturer_id: '',
                shop_id: ''
            });
            fetchProducts();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        
        try {
            const response = await fetch(`${API_URL}/admin/products/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete');
            alert('Product deleted!');
            fetchProducts();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    const handleUpdateOrderStatus = async (orderId, status) => {
        try {
            const response = await fetch(`${API_URL}/orders/${orderId}/status?status=${status}`, {
                method: 'PATCH'
            });
            if (!response.ok) throw new Error('Failed to update');
            alert('Order status updated!');
            fetchOrders();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    const handleImageUpload = async (productId, file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API_URL}/products/${productId}/image`, {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error('Failed to upload');
            alert('Image uploaded!');
            fetchProducts();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    return (
        <div className="admin-panel">
            <header className="admin-header">
                <h1>🔧 Admin Panel</h1>
            </header>

            <nav className="admin-nav">
                <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>
                    Products
                </button>
                <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
                    Orders
                </button>
                <button className={activeTab === 'add-product' ? 'active' : ''} onClick={() => setActiveTab('add-product')}>
                    Add Product
                </button>
            </nav>

            <main className="admin-content">
                {activeTab === 'products' && (
                    <div className="tab-content">
                        <h2>All Products</h2>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Category</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p.id}>
                                        <td>{p.id}</td>
                                        <td>{p.name}</td>
                                        <td>${p.price}</td>
                                        <td>{p.stock_amount}</td>
                                        <td>{p.category}</td>
                                        <td>
                                            <button onClick={() => handleDeleteProduct(p.id)} className="delete-btn">Delete</button>
                                            <label className="upload-btn">
                                                Upload Image
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(p.id, e.target.files[0])}
                                                    hidden
                                                />
                                            </label>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="tab-content">
                        <h2>All Orders</h2>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Customer</th>
                                    <th>Address</th>
                                    <th>Status</th>
                                    <th>Total</th>
                                    <th>Items</th>
                                    <th>Update Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(o => (
                                    <tr key={o.id}>
                                        <td>#{o.id}</td>
                                        <td>{o.customer}</td>
                                        <td>{o.delivery_address}</td>
                                        <td><span className={`status-${o.status}`}>{o.status}</span></td>
                                        <td>${o.total_price}</td>
                                        <td>{o.items?.length || 0} items</td>
                                        <td>
                                            <select onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}>
                                                <option value="">Select...</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="preparing">Preparing</option>
                                                <option value="on_delivery">On Delivery</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'add-product' && (
                    <div className="tab-content">
                        <h2>Add New Product</h2>
                        <form onSubmit={handleProductSubmit} className="product-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Name *</label>
                                    <input
                                        type="text"
                                        value={productForm.name}
                                        onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Price ($) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={productForm.price}
                                        onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Weight (g)</label>
                                    <input
                                        type="number"
                                        step="0.001"
                                        value={productForm.weight}
                                        onChange={(e) => setProductForm({...productForm, weight: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Calories</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={productForm.calories}
                                        onChange={(e) => setProductForm({...productForm, calories: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Stock Amount *</label>
                                    <input
                                        type="number"
                                        value={productForm.stock_amount}
                                        onChange={(e) => setProductForm({...productForm, stock_amount: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Structure/Ingredients</label>
                                    <input
                                        type="text"
                                        value={productForm.structure}
                                        onChange={(e) => setProductForm({...productForm, structure: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Category *</label>
                                    <select
                                        value={productForm.category_id}
                                        onChange={(e) => setProductForm({...productForm, category_id: e.target.value})}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Manufacturer</label>
                                    <select
                                        value={productForm.manufacturer_id}
                                        onChange={(e) => setProductForm({...productForm, manufacturer_id: e.target.value})}
                                    >
                                        <option value="">Select Manufacturer</option>
                                        {manufacturers.map(m => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Shop *</label>
                                <select
                                    value={productForm.shop_id}
                                    onChange={(e) => setProductForm({...productForm, shop_id: e.target.value})}
                                    required
                                >
                                    <option value="">Select Shop</option>
                                    {shops.map(s => (
                                        <option key={s.id} value={s.id}>{s.address}</option>
                                    ))}
                                </select>
                            </div>

                            <button type="submit" className="submit-btn">Create Product</button>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
}
