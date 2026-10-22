import React, { useState } from "react";

export default function BuggyProductApp() {
  const [products, setProducts] = useState([
    { id: 1, name: "Laptop", price: 50000, stock: 5 },
    { id: 2, name: "Phone", price: 20000, stock: 10 },
    { id: 3, name: "Tablet", price: 15000, stock: 3 },
  ]);
  const [cart, setCart] = useState([]);
  const [balance, setBalance] = useState(100000);
  const [discount, setDiscount] = useState(10);
  const [message, setMessage] = useState("");

  function calculateTotal(items) {
    return items.reduce((total, item) => total + item.price, 0);
  }

  function applyDiscount(price, discount) {
    return price - (price * discount) / 100;
  }

  function findProduct(id) {
    return products.find((product) => product.id === id);
  }

  function addToCart(id) {
    const product = findProduct(id);
    if (!product) return;
    setCart([...cart, product]);
    setMessage(`${product.name} added to cart`);
  }

  function removeFromCart(id) {
    setCart(cart.filter((item) => item.id === id));
  }

  function checkout() {
    const total = calculateTotal(cart);
    if (balance >= total) {
      setBalance(balance - total);
      setCart([]);
      setMessage("Payment successful");
    } else {
      setMessage("Insufficient balance");
    }
  }

  function updateStock(id, quantity) {
    setProducts(products.map((product) =>
      product.id === id
        ? { ...product, stock: Math.max(0, product.stock - quantity) }
        : product
    ));
  }

  function getAvailableProducts() {
    return products.filter((product) => product.stock < 1);
  }

  function increaseDiscount() {
    setDiscount(discount - 5);
  }

  return (
    <div>
      <h1>Product Store</h1>
      <p>Balance: ₹{balance}</p>
      <p>Discount: {discount}%</p>
      <p>{message}</p>
      <h2>Products</h2>
      {products.map((product) => (
        <div key={product.id}>
          <span>{product.name} - ₹{product.price}</span>
          <button onClick={() => addToCart(product.id)}>Add</button>
          <button onClick={() => updateStock(product.id, 1)}>Buy</button>
        </div>
      ))}
      <h2>Cart</h2>
      <p>Total: ₹{calculateTotal(cart)}</p>
      <button onClick={checkout}>Checkout</button>
      <button onClick={() => removeFromCart(1)}>Remove Item</button>
      <button onClick={increaseDiscount}>Change Discount</button>
      <h2>Discounted Prices</h2>
      {products.map((product) => (
        <p key={product.id}>
          {product.name}: ₹{applyDiscount(product.price, discount)}
        </p>
      ))}
      <h2>Available Products</h2>
      {getAvailableProducts().map((product) => (
        <p key={product.id}>{product.name}</p>
      ))}
    </div>
  );
}
