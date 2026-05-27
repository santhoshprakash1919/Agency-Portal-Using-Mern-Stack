import "./Home.css";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Input from "../../components/ui/Input.jsx";
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

/* ── Product card ── */
function ProductCard({ product, onAdd }) {
  const imgUrl = getProductImageUrl(product.name);
  const lowStock = product.stock != null && product.stock > 0 && product.stock <= 5;
  const outOfStock = product.stock != null && product.stock === 0;

  return (
    <motion.article
      variants={cardAnim}
      className={`panel product-card${outOfStock ? " product-out-of-stock" : ""}`}
    >
      {imgUrl ? (
        <img src={imgUrl} alt={product.name} loading="lazy" />
      ) : (
        <div className="product-image-fallback">
          <svg width="36" height="36" fill="none" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="4" fill="rgba(206,106,25,0.12)" />
            <path d="M3 9h18M9 21V9" stroke="rgba(206,106,25,0.35)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      )}

      <div className="stack" style={{ gap: "0.35rem", flex: 1 }}>
        <strong style={{ fontSize: "0.94rem", lineHeight: 1.3 }}>{product.name}</strong>
        <span style={{ color: "var(--muted)", fontSize: "0.82rem" }}>{product.agency?.name || "Agency"}</span>

        {lowStock && <span className="product-stock-warning">⚠ Only {product.stock} left</span>}
        {outOfStock && (
          <span className="product-stock-warning" style={{ color: "var(--danger)", background: "rgba(184,63,53,0.1)" }}>
            Out of stock
          </span>
        )}

        <div className="inline wrap" style={{ justifyContent: "space-between", marginTop: "0.25rem" }}>
          <span style={{ fontWeight: 700, color: "var(--primary-dark)" }}>{formatCurrency(product.price)}</span>
          <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>GST {product.gstPercent ?? 0}%</span>
        </div>
      </div>

      <button
        className="button button-primary"
        style={{ width: "100%", borderRadius: 12, padding: "0.6rem" }}
        onClick={() => onAdd(product)}
        disabled={outOfStock}
      >
        {outOfStock ? "Out of Stock" : "Add to Cart"}
      </button>
    </motion.article>
  );
}

/* ── Cart item row ── */
function CartItem({ item, onUpdate }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2 }}
      className="cart-item"
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="cart-item-name">{item.product.name}</div>
        <div className="cart-item-price">{formatCurrency(item.product.price)} each</div>
      </div>
      <div className="cart-qty-row">
        <button className="cart-qty-btn" onClick={() => onUpdate(item.product._id, item.quantity - 1)}>−</button>
        <span className="cart-qty-value">{item.quantity}</span>
        <button className="cart-qty-btn" onClick={() => onUpdate(item.product._id, item.quantity + 1)}>+</button>
      </div>
    </motion.div>
  );
}

/* ── Main page ── */
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
    return allProducts.filter(
      (p) => (p.category || "Others").toLowerCase() === activeCategory.toLowerCase()
    );
  }, [allProducts, activeCategory]);

  const agencyGroups = useMemo(() => groupByAgency(products), [products]);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const subtotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const gstTotal = cart.reduce((s, i) => s + i.product.price * i.quantity * ((i.product.gstPercent || 0) / 100), 0);
  const grandTotal = subtotal + gstTotal;

  const addToCart = (product) => {
    setCart((prev) => {
      const ex = prev.find((i) => i.product._id === product._id);
      if (ex) {
        if (product.stock != null && ex.quantity >= product.stock) {
          toast.error(`Only ${product.stock} in stock`);
          return prev;
        }
        return prev.map((i) => i.product._id === product._id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product, quantity: 1 }];
    });
    toast.success(`${product.name} added`, { duration: 1400, icon: "🛒" });
  };

  const updateQuantity = (productId, qty) => {
    if (qty <= 0) { setCart((p) => p.filter((i) => i.product._id !== productId)); return; }
    setCart((p) => p.map((i) => i.product._id === productId ? { ...i, quantity: qty } : i));
  };

  const submitOrder = async (e) => {
    e.preventDefault();
    if (!cart.length) { toast.error("Add at least one product"); return; }
    try {
      const res = await createOrder.mutateAsync({
        ...form,
        items: cart.map((i) => ({
          product: i.product._id,
          quantity: i.quantity,
          unitPrice: i.product.price,
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

      {/* ── Sticky topbar ── */}
      <header className="public-topbar">
        <div className="public-topbar-brand">
          {logoUrl && <img src={logoUrl} alt="Sindhu Agencies" className="public-topbar-logo" />}
          <h1 className="public-topbar-title">Sindhu Agencies</h1>
        </div>

        <div className="public-topbar-search searchbar">
          <span>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8" />
              <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
          <input
            className="input"
            placeholder="Search products, brands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="public-topbar-actions">
          <button className="cart-badge-btn" onClick={() => setStep(step === "checkout" ? "browse" : "checkout")}>
            <svg width="17" height="17" fill="none" viewBox="0 0 24 24">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M16 10a4 4 0 0 1-8 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Cart
            {cartCount > 0 && <span key={cartCount} className="cart-badge-count">{cartCount}</span>}
          </button>
          <a href="/admin/login">
            <Button variant="secondary" style={{ borderRadius: 999, padding: "0.5rem 0.95rem", fontSize: "0.88rem" }}>
              Admin
            </Button>
          </a>
        </div>
      </header>

      {/* ── Main content grows to fill space ── */}
      <div style={{ flex: 1, padding: "1.25rem" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* ── Hero ── */}
          <motion.section
            className="storefront-hero panel"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38 }}
          >
            {/* Top row: badge + logo */}
            <div className="inline wrap" style={{ gap: "0.6rem", marginBottom: "1rem" }}>
              {logoUrl && <img src={logoUrl} alt="" className="storefront-logo" />}
              <span className="storefront-hero-tagline">🛒 Public Ordering Portal</span>
            </div>

            {/* Main headline */}
            <h2 className="storefront-hero-title">
              Sindhu Agencies –{" "}
              <span style={{ color: "var(--primary)" }}>Trusted FMCG Distributor</span>
            </h2>

            <p className="storefront-hero-sub">
              Serving retailers and partners around{" "}
              <strong style={{ color: "var(--primary-dark)" }}>Kaveripattinam, Krishnagiri District</strong>.
              Browse products from multiple agencies, place orders instantly, and download your GST invoice — no account required.
            </p>

            {/* Trust badges row */}
            <div className="hero-trust-row">
              {TRUST_BADGES.map((b) => (
                <div key={b.title} className="hero-trust-badge">
                  <span className="hero-trust-icon">{b.icon}</span>
                  <div>
                    <div className="hero-trust-title">{b.title}</div>
                    <div className="hero-trust-sub">{b.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* ── Category chips with icons ── */}
          <div className="category-chips">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                className={`category-chip${activeCategory === cat.label ? " active" : ""}`}
                onClick={() => setActiveCategory(cat.label)}
              >
                <span>{cat.icon}</span> {cat.label}
              </button>
            ))}
          </div>

          {/* ── Main grid ── */}
          <div className="storefront-grid">

            {/* ── Products ── */}
            <section>
              {/* Results count bar */}
              {!productsQuery.isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "1rem",
                    padding: "0.6rem 1rem",
                    background: "rgba(206,106,25,0.06)",
                    borderRadius: 12,
                    border: "1px solid rgba(206,106,25,0.1)",
                  }}
                >
                  <span style={{ fontSize: "0.88rem", color: "var(--muted)" }}>
                    Showing <strong style={{ color: "var(--text)" }}>{products.length}</strong> products
                    {activeCategory !== "All" && <> in <strong style={{ color: "var(--primary-dark)" }}>{activeCategory}</strong></>}
                    {debouncedSearch && <> for <strong style={{ color: "var(--primary-dark)" }}>"{debouncedSearch}"</strong></>}
                  </span>
                  {activeCategory !== "All" && (
                    <button
                      onClick={() => setActiveCategory("All")}
                      style={{ fontSize: "0.82rem", color: "var(--primary)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
                    >
                      Clear filter ✕
                    </button>
                  )}
                </motion.div>
              )}

              {productsQuery.isLoading ? (
                <div className="card-grid">
                  {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} height={280} />)}
                </div>
              ) : agencyGroups.length ? (
                <div className="stack" style={{ gap: "2rem" }}>
                  {agencyGroups.map(([agency, items]) => (
                    <motion.div
                      key={agency}
                      className="agency-section"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35 }}
                    >
                      <div className="agency-section-header">
                        <h3 className="agency-section-title">{agency}</h3>
                        <hr className="agency-section-divider" />
                        <span className="agency-section-count">{items.length} items</span>
                      </div>
                      <motion.div className="card-grid" variants={stagger} initial="hidden" animate="visible">
                        {items.map((p) => <ProductCard key={p._id} product={p} onAdd={addToCart} />)}
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No products found" message="Try a different search or category." />
              )}
            </section>

            {/* ── Cart / Checkout Panel ── */}
            <AnimatePresence>
              {(cartCount > 0 || step === "checkout") && (
                <motion.aside
                  className="panel cart-panel"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.26 }}
                >
                  <div className="cart-panel-header">
                    <h2 className="cart-panel-title">
                      {step === "checkout" ? "Checkout" : "Your Order"}
                    </h2>
                    <span style={{ color: "var(--muted)", fontSize: "0.86rem" }}>
                      {cartCount} {cartCount === 1 ? "item" : "items"}
                    </span>
                  </div>

                  {step === "browse" ? (
                    <>
                      <div className="stack" style={{ gap: "0.5rem", marginBottom: "1rem" }}>
                        <AnimatePresence>
                          {cart.map((item) => (
                            <CartItem key={item.product._id} item={item} onUpdate={updateQuantity} />
                          ))}
                        </AnimatePresence>
                      </div>

                      <div className="cart-totals">
                        <div className="cart-totals-row">
                          <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="cart-totals-row">
                          <span>GST</span><span>{formatCurrency(gstTotal)}</span>
                        </div>
                        <div className="cart-totals-row grand">
                          <span>Grand Total</span><strong>{formatCurrency(grandTotal)}</strong>
                        </div>
                      </div>

                      <div style={{ marginTop: "1rem" }}>
                        <Button style={{ width: "100%" }} onClick={() => setStep("checkout")}>
                          Proceed to Checkout →
                        </Button>
                      </div>
                    </>
                  ) : (
                    <form className="stack" onSubmit={submitOrder}>
                      <button
                        type="button"
                        className="button button-ghost"
                        style={{ width: "fit-content", padding: "0.38rem 0.7rem", fontSize: "0.86rem" }}
                        onClick={() => setStep("browse")}
                      >
                        ← Back to cart
                      </button>

                      <Input label="Store Name" value={form.storeName} required
                        onChange={(e) => setForm({ ...form, storeName: e.target.value })} />
                      <Input label="Customer Name" value={form.customerName} required
                        onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
                      <Input label="Phone" type="tel" value={form.phone} required
                        onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                      <Input label="Notes (optional)" as="textarea" rows={2} value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })} />

                      <div className="cart-totals">
                        <div className="cart-totals-row">
                          <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="cart-totals-row">
                          <span>GST</span><span>{formatCurrency(gstTotal)}</span>
                        </div>
                        <div className="cart-totals-row grand">
                          <span>Grand Total</span><strong>{formatCurrency(grandTotal)}</strong>
                        </div>
                      </div>

                      <Button type="submit" loading={createOrder.isPending} style={{ width: "100%" }}>
                        Place Order &amp; Get Invoice
                      </Button>
                    </form>
                  )}
                </motion.aside>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="public-footer">
        <div className="public-footer-inner">

          {/* Brand column */}
          <div className="footer-brand-col">
            <div className="inline" style={{ gap: "0.6rem", marginBottom: "0.6rem" }}>
              {logoUrl && (
                <img src={logoUrl} alt="Sindhu Agencies" style={{ width: 36, height: 36, borderRadius: 10, objectFit: "cover" }} />
              )}
              <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "var(--primary-dark)" }}>
                Sindhu Agencies
              </span>
            </div>
            <p style={{ color: "var(--muted)", fontSize: "0.88rem", lineHeight: 1.6, margin: 0, maxWidth: 260 }}>
              Trusted FMCG Distributor serving retailers and partners around Kaveripattinam, Krishnagiri District.
            </p>
          </div>

          {/* Info column */}
          <div className="footer-info-col">
            <div className="footer-section-title">Location</div>
            <div className="footer-info-line">
              <span>📍</span>
              <span>Kaveripattinam,<br />Krishnagiri District,<br />Tamil Nadu</span>
            </div>
          </div>

          {/* Quick links */}
          <div className="footer-info-col">
            <div className="footer-section-title">Quick Links</div>
            <div className="footer-links">
              <button onClick={() => setActiveCategory("All")} className="footer-link">All Products</button>
              {CATEGORIES.slice(1).map(c => (
                <button key={c.label} onClick={() => setActiveCategory(c.label)} className="footer-link">
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div className="footer-info-col">
            <div className="footer-section-title">How It Works</div>
            <div className="footer-steps">
              <div className="footer-step"><span className="footer-step-num">1</span> Browse products</div>
              <div className="footer-step"><span className="footer-step-num">2</span> Add to cart</div>
              <div className="footer-step"><span className="footer-step-num">3</span> Place order</div>
              <div className="footer-step"><span className="footer-step-num">4</span> Download invoice</div>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Sindhu Agencies, Kaveripattinam. All rights reserved.</span>
          <a href="/admin/login" style={{ color: "var(--primary)", fontWeight: 600, fontSize: "0.83rem" }}>
            Admin Portal →
          </a>
        </div>
      </footer>

    </div>
  );
}
