import React, { useCallback, useEffect, useMemo, useReducer, useState } from "react";

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

const DEFAULT_CATALOG = [
  { id: 1, name: "Laptop", category: "Computers", price: 50000, stock: 5 },
  { id: 2, name: "Phone", category: "Mobile", price: 20000, stock: 10 },
  { id: 3, name: "Tablet", category: "Mobile", price: 15000, stock: 3 },
  { id: 4, name: "Monitor", category: "Computers", price: 12000, stock: 0 },
  { id: 5, name: "Headphones", category: "Audio", price: 3000, stock: 25 },
  { id: 6, name: "Speaker", category: "Audio", price: 4500, stock: 2 },
];

const COUPONS = {
  SAVE10: { type: "percent", value: 10, minimumSubtotal: 0 },
  SAVE20: { type: "percent", value: 20, minimumSubtotal: 50000 },
  FLAT500: { type: "flat", value: 500, minimumSubtotal: 5000 },
};

const TAX_RATE = 18;
const FREE_SHIPPING_THRESHOLD = 10000;
const SHIPPING_FEE = 250;

export function formatCurrency(amount) {
  return `₹${Math.round(Number(amount) || 0).toLocaleString("en-IN")}`;
}

export function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function useProductCatalog(initialProducts = DEFAULT_CATALOG) {
  const [products, setProducts] = useState(initialProducts);
  const [error, setError] = useState(null);

  // Validate against the current render's products so the result is known synchronously.
  const addProduct = useCallback((product) => {
    const result = productStoreLogic.addProduct(products, product);
    if (result.errors.length) {
      setError(result.errors.join("; "));
      return false;
    }
    setProducts(result.products);
    setError(null);
    return true;
  }, [products]);

  const updateProduct = useCallback((id, changes) => {
    const result = productStoreLogic.updateProduct(products, id, changes);
    setError(result.error);
    if (!result.error) setProducts(result.products);
    return result.error === null;
  }, [products]);

  const deleteProduct = useCallback((id) => {
    setProducts((current) => productStoreLogic.deleteProduct(current, id).products);
    setError(null);
  }, []);

  const adjustStock = useCallback((id, delta) => {
    const result = productStoreLogic.adjustStock(products, id, delta);
    setError(result.error);
    if (!result.error) setProducts(result.products);
    return result.error === null;
  }, [products]);

  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category).filter(Boolean))].sort(),
    [products]
  );

  const stats = useMemo(() => ({
    count: products.length,
    inventoryValue: productStoreLogic.inventoryValue(products),
    lowStock: productStoreLogic.lowStockProducts(products),
    unavailable: productStoreLogic.unavailableProducts(products),
  }), [products]);

  return {
    products, setProducts, error, categories, stats,
    addProduct, updateProduct, deleteProduct, adjustStock,
  };
}

function cartReducer(state, action) {
  switch (action.type) {
    case "add": {
      const result = productStoreLogic.addCartItem(state.items, action.product, action.quantity ?? 1);
      return { items: result.cart, error: result.error };
    }
    case "remove":
      return { items: productStoreLogic.removeCartItem(state.items, action.id), error: null };
    case "setQuantity": {
      const result = productStoreLogic.setCartQuantity(state.items, action.products, action.id, action.quantity);
      return { items: result.cart, error: result.error };
    }
    case "clear":
      return { items: [], error: null };
    default:
      return state;
  }
}

export function useCart() {
  const [state, dispatch] = useReducer(cartReducer, { items: [], error: null });

  const addItem = useCallback((product, quantity = 1) => dispatch({ type: "add", product, quantity }), []);
  const removeItem = useCallback((id) => dispatch({ type: "remove", id }), []);
  const setQuantity = useCallback(
    (products, id, quantity) => dispatch({ type: "setQuantity", products, id, quantity }),
    []
  );
  const clear = useCallback(() => dispatch({ type: "clear" }), []);

  const itemCount = useMemo(
    () => state.items.reduce((total, item) => total + item.quantity, 0),
    [state.items]
  );

  return { items: state.items, error: state.error, itemCount, addItem, removeItem, setQuantity, clear };
}

export function useCoupon(subtotal) {
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState(null);
  const [error, setError] = useState(null);

  const apply = useCallback(() => {
    const key = code.trim().toUpperCase();
    const coupon = COUPONS[key];
    if (!coupon) {
      setApplied(null);
      setError("Invalid coupon code");
      return;
    }
    if (subtotal < coupon.minimumSubtotal) {
      setApplied(null);
      setError(`Minimum order of ${formatCurrency(coupon.minimumSubtotal)} required`);
      return;
    }
    setApplied({ code: key, ...coupon });
    setError(null);
  }, [code, subtotal]);

  const remove = useCallback(() => {
    setApplied(null);
    setCode("");
    setError(null);
  }, []);

  // Drop the coupon if the cart shrinks below its minimum.
  useEffect(() => {
    if (applied && subtotal < applied.minimumSubtotal) {
      setApplied(null);
      setError("Coupon removed: order below minimum");
    }
  }, [applied, subtotal]);

  const discountPercent = useMemo(() => {
    if (!applied || subtotal <= 0) return 0;
    if (applied.type === "percent") return applied.value;
    return Math.min(100, (applied.value / subtotal) * 100);
  }, [applied, subtotal]);

  return { code, setCode, applied, error, apply, remove, discountPercent };
}

export function useProductQuery(products, pageSize = 4) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ category: "", inStock: false, minimumPrice: null, maximumPrice: null });
  const [sort, setSort] = useState({ key: "name", direction: "asc" });
  const [page, setPage] = useState(1);
  const debouncedQuery = useDebouncedValue(query);

  const results = useMemo(() => {
    const searched = productStoreLogic.searchProducts(products, debouncedQuery);
    const filtered = productStoreLogic.filterProducts(searched, filters);
    return productStoreLogic.sortProducts(filtered, sort.key, sort.direction);
  }, [products, debouncedQuery, filters, sort]);

  const pageData = useMemo(() => productStoreLogic.paginate(results, page, pageSize), [results, page, pageSize]);

  useEffect(() => setPage(1), [debouncedQuery, filters, sort]);

  const updateFilter = useCallback((key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  }, []);

  const toggleSort = useCallback((key) => {
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  return { query, setQuery, filters, updateFilter, sort, toggleSort, page: pageData, setPage };
}

export function useOrderHistory() {
  const [orders, setOrders] = useState([]);

  const recordOrder = useCallback((items, totals) => {
    setOrders((current) => [
      {
        id: current.length + 1,
        placedAt: new Date().toISOString(),
        items: items.map(({ id, name, price, quantity }) => ({ id, name, price, quantity })),
        totals,
      },
      ...current,
    ]);
  }, []);

  const totalSpent = useMemo(() => orders.reduce((sum, order) => sum + order.totals.total, 0), [orders]);

  return { orders, recordOrder, totalSpent };
}

export function ProductSearchBar({ query, onQueryChange, filters, onFilterChange, categories }) {
  return (
    <div className="search-bar">
      <input
        type="search"
        placeholder="Search products"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
      />
      <select value={filters.category} onChange={(event) => onFilterChange("category", event.target.value)}>
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>{category}</option>
        ))}
      </select>
      <label>
        <input
          type="checkbox"
          checked={filters.inStock}
          onChange={(event) => onFilterChange("inStock", event.target.checked)}
        />
        In stock only
      </label>
      <input
        type="number"
        placeholder="Max price"
        value={filters.maximumPrice ?? ""}
        onChange={(event) => onFilterChange("maximumPrice", event.target.value === "" ? null : Number(event.target.value))}
      />
    </div>
  );
}

export function ProductTable({ products, sort, onSort, onAddToCart, onRestock, onDelete }) {
  const arrow = (key) => (sort.key === key ? (sort.direction === "asc" ? " ▲" : " ▼") : "");

  if (products.length === 0) return <p>No products match your search.</p>;

  return (
    <table>
      <thead>
        <tr>
          <th onClick={() => onSort("name")}>Name{arrow("name")}</th>
          <th onClick={() => onSort("category")}>Category{arrow("category")}</th>
          <th onClick={() => onSort("price")}>Price{arrow("price")}</th>
          <th onClick={() => onSort("stock")}>Stock{arrow("stock")}</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.id}>
            <td>{product.name}</td>
            <td>{product.category}</td>
            <td>{formatCurrency(product.price)}</td>
            <td>{product.stock === 0 ? "Out of stock" : product.stock}</td>
            <td>
              <button disabled={product.stock === 0} onClick={() => onAddToCart(product)}>Add</button>
              <button onClick={() => onRestock(product.id, 5)}>+5</button>
              <button onClick={() => onDelete(product.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="pagination">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)}>Prev</button>
      <span>Page {page} of {totalPages}</span>
      <button disabled={page >= totalPages} onClick={() => onChange(page + 1)}>Next</button>
    </div>
  );
}

const EMPTY_FORM = { name: "", category: "", price: "", stock: "" };

export function ProductForm({ nextId, onSubmit, error }) {
  const [form, setForm] = useState(EMPTY_FORM);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const ok = onSubmit({
      id: nextId,
      name: form.name.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
    });
    if (ok) setForm(EMPTY_FORM);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add product</h3>
      <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
      <input name="category" placeholder="Category" value={form.category} onChange={handleChange} />
      <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} />
      <input name="stock" type="number" placeholder="Stock" value={form.stock} onChange={handleChange} />
      <button type="submit">Save</button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}

export function CartPanel({ items, products, onQuantityChange, onRemove }) {
  if (items.length === 0) return <p>Your cart is empty.</p>;
  return (
    <ul className="cart">
      {items.map((item) => {
        const product = productStoreLogic.findProduct(products, item.id);
        const maxQuantity = product?.stock ?? 0;
        return (
          <li key={item.id}>
            <span>{item.name}</span>
            <button onClick={() => onQuantityChange(item.id, item.quantity - 1)}>-</button>
            <span>{item.quantity}</span>
            <button disabled={item.quantity >= maxQuantity} onClick={() => onQuantityChange(item.id, item.quantity + 1)}>+</button>
            <span>{formatCurrency(item.price * item.quantity)}</span>
            <button onClick={() => onRemove(item.id)}>Remove</button>
          </li>
        );
      })}
    </ul>
  );
}

export function OrderSummary({ totals, coupon, onCheckout, disabled }) {
  return (
    <div className="summary">
      <p>Subtotal: {formatCurrency(totals.subtotal)}</p>
      {totals.discount > 0 && <p>Discount: -{formatCurrency(totals.discount)}</p>}
      <p>Tax: {formatCurrency(totals.tax)}</p>
      <p>Shipping: {totals.shipping === 0 ? "Free" : formatCurrency(totals.shipping)}</p>
      <p><strong>Total: {formatCurrency(totals.total)}</strong></p>
      <div className="coupon">
        <input value={coupon.code} placeholder="Coupon code" onChange={(event) => coupon.setCode(event.target.value)} />
        {coupon.applied
          ? <button onClick={coupon.remove}>Remove {coupon.applied.code}</button>
          : <button onClick={coupon.apply}>Apply</button>}
        {coupon.error && <p className="error">{coupon.error}</p>}
      </div>
      <button disabled={disabled} onClick={onCheckout}>Checkout</button>
    </div>
  );
}

export function StockAlerts({ lowStock, unavailable }) {
  if (lowStock.length === 0 && unavailable.length === 0) return null;
  return (
    <div className="alerts">
      {lowStock.length > 0 && <p>Low stock: {lowStock.map((product) => `${product.name} (${product.stock})`).join(", ")}</p>}
      {unavailable.length > 0 && <p>Out of stock: {unavailable.map((product) => product.name).join(", ")}</p>}
    </div>
  );
}

export function OrderHistory({ orders, totalSpent }) {
  if (orders.length === 0) return null;
  return (
    <section>
      <h2>Order history</h2>
      <p>Total spent: {formatCurrency(totalSpent)}</p>
      {orders.map((order) => (
        <details key={order.id}>
          <summary>Order #{order.id} · {new Date(order.placedAt).toLocaleString()} · {formatCurrency(order.totals.total)}</summary>
          <ul>
            {order.items.map((item) => (
              <li key={item.id}>{item.name} × {item.quantity} = {formatCurrency(item.price * item.quantity)}</li>
            ))}
          </ul>
        </details>
      ))}
    </section>
  );
}

export function ProductStoreDashboard() {
  const catalog = useProductCatalog();
  const cart = useCart();
  const history = useOrderHistory();
  const listing = useProductQuery(catalog.products);
  const [balance, setBalance] = useState(100000);
  const [message, setMessage] = useState("");

  const subtotal = productStoreLogic.cartSubtotal(cart.items);
  const coupon = useCoupon(subtotal);

  const totals = useMemo(() => productStoreLogic.calculateTotals(cart.items, {
    discountPercent: coupon.discountPercent,
    taxRate: TAX_RATE,
    shipping: subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE,
  }), [cart.items, coupon.discountPercent, subtotal]);

  const nextId = useMemo(
    () => catalog.products.reduce((max, product) => Math.max(max, product.id), 0) + 1,
    [catalog.products]
  );

  const handleDelete = (id) => {
    catalog.deleteProduct(id);
    cart.removeItem(id);
  };

  const handleCheckout = () => {
    const result = productStoreLogic.checkout(cart.items, catalog.products, balance, {
      discountPercent: coupon.discountPercent,
      taxRate: TAX_RATE,
      shipping: totals.shipping,
    });
    if (!result.ok) {
      setMessage(result.errors.join("; "));
      return;
    }
    catalog.setProducts(result.products);
    setBalance(result.balance);
    history.recordOrder(cart.items, result.totals);
    cart.clear();
    coupon.remove();
    setMessage(`Payment of ${formatCurrency(result.totals.total)} successful`);
  };

  return (
    <div className="store">
      <h1>Product Store</h1>
      <p>Balance: {formatCurrency(balance)} · Items in cart: {cart.itemCount}</p>
      {message && <p className="message">{message}</p>}
      {cart.error && <p className="error">{cart.error}</p>}
      <StockAlerts lowStock={catalog.stats.lowStock} unavailable={catalog.stats.unavailable} />

      <h2>Products</h2>
      <ProductSearchBar
        query={listing.query}
        onQueryChange={listing.setQuery}
        filters={listing.filters}
        onFilterChange={listing.updateFilter}
        categories={catalog.categories}
      />
      <ProductTable
        products={listing.page.items}
        sort={listing.sort}
        onSort={listing.toggleSort}
        onAddToCart={(product) => cart.addItem(product)}
        onRestock={catalog.adjustStock}
        onDelete={handleDelete}
      />
      <Pagination page={listing.page.page} totalPages={listing.page.totalPages} onChange={listing.setPage} />
      <p>Inventory value: {formatCurrency(catalog.stats.inventoryValue)}</p>
      <ProductForm nextId={nextId} onSubmit={catalog.addProduct} error={catalog.error} />

      <h2>Cart</h2>
      <CartPanel
        items={cart.items}
        products={catalog.products}
        onQuantityChange={(id, quantity) => cart.setQuantity(catalog.products, id, quantity)}
        onRemove={cart.removeItem}
      />
      <OrderSummary
        totals={totals}
        coupon={coupon}
        onCheckout={handleCheckout}
        disabled={cart.items.length === 0}
      />
      <OrderHistory orders={history.orders} totalSpent={history.totalSpent} />
    </div>
  );
}
