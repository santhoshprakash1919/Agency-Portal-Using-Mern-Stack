import useAuth from "../../hooks/useAuth.js";
import Button from "../ui/Button.jsx";

export default function TopBar() {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div>
        <strong>Welcome back</strong>
        <div style={{ color: "var(--muted)" }}>
          {user?.name} {user?.role ? `• ${user.role}` : ""}
        </div>
      </div>
      <div className="inline wrap">
        {user?.email ? <span className="badge">{user.email}</span> : null}
        <Button variant="ghost" onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  );
}
