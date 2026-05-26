import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../../components/ui/Button.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Skeleton from "../../components/ui/Skeleton.jsx";
import StatusPill from "../../components/shared/StatusPill.jsx";
import { usePublicInvoice } from "../../hooks/useOrders.js";
import { formatCurrency, formatDate } from "../../utils/formatters.js";
import { getLogoUrl } from "../../utils/productImages.js";

function InvoiceSkeleton() {
  return (
    <div className="invoice-shell">
      <div className="invoice-wrap">
        <Skeleton height={118} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem" }}>
          <Skeleton height={90} /><Skeleton height={90} /><Skeleton height={90} />
        </div>
        <Skeleton height={260} />
        <Skeleton height={130} />
      </div>
    </div>
  );
}

function ItemRow({ item, index }) {
  const base  = (item.unitPrice || 0) * (item.quantity || 0);
  const gst   = base * ((item.gstPercent || 0) / 100);
  const total = item.total ?? (base + gst);
  return (
    <motion.tr
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.045, duration: 0.25 }}
    >
      <td style={{ fontWeight: 600 }}>{item.product?.name || "—"}</td>
      <td style={{ color: "var(--muted)" }}>{item.product?.agency?.name || "—"}</td>
      <td style={{ textAlign: "center", fontWeight: 600 }}>{item.quantity}</td>
      <td>{formatCurrency(item.unitPrice)}</td>
      <td style={{ color: "var(--muted)" }}>{item.gstPercent ?? 0}%</td>
      <td style={{ fontWeight: 700, color: "var(--primary-dark)" }}>{formatCurrency(total)}</td>
    </motion.tr>
  );
}

export default function PublicInvoicePage() {
  const { orderNumber } = useParams();
  const { data, isLoading } = usePublicInvoice(orderNumber);
  const order   = data?.data;
  const logoUrl = getLogoUrl();

  if (isLoading) return <InvoiceSkeleton />;

  if (!order) {
    return (
      <div className="invoice-shell">
        <div className="invoice-wrap">
          <EmptyState title="Invoice not found" message="This order number does not exist or has been removed." />
          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <Link to="/"><Button variant="secondary">← Back to Products</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotalIncGst = (order.subtotal || 0) + (order.gstTotal || 0);

  return (
    <div className="invoice-shell">
      <motion.div
        className="invoice-wrap"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
      >

        {/* ── Letterhead ── */}
        <header className="invoice-letterhead">
          <div className="invoice-letterhead-left">
            {logoUrl && <img src={logoUrl} alt="Sindhu Agencies" className="invoice-letterhead-logo" />}
            <div className="invoice-letterhead-company">
              <h1 className="invoice-letterhead-name">Sindhu Agencies</h1>
              <p className="invoice-letterhead-tag">FMCG Wholesale Distributor · GST Registered</p>
            </div>
          </div>
          <div className="invoice-letterhead-right">
            <div className="invoice-number-label">Tax Invoice</div>
            <span className="invoice-number-value">#{order.orderNumber}</span>
            <div className="invoice-number-date">{formatDate(order.createdAt)}</div>
          </div>
        </header>

        {/* ── Actions (print-hidden) ── */}
        <div className="invoice-actions">
          <Link to="/" className="invoice-back-link">
            <Button variant="secondary">← Back to Products</Button>
          </Link>
          <Button
            onClick={() => window.print()}
            style={{ background: "linear-gradient(135deg,var(--primary),var(--accent))", color: "white" }}
          >
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" style={{ marginRight: "0.35rem" }}>
              <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="6" y="13" width="12" height="9" rx="1" stroke="currentColor" strokeWidth="1.8" />
            </svg>
            Download / Print
          </Button>
        </div>

        {/* ── Status ── */}
        <div className="invoice-status-row">
          <StatusPill value={order.status} />
          <StatusPill value={order.paymentStatus} />
        </div>

        {/* ── Info grid ── */}
        <div className="invoice-info-grid">
          <div className="invoice-info-card">
            <div className="invoice-info-label">Bill To</div>
            <div className="invoice-info-value">
              <strong style={{ display: "block", fontSize: "1rem" }}>{order.customerName || "—"}</strong>
              {order.storeName && <span style={{ display: "block", color: "var(--muted)", marginTop: "0.2rem" }}>{order.storeName}</span>}
              {order.phone    && <span style={{ display: "block", color: "var(--muted)", marginTop: "0.15rem" }}>📞 {order.phone}</span>}
            </div>
          </div>

          <div className="invoice-info-card">
            <div className="invoice-info-label">Order Details</div>
            <div className="invoice-info-value">
              <span style={{ display: "block" }}><strong>No.</strong> {order.orderNumber}</span>
              <span style={{ display: "block", color: "var(--muted)", marginTop: "0.2rem" }}>
                <strong style={{ color: "var(--text)" }}>Date:</strong> {formatDate(order.createdAt)}
              </span>
              <span style={{ display: "block", color: "var(--muted)", marginTop: "0.15rem" }}>
                <strong style={{ color: "var(--text)" }}>Items:</strong> {order.items?.length ?? 0}
              </span>
            </div>
          </div>

          <div className="invoice-info-card">
            <div className="invoice-info-label">Supplier</div>
            <div className="invoice-info-value">
              <strong style={{ display: "block", fontSize: "1rem" }}>Sindhu Agencies</strong>
              <span style={{ display: "block", color: "var(--muted)", marginTop: "0.2rem" }}>FMCG Wholesale Distributor</span>
              {order.notes && (
                <span style={{ display: "block", color: "var(--muted)", marginTop: "0.35rem", fontStyle: "italic", fontSize: "0.88rem" }}>
                  Note: {order.notes}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Line items ── */}
        <div className="invoice-items-table">
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Agency</th>
                  <th style={{ textAlign: "center" }}>Qty</th>
                  <th>Unit Price</th>
                  <th>GST %</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {(order.items || []).length
                  ? order.items.map((item, i) => <ItemRow key={i} item={item} index={i} />)
                  : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", color: "var(--muted)", padding: "2rem" }}>
                        No items found.
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Summary ── */}
        <div className="invoice-summary">
          <div className="invoice-summary-box">
            <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: "0.98rem", marginBottom: "0.45rem" }}>
              Amount Summary
            </div>
            <div className="invoice-summary-row">
              <span style={{ color: "var(--muted)" }}>Subtotal (excl. GST)</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="invoice-summary-row">
              <span style={{ color: "var(--muted)" }}>GST Amount</span>
              <span>{formatCurrency(order.gstTotal)}</span>
            </div>
            <div className="invoice-summary-row"
              style={{ borderTop: "1px dashed rgba(111,73,42,0.15)", paddingTop: "0.45rem", marginTop: "0.15rem" }}>
              <span style={{ color: "var(--muted)", fontSize: "0.87rem" }}>Subtotal incl. GST</span>
              <span style={{ fontWeight: 600 }}>{formatCurrency(subtotalIncGst)}</span>
            </div>
            <div className="invoice-summary-row grand-total">
              <span style={{ fontWeight: 700 }}>Grand Total</span>
              <strong>{formatCurrency(order.grandTotal)}</strong>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <motion.p
          style={{ textAlign: "center", color: "var(--muted)", fontSize: "0.84rem", margin: 0, padding: "0.85rem", border: "1px dashed rgba(111,73,42,0.15)", borderRadius: 14 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          Thank you for your order! This is a computer-generated invoice and requires no signature.
          &nbsp;·&nbsp; For queries, contact Sindhu Agencies.
        </motion.p>

      </motion.div>
    </div>
  );
}
