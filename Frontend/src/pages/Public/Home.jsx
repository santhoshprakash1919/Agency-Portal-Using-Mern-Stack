import "./Home.css";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Skeleton from "../../components/ui/Skeleton.jsx";
import useDebounce from "../../hooks/useDebounce.js";
import { useCreateOrder } from "../../hooks/useOrders.js";
import { useProducts } from "../../hooks/useProducts.js";
import { formatCurrency } from "../../utils/formatters.js";
import { getLogoUrl, getProductImageUrl } from "../../utils/productImages.js";

const CATEGORIES = [
  { label: "All", icon: "🏪" },
  { label: "Beverages", icon: "🥤" },
  { label: "Snacks", icon: "🍪" },
  { label: "Spices", icon: "🌶️" },
  { label: "Dairy", icon: "🥛" },
  { label: "Grains", icon: "🌾" },
  { label: "Others", icon: "📦" },
];

const TRUST_BADGES = [
  { icon: "🚚", title: "Fast Delivery", sub: "Same-day dispatch" },
  { icon: "📄", title: "GST Invoice", sub: "Instant download" },
  { icon: "🔒", title: "Secure Orders", sub: "No account needed" },
  { icon: "🤝", title: "Trusted Since 2010", sub: "Kaveripattinam" },
];

function groupByAgency(products) {
  const map = new Map();
  for (const p of products) {
    const key = p.agency?.name || "General";
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(p);
  }
  return [...map.entries()];
}

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const cardAnim = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
};

/* ── Unit price helper ── */
function getUnitPrice(product, unit) {
  if (unit === "piece") return product.piecePrice || product.price || 0;
  if (unit === "box")   return product.boxPrice   || 0;
  if (unit === "bag")   return product.bagPrice    || 0;
  return product.price || 0;
}

function getUnitLabel(unit, product) {
  if (unit === "piece") return "Piece";
  if (unit === "box")   return product.piecesPerBox ? `Box (${product.piecesPerBox} pcs)` : "Box";
  if (unit === "bag")   return product.piecesPerBag ? `Bag (${product.piecesPerBag} pcs)` : "Bag";
  return unit;
}

/* ── Product card ── */
function ProductCard({ product, onAdd }) {
  const imgUrl = getProductImageUrl(product.name);
  const outOfStock = product.stock != null && product.stock === 0;
  const lowStock   = product.stock != null && product.stock > 0 && product.stock <= 5;

  const units = product.availableUnits?.length ? product.availableUnits : ["piece"];
  const [selectedUnit, setSelectedUnit] = useState(units[0]);
  const unitPrice = getUnitPrice(product, selectedUnit);

  return (
    <motion.article variants={cardAnim} className={`product-card${outOfStock ? " product-out-of-stock" : ""}`}>
      {imgUrl
        ? <img src={imgUrl} alt={product.name} loading="lazy" />
        : <div className="product-image-fallback">
            <svg width="36" height="36" fill="none" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="4" fill="rgba(206,106,25,0.12)" />
              <path d="M3 9h18M9 21V9" stroke="rgba(206,106,25,0.35)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
      }

      <div className="pub-stack" style={{ gap: "0.3rem", flex: 1 }}>
        <strong style={{ fontSize: "0.94rem", lineHeight: 1.3 }}>{product.name}</strong>
        <span style={{ color: "#70584a", fontSize: "0.82rem" }}>{product.agency?.name || "Agency"}</span>

        {/* MRP + Retail price row */}
        <div className="price-row">
          {product.mrp > 0 && (
            <span className="price-mrp">MRP {formatCurrency(product.mrp)}</span>
          )}
          <span className="price-retail">{formatCurrency(product.price || 0)}</span>
          <span className="price-gst">GST {product.gstPercent ?? 0}%</span>
        </div>

        {/* Unit selector */}
        {units.length > 1 && (
          <div className="unit-selector">
            <span className="unit-selector-label">Buy as:</span>
            <div className="unit-chips">
              {units.map((u) => (
                <button
                  key={u}
                  type="button"
                  className={`unit-chip${selectedUnit === u ? " active" : ""}`}
                  onClick={() => setSelectedUnit(u)}
                >
                  {getUnitLabel(u, product)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected unit price highlight */}
        <div className="unit-price-display">
          <span className="unit-price-label">{getUnitLabel(selectedUnit, product)}: </span>
          <span className="unit-price-value">{formatCurrency(unitPrice)}</span>
        </div>

        {lowStock && <span className="product-stock-warning">⚠ Only {product.stock} left</span>}
        {outOfStock && <span className="product-stock-warning" style={{ color: "#b83f35", background: "rgba(184,63,53,0.1)" }}>Out of stock</span>}
      </div>

      <button
        className="pub-btn pub-btn-primary"
        onClick={() => onAdd(product, selectedUnit, unitPrice)}
        disabled={outOfStock}
      >
        {outOfStock ? "Out of Stock" : `Add ${getUnitLabel(selectedUnit, product)} to Cart`}
      </button>
    </motion.article>
  );
}

/* ── Cart item ── */
function CartItem({ item, onUpdate }) {
  return (
    <motion.div layout
      initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
      className="cart-item"
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="cart-item-name">{item.product.name}</div>
        <div className="cart-item-price">
          {item.unitLabel} · {formatCurrency(item.unitPrice)} each
        </div>
      </div>
      <div className="cart-qty-row">
        <button className="cart-qty-btn" onClick={() => onUpdate(item.cartKey, item.quantity - 1)}>−</button>
        <span className="cart-qty-value">{item.quantity}</span>
        <button className="cart-qty-btn" onClick={() => onUpdate(item.cartKey, item.quantity + 1)}>+</button>
      </div>
    </motion.div>
  );
}

function PubInput({ label, ...props }) {
  return (
    <div className="pub-stack" style={{ gap: "0.4rem" }}>
      {label && <label style={{ fontSize: "0.88rem", fontWeight: 600, color: "#70584a" }}>{label}</label>}
      <input className="pub-input" {...props} />
    </div>
  );
}

export default function PublicHomePage() {
  const navigate = useNavigate();
  const logoUrl = getLogoUrl();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [step, setStep] = useState("browse");
  const [form, setForm] = useState({ storeName: "", customerName: "", phone: "", notes: "" });
  const debouncedSearch = useDebounce(search);

  const filters = useMemo(
    () => ({ page: 1, limit: 80, search: debouncedSearch || undefined }),
    [debouncedSearch]
  );

  const productsQuery = useProducts(filters);
  const createOrder = useCreateOrder();
  const allProducts = productsQuery.data?.data || [];

  const products = useMemo(() => {
    if (activeCategory === "All") return allProducts;
    return allProducts.filter(p => (p.category || "Others").toLowerCase() === activeCategory.toLowerCase());
  }, [allProducts, activeCategory]);

  const agencyGroups = useMemo(() => groupByAgency(products), [products]);

  // Cart uses cartKey = productId + unit to allow same product in multiple units
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const subtotal   = cart.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const gstTotal   = cart.reduce((s, i) => s + i.unitPrice * i.quantity * ((i.product.gstPercent || 0) / 100), 0);
  const grandTotal = subtotal + gstTotal;

  const addToCart = (product, unit, unitPrice) => {
    const cartKey = `${product._id}_${unit}`;
    const unitLabel = getUnitLabel(unit, product);
    setCart((prev) => {
      const ex = prev.find(i => i.cartKey === cartKey);
      if (ex) {
        return prev.map(i => i.cartKey === cartKey ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { cartKey, product, unit, unitPrice, unitLabel, quantity: 1 }];
    });
    toast.success(`${product.name} (${unitLabel}) added`, { duration: 1400, icon: "🛒" });
  };

  const updateQuantity = (cartKey, qty) => {
    if (qty <= 0) { setCart(p => p.filter(i => i.cartKey !== cartKey)); return; }
    setCart(p => p.map(i => i.cartKey === cartKey ? { ...i, quantity: qty } : i));
  };

  const submitOrder = async (e) => {
    e.preventDefault();
    if (!cart.length) { toast.error("Add at least one product"); return; }
    try {
      const res = await createOrder.mutateAsync({
        ...form,
        items: cart.map(i => ({
          product:    i.product._id,
          quantity:   i.quantity,
          unitPrice:  i.unitPrice,
          unit:       i.unit,
          unitLabel:  i.unitLabel,
          gstPercent: i.product.gstPercent,
        })),
      });
      toast.success("Order placed! 🎉");
      navigate(`/invoice/${res.data.orderNumber}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to place order");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* Topbar */}
      <header className="public-topbar">
        <div className="public-topbar-brand">
          {logoUrl && <img src={logoUrl} alt="Sindhu Agencies" className="public-topbar-logo" />}
          <h1 className="public-topbar-title">Sindhu Agencies</h1>
        </div>
        <div className="public-topbar-search">
          <span>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8" />
              <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
          <input className="pub-input" style={{ paddingLeft: "2.8rem" }}
            placeholder="Search products, brands..." value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="public-topbar-actions">
          <button className="cart-badge-btn"
            onClick={() => setStep(step === "checkout" ? "browse" : "checkout")}>
            <svg width="17" height="17" fill="none" viewBox="0 0 24 24">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M16 10a4 4 0 0 1-8 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Cart
            {cartCount > 0 && <span key={cartCount} className="cart-badge-count">{cartCount}</span>}
          </button>
          <a href="/admin/login">
            <button className="pub-btn pub-btn-ghost" style={{ borderRadius: 999, padding: "0.5rem 0.95rem", fontSize: "0.88rem" }}>
              Admin
            </button>
          </a>
        </div>
      </header>

      {/* Body */}
      <div style={{ flex: 1, padding: "1.25rem" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Hero */}
          <motion.section className="storefront-hero" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38 }}>
            <div className="pub-inline wrap" style={{ gap: "0.6rem", marginBottom: "1rem" }}>
              {logoUrl && <img src={logoUrl} alt="" className="storefront-logo" />}
              <span className="storefront-hero-tagline">🛒 Public Ordering Portal</span>
            </div>
            <h2 className="storefront-hero-title">
              Sindhu Agencies – <span style={{ color: "#ce6a19" }}>Trusted FMCG Distributor</span>
            </h2>
            <p className="storefront-hero-sub">
              Serving retailers and partners around <strong style={{ color: "#a55012" }}>Kaveripattinam, Krishnagiri District</strong>.
              Browse products, choose piece / box / bag quantity, and download your GST invoice instantly.
            </p>
            <div className="hero-trust-row">
              {TRUST_BADGES.map(b => (
                <div key={b.title} className="hero-trust-badge">
                  <span className="hero-trust-icon">{b.icon}</span>
                  <div><div className="hero-trust-title">{b.title}</div><div className="hero-trust-sub">{b.sub}</div></div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Categories */}
          <div className="category-chips">
            {CATEGORIES.map(cat => (
              <button key={cat.label}
                className={`category-chip${activeCategory === cat.label ? " active" : ""}`}
                onClick={() => setActiveCategory(cat.label)}>
                <span>{cat.icon}</span> {cat.label}
              </button>
            ))}
          </div>

          {/* Main grid */}
          <div className="storefront-grid">
            <section>
              {!productsQuery.isLoading && (
                <motion.div className="results-bar" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <span>Showing <strong>{products.length}</strong> products
                    {activeCategory !== "All" && <> in <strong style={{ color: "#a55012" }}>{activeCategory}</strong></>}
                    {debouncedSearch && <> for <strong style={{ color: "#a55012" }}>"{debouncedSearch}"</strong></>}
                  </span>
                  {activeCategory !== "All" && (
                    <button className="results-bar-clear" onClick={() => setActiveCategory("All")}>Clear ✕</button>
                  )}
                </motion.div>
              )}

              {productsQuery.isLoading ? (
                <div className="pub-card-grid">
                  {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} height={310} />)}
                </div>
              ) : agencyGroups.length ? (
                <div className="pub-stack" style={{ gap: "2rem" }}>
                  {agencyGroups.map(([agency, items]) => (
                    <motion.div key={agency} className="agency-section"
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                      <div className="agency-section-header">
                        <h3 className="agency-section-title">{agency}</h3>
                        <hr className="agency-section-divider" />
                        <span className="agency-section-count">{items.length} items</span>
                      </div>
                      <motion.div className="pub-card-grid" variants={stagger} initial="hidden" animate="visible">
                        {items.map(p => <ProductCard key={p._id} product={p} onAdd={addToCart} />)}
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No products found" message="Try a different search or category." />
              )}
            </section>

            {/* Cart */}
            <AnimatePresence>
              {(cartCount > 0 || step === "checkout") && (
                <motion.aside className="cart-panel"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.26 }}>
                  <div className="cart-panel-header">
                    <h2 className="cart-panel-title">{step === "checkout" ? "Checkout" : "Your Order"}</h2>
                    <span style={{ color: "#70584a", fontSize: "0.86rem" }}>{cartCount} {cartCount === 1 ? "item" : "items"}</span>
                  </div>

                  {step === "browse" ? (
                    <>
                      <div className="pub-stack" style={{ gap: "0.5rem", marginBottom: "1rem" }}>
                        <AnimatePresence>
                          {cart.map(item => <CartItem key={item.cartKey} item={item} onUpdate={updateQuantity} />)}
                        </AnimatePresence>
                      </div>
                      <div className="cart-totals">
                        <div className="cart-totals-row"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                        <div className="cart-totals-row"><span>GST</span><span>{formatCurrency(gstTotal)}</span></div>
                        <div className="cart-totals-row grand"><span>Grand Total</span><strong>{formatCurrency(grandTotal)}</strong></div>
                      </div>
                      <div style={{ marginTop: "1rem" }}>
                        <button className="pub-btn pub-btn-primary" style={{ width: "100%" }} onClick={() => setStep("checkout")}>
                          Proceed to Checkout →
                        </button>
                      </div>
                    </>
                  ) : (
                    <form className="pub-stack" onSubmit={submitOrder}>
                      <button type="button" className="pub-btn pub-btn-ghost"
                        style={{ width: "fit-content", fontSize: "0.86rem" }} onClick={() => setStep("browse")}>
                        ← Back to cart
                      </button>
                      <PubInput label="Store Name" value={form.storeName} required placeholder="Your shop name" onChange={(e) => setForm({ ...form, storeName: e.target.value })} />
                      <PubInput label="Customer Name" value={form.customerName} required placeholder="Your name" onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
                      <PubInput label="Phone" type="tel" value={form.phone} required placeholder="10-digit phone" onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                      <PubInput label="Notes (optional)" value={form.notes} placeholder="Any special requests..." onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                      <div className="cart-totals">
                        <div className="cart-totals-row"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                        <div className="cart-totals-row"><span>GST</span><span>{formatCurrency(gstTotal)}</span></div>
                        <div className="cart-totals-row grand"><span>Grand Total</span><strong>{formatCurrency(grandTotal)}</strong></div>
                      </div>
                      <button type="submit" className="pub-btn pub-btn-primary" style={{ width: "100%" }} disabled={createOrder.isPending}>
                        {createOrder.isPending ? "Placing order..." : "Place Order & Get Invoice"}
                      </button>
                    </form>
                  )}
                </motion.aside>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="public-footer">
        <div className="public-footer-inner">
          <div className="footer-brand-col">
            <div className="pub-inline" style={{ gap: "0.6rem", marginBottom: "0.6rem" }}>
              {logoUrl && <img src={logoUrl} alt="Sindhu Agencies" style={{ width: 36, height: 36, borderRadius: 10, objectFit: "cover" }} />}
              <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#a55012" }}>Sindhu Agencies</span>
            </div>
            <p style={{ color: "#70584a", fontSize: "0.88rem", lineHeight: 1.6, margin: 0, maxWidth: 260 }}>
              Trusted FMCG Distributor serving retailers and partners around Kaveripattinam, Krishnagiri District.
            </p>
          </div>
          <div className="footer-info-col">
            <div className="footer-section-title">Location</div>
            <div className="footer-info-line"><span>📍</span><span>Kaveripattinam,<br />Krishnagiri District,<br />Tamil Nadu</span></div>
          </div>
          <div className="footer-info-col">
            <div className="footer-section-title">Quick Links</div>
            <div className="footer-links">
              <button onClick={() => setActiveCategory("All")} className="footer-link">All Products</button>
              {CATEGORIES.slice(1).map(c => (
                <button key={c.label} onClick={() => setActiveCategory(c.label)} className="footer-link">{c.icon} {c.label}</button>
              ))}
            </div>
          </div>
          <div className="footer-info-col">
            <div className="footer-section-title">How It Works</div>
            <div className="footer-steps">
              {["Browse products","Choose piece/box/bag","Place order","Download invoice"].map((s, i) => (
                <div key={s} className="footer-step"><span className="footer-step-num">{i + 1}</span> {s}</div>
              ))}
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Sindhu Agencies, Kaveripattinam. All rights reserved.</span>
          <a href="/admin/login" style={{ color: "#ce6a19", fontWeight: 600, fontSize: "0.83rem" }}>Admin Portal →</a>
        </div>
      </footer>
    </div>
  );
}
