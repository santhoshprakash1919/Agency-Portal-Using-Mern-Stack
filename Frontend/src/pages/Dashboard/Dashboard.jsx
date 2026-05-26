import { motion } from "framer-motion";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Skeleton from "../../components/ui/Skeleton.jsx";
import { useDashboardStats, useWeeklyOrders } from "../../hooks/useDashboard.js";
import { useOrders } from "../../hooks/useOrders.js";
import { formatCurrency, formatDate } from "../../utils/formatters.js";
import StatusPill from "../../components/shared/StatusPill.jsx";

export default function DashboardPage() {
  const statsQuery = useDashboardStats();
  const weeklyQuery = useWeeklyOrders();
  const recentOrdersQuery = useOrders({ page: 1, limit: 5 });

  const stats = statsQuery.data?.data;
  const recentOrders = recentOrdersQuery.data?.data || [];
  const weeklyOrders = weeklyQuery.data?.data || [];

  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <h1 className="page-title">Operations Dashboard</h1>
          <p className="page-subtitle">Keep dispatch, revenue, pending work, and stock risk in one view.</p>
        </div>
      </div>

      {statsQuery.isLoading ? (
        <div className="grid cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} height={140} />
          ))}
        </div>
      ) : (
        <div className="grid cols-4">
          {[
            ["Today's orders", stats?.todayOrders || 0, "New orders since midnight"],
            ["Monthly revenue", formatCurrency(stats?.monthlyRevenue), "Gross order value this month"],
            ["Pending orders", stats?.pendingOrders || 0, "Orders not yet completed"],
            ["Low stock alerts", stats?.lowStockAlerts || 0, "Products at or below threshold"],
          ].map(([label, value, meta], index) => (
            <motion.section
              key={label}
              className="panel stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <span className="stat-label">{label}</span>
              <h2 className="stat-value">{value}</h2>
              <span className="stat-meta">{meta}</span>
            </motion.section>
          ))}
        </div>
      )}

      <div className="grid cols-2">
        <section className="panel">
          <div className="page-header" style={{ marginBottom: "1rem" }}>
            <div>
              <h2 style={{ margin: 0 }}>Weekly Orders</h2>
              <p className="page-subtitle">Daily order count and revenue trend.</p>
            </div>
          </div>
          {weeklyQuery.isLoading ? (
            <Skeleton height={280} />
          ) : weeklyOrders.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyOrders}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#ce6a19" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No weekly orders yet" message="New chart activity will appear after orders are placed." />
          )}
        </section>

        <section className="panel">
          <div className="page-header" style={{ marginBottom: "1rem" }}>
            <div>
              <h2 style={{ margin: 0 }}>Recent Orders</h2>
              <p className="page-subtitle">Latest order activity across customers.</p>
            </div>
          </div>
          {recentOrdersQuery.isLoading ? (
            <div className="stack">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} height={70} />
              ))}
            </div>
          ) : recentOrders.length ? (
            <div className="stack">
              {recentOrders.map((order) => (
                <div key={order._id} className="panel" style={{ padding: "1rem", boxShadow: "none" }}>
                  <div className="inline wrap" style={{ justifyContent: "space-between" }}>
                    <strong>{order.orderNumber}</strong>
                    <StatusPill value={order.status} />
                  </div>
                  <div style={{ marginTop: "0.5rem", color: "var(--muted)" }}>
                    {(order.storeName || order.customerName) ?? "Unnamed order"} • {formatCurrency(order.grandTotal)}
                  </div>
                  <div style={{ marginTop: "0.25rem", color: "var(--muted)", fontSize: "0.92rem" }}>
                    {formatDate(order.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No orders found" message="Recent orders will show up here once your team starts booking them." />
          )}
        </section>
      </div>
    </div>
  );
}
