import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout.jsx";
import ProtectedRoute from "./components/layout/ProtectedRoute.jsx";
import AgenciesPage from "./pages/Agencies/Agencies.jsx";
import CustomersPage from "./pages/Customers/Customers.jsx";
import DashboardPage from "./pages/Dashboard/Dashboard.jsx";
import PublicHomePage from "./pages/Public/Home.jsx";
import PublicInvoicePage from "./pages/Public/Invoice.jsx";
import LoginPage from "./pages/Login/Login.jsx";
import OrderDetailPage from "./pages/Orders/OrderDetail.jsx";
import OrdersPage from "./pages/Orders/Orders.jsx";
import ProductsPage from "./pages/Products/Products.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicHomePage />} />
      <Route path="/invoice/:orderNumber" element={<PublicInvoicePage />} />
      <Route path="/login" element={<Navigate to="/admin/login" replace />} />
      <Route path="/admin/login" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="agencies" element={<AgenciesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
