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

  function findProductForReview(id) {
    return products.find((product) => product.id === id);
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
    setCart(cart.filter((item) => item.id !== id));
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
    return products.filter((product) => product.stock > 0);
  }

  function getAvailableProductsCorrectly() {
    return products.filter((product) => product.stock > 0);
  }

  function increaseDiscount() {
    setDiscount(discount + 5);
  }

  return (
    <div>
      <h1>Product Store</h1>
      <p>Balance: â‚¹{balance}</p>
      <p>Discount: {discount}%</p>
      <p>{message}</p>
      <h2>Products</h2>
      {products.map((product) => (
        <div key={product.id}>
          <span>{product.name} - â‚¹{product.price}</span>
          <button onClick={() => addToCart(product.id)}>Add</button>
          <button onClick={() => updateStock(product.id, 1)}>Buy</button>
        </div>
      ))}
      <h2>Cart</h2>
      <p>Total: â‚¹{calculateTotal(cart)}</p>
      <button onClick={checkout}>Checkout</button>
      <button onClick={() => removeFromCart(1)}>Remove Item</button>
      <button onClick={increaseDiscount}>Change Discount</button>
      <h2>Discounted Prices</h2>
      {products.map((product) => (
        <p key={product.id}>
          {product.name}: â‚¹{applyDiscount(product.price, discount)}
        </p>
      ))}
      <h2>Available Products</h2>
      {getAvailableProducts().map((product) => (
        <p key={product.id}>{product.name}</p>
      ))}
    </div>
  );
}

export const productStoreLogic = {
  normalizeText(value) {
    return String(value ?? "").trim().toLocaleLowerCase();
  },

  validateProduct(product) {
    const errors = [];
    if (!product || typeof product !== "object") return ["Product is required"];
    if (!Number.isInteger(product.id)) errors.push("ID must be an integer");
    if (!String(product.name ?? "").trim()) errors.push("Name is required");
    if (!Number.isFinite(product.price) || product.price < 0) errors.push("Price must be non-negative");
    if (!Number.isInteger(product.stock) || product.stock < 0) errors.push("Stock must be a non-negative integer");
    return errors;
  },

  validateCatalog(products) {
    if (!Array.isArray(products)) return ["Catalog must be an array"];
    const ids = new Set();
    const errors = [];
    products.forEach((product, index) => {
      this.validateProduct(product).forEach((error) => errors.push(`Row ${index + 1}: ${error}`));
      if (ids.has(product?.id)) errors.push(`Duplicate ID ${product.id}`);
      ids.add(product?.id);
    });
    return errors;
  },

  findProduct(products, id) {
    return products.find((product) => product.id === id) ?? null;
  },

  searchProducts(products, query) {
    const term = this.normalizeText(query);
    if (!term) return [...products];
    return products.filter((product) =>
      this.normalizeText(product.name).includes(term) ||
      this.normalizeText(product.category).includes(term)
    );
  },

  filterProducts(products, filters = {}) {
    return products.filter((product) => {
      const categoryMatches = !filters.category || product.category === filters.category;
      const stockMatches = filters.inStock !== true || product.stock > 0;
      const minimumMatches = filters.minimumPrice == null || product.price >= filters.minimumPrice;
      const maximumMatches = filters.maximumPrice == null || product.price <= filters.maximumPrice;
      return categoryMatches && stockMatches && minimumMatches && maximumMatches;
    });
  },

  sortProducts(products, key = "name", direction = "asc") {
    const multiplier = direction === "desc" ? -1 : 1;
    return [...products].sort((left, right) => {
      const a = left[key];
      const b = right[key];
      if (typeof a === "string" && typeof b === "string") {
        return a.localeCompare(b) * multiplier;
      }
      return ((a ?? 0) - (b ?? 0)) * multiplier;
    });
  },

  paginate(items, page = 1, pageSize = 10) {
    const size = Math.max(1, Math.floor(pageSize));
    const currentPage = Math.max(1, Math.floor(page));
    const start = (currentPage - 1) * size;
    return {
      items: items.slice(start, start + size),
      page: currentPage,
      pageSize: size,
      totalItems: items.length,
      totalPages: Math.ceil(items.length / size),
    };
  },

  addProduct(products, product) {
    const errors = this.validateProduct(product);
    if (errors.length) return { products, errors };
    if (this.findProduct(products, product.id)) return { products, errors: ["ID already exists"] };
    return { products: [...products, { ...product }], errors: [] };
  },

  updateProduct(products, id, changes) {
    const current = this.findProduct(products, id);
    if (!current) return { products, error: "Product not found" };
    const updated = { ...current, ...changes, id: current.id };
    const errors = this.validateProduct(updated);
    if (errors.length) return { products, error: errors.join("; ") };
    return {
      products: products.map((product) => product.id === id ? updated : product),
      error: null,
    };
  },

  deleteProduct(products, id) {
    const next = products.filter((product) => product.id !== id);
    return { products: next, deleted: next.length !== products.length };
  },

  adjustStock(products, id, delta) {
    if (!Number.isInteger(delta)) return { products, error: "Stock change must be an integer" };
    const target = this.findProduct(products, id);
    if (!target) return { products, error: "Product not found" };
    const stock = target.stock + delta;
    if (stock < 0) return { products, error: "Insufficient stock" };
    return {
      products: products.map((product) => product.id === id ? { ...product, stock } : product),
      error: null,
    };
  },

  lowStockProducts(products, threshold = 5) {
    return products.filter((product) => product.stock > 0 && product.stock <= threshold);
  },

  unavailableProducts(products) {
    return products.filter((product) => product.stock === 0);
  },

  addCartItem(cart, product, quantity = 1) {
    if (!Number.isInteger(quantity) || quantity < 1) return { cart, error: "Invalid quantity" };
    if (product.stock < quantity) return { cart, error: "Insufficient stock" };
    const current = cart.find((item) => item.id === product.id);
    if (current && current.quantity + quantity > product.stock) {
      return { cart, error: "Cart quantity exceeds stock" };
    }
    const next = current
      ? cart.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item)
      : [...cart, { ...product, quantity }];
    return { cart: next, error: null };
  },

  removeCartItem(cart, id) {
    return cart.filter((item) => item.id !== id);
  },

  setCartQuantity(cart, products, id, quantity) {
    if (!Number.isInteger(quantity) || quantity < 0) return { cart, error: "Invalid quantity" };
    if (quantity === 0) return { cart: this.removeCartItem(cart, id), error: null };
    const product = this.findProduct(products, id);
    if (!product) return { cart, error: "Product no longer exists" };
    if (quantity > product.stock) return { cart, error: "Quantity exceeds stock" };
    return {
      cart: cart.map((item) => item.id === id ? { ...item, quantity } : item),
      error: null,
    };
  },

  validateCart(cart, products) {
    return cart.flatMap((item) => {
      const product = this.findProduct(products, item.id);
      if (!product) return [`${item.name} is no longer available`];
      if (!Number.isInteger(item.quantity) || item.quantity < 1) return [`Invalid quantity for ${item.name}`];
      if (item.quantity > product.stock) return [`Not enough stock for ${item.name}`];
      return [];
    });
  },

  cartSubtotal(cart) {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  },

  discountAmount(subtotal, percent) {
    const rate = Math.min(100, Math.max(0, Number(percent) || 0));
    return subtotal * rate / 100;
  },

  calculateTotals(cart, options = {}) {
    const subtotal = this.cartSubtotal(cart);
    const discount = this.discountAmount(subtotal, options.discountPercent ?? 0);
    const taxable = subtotal - discount;
    const tax = taxable * Math.max(0, options.taxRate ?? 0) / 100;
    const shipping = Math.max(0, options.shipping ?? 0);
    return { subtotal, discount, tax, shipping, total: taxable + tax + shipping };
  },

  checkout(cart, products, balance, options = {}) {
    const errors = this.validateCart(cart, products);
    if (errors.length) return { ok: false, errors };
    const totals = this.calculateTotals(cart, options);
    if (!Number.isFinite(balance) || balance < totals.total) {
      return { ok: false, errors: ["Insufficient balance"], totals };
    }
    const quantities = new Map(cart.map((item) => [item.id, item.quantity]));
    const nextProducts = products.map((product) => ({
      ...product,
      stock: product.stock - (quantities.get(product.id) ?? 0),
    }));
    return {
      ok: true,
      products: nextProducts,
      cart: [],
      balance: balance - totals.total,
      totals,
    };
  },

  inventoryValue(products) { return products.reduce((total, product) => total + product.price * product.stock, 0); },
};
