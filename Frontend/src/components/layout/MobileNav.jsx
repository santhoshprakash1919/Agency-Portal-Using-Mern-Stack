import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/admin", label: "Home" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/customers", label: "Customers" },
  { to: "/admin/agencies", label: "Agencies" },
];

export default function MobileNav() {
  return (
    <nav className="mobile-nav">
      {navItems.map((item) => (
        <NavLink key={item.to} to={item.to} end={item.to === "/admin"}>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
