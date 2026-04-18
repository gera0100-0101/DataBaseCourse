import { useEffect, useState } from "react";
import { ShoppingCart, Heart } from "lucide-react";

export default function ProductsGrid() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/products/cards")
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  return (
    <div className="grid">
      {products.map(product => (
        <div className="card" key={product.id}>
          
          <div className="img-box">
            <img
              src={`http://localhost:8000/${product.image}`}
              alt=""
            />

            <span className="discount">
              -{product.discount}%
            </span>

            <button className="fav">
              <Heart size={18}/>
            </button>
          </div>

          <div className="content">

            <p className="name">{product.name}</p>

            <p className="category">
              Категория: {product.category}
            </p>

            <div className="bottom">
              <span className="price">
                ${product.price}
              </span>

              <button className="cart">
                <ShoppingCart size={18}/>
              </button>
            </div>
          </div>

        </div>
      ))}
    </div>
  );
}