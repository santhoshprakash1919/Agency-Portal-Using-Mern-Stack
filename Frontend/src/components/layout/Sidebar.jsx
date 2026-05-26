import { NavLink } from "react-router-dom";
import { getLogoUrl } from "../../utils/productImages.js";

const NAV_ITEMS = [
  {
    to: "/admin",
    label: "Dashboard",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <rect x="14" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <rect x="3" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <rect x="14" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    to: "/admin/products",
    label: "Products",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <path d="M20 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="12" y1="12" x2="12" y2="16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="10" y1="14" x2="14" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: "/admin/orders",
    label: "Orders",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: "/admin/customers",
    label: "Customers",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.85" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: "/admin/agencies",
    label: "Agencies",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <path d="M3 21h18M3 10h18M5 6l7-3 7 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="5" y="10" width="4" height="11" stroke="currentColor" strokeWidth="1.8" />
        <rect x="10" y="10" width="4" height="11" stroke="currentColor" strokeWidth="1.8" />
        <rect x="15" y="10" width="4" height="11" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const logoUrl = getLogoUrl();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        {logoUrl && <img src={logoUrl} alt="Sindhu Agencies logo" />}
        <div>
          <h1 className="sidebar-title">Sindhu Agencies</h1>
          <p className="sidebar-subtitle">Operations Cockpit</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/admin"}
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
              <span style={{ display: "flex", alignItems: "center", opacity: 0.9 }}>{item.icon}</span>
              {item.label}
            </span>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" style={{ opacity: 0.45, flexShrink: 0 }}>
              <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-card">
        <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", marginBottom: "0.4rem" }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" stroke="rgba(255,225,180,0.8)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <strong style={{ fontSize: "0.9rem" }}>Built for daily dispatch</strong>
        </div>
        <span style={{ color: "rgba(255,241,223,0.65)", fontSize: "0.84rem", lineHeight: 1.45 }}>
          Track orders, customers &amp; stock from one place.
        </span>
      </div>
    </aside>
  );
}
