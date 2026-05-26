import { Outlet } from "react-router-dom";
import MobileNav from "./MobileNav.jsx";
import Sidebar from "./Sidebar.jsx";
import TopBar from "./TopBar.jsx";

export default function AppLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="content-shell">
        <TopBar />
        <main className="page-shell">
          <Outlet />
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
