import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import Button from "../../components/ui/Button.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Skeleton from "../../components/ui/Skeleton.jsx";
import StatusPill from "../../components/shared/StatusPill.jsx";
import { useOrder, useUpdateOrderStatus } from "../../hooks/useOrders.js";
import { formatCurrency, formatDate } from "../../utils/formatters.js";

const statusFlow = ["pending", "confirmed", "packed", "dispatched", "delivered"];

export default function OrderDetailPage() {
  const { id } = useParams();
  const orderQuery = useOrder(id);
  const updateStatus = useUpdateOrderStatus();
  const order = orderQuery.data?.data;

  if (orderQuery.isLoading) {
    return <Skeleton height={420} />;
  }

  if (!order) {
    return <EmptyState title="Order not found" message="The selected order could not be loaded." />;
  }

  const currentIndex = statusFlow.indexOf(order.status);
  const nextStatus = currentIndex >= 0 && currentIndex < statusFlow.length - 1 ? statusFlow[currentIndex + 1] : null;

  const advanceStatus = async () => {
    if (!nextStatus) {
      return;
    }

    try {
      await updateStatus.mutateAsync({ id, status: nextStatus, note: `Advanced to ${nextStatus}` });
      toast.success(`Order moved to ${nextStatus}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update status");
    }
  };

  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <h1 className="page-title">{order.orderNumber}</h1>
          <p className="page-subtitle">
            {order.storeName || order.customerName} • {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="inline wrap">
          <Button variant="secondary" onClick={() => window.print()}>
            Print invoice
          </Button>
          {nextStatus ? <Button onClick={advanceStatus}>Advance to {nextStatus}</Button> : null}
        </div>
      </div>

      <section className="panel">
        <div className="inline wrap" style={{ justifyContent: "space-between", marginBottom: "1rem" }}>
          <StatusPill value={order.status} />
          <StatusPill value={order.paymentStatus} />
        </div>
        <div className="grid cols-3">
          <div>
            <strong>Customer</strong>
            <div style={{ color: "var(--muted)" }}>{order.customerName}</div>
            <div style={{ color: "var(--muted)" }}>{order.phone}</div>
          </div>
          <div>
            <strong>Store</strong>
            <div style={{ color: "var(--muted)" }}>{order.storeName}</div>
          </div>
          <div>
            <strong>Notes</strong>
            <div style={{ color: "var(--muted)" }}>{order.notes || order.description || "-"}</div>
          </div>
        </div>
      </section>

      <section className="table-card">
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>GST</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, index) => (
                <tr key={index}>
                  <td>{item.product?.name || "-"}</td>
                  <td>{item.quantity}</td>
                  <td>{formatCurrency(item.unitPrice)}</td>
                  <td>{item.gstPercent}%</td>
                  <td>{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid cols-2">
        <div className="panel">
          <h3 style={{ marginTop: 0 }}>Status Timeline</h3>
          <div className="stack">
            {(order.statusTimeline || []).map((item, index) => (
              <div key={index} className="panel" style={{ boxShadow: "none" }}>
                <div className="inline wrap" style={{ justifyContent: "space-between" }}>
                  <StatusPill value={item.status} />
                  <span style={{ color: "var(--muted)", fontSize: "0.92rem" }}>{formatDate(item.changedAt)}</span>
                </div>
                <div style={{ marginTop: "0.5rem", color: "var(--muted)" }}>{item.note || "-"}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h3 style={{ marginTop: 0 }}>Totals</h3>
          <div className="stack">
            <div className="inline wrap" style={{ justifyContent: "space-between" }}>
              <span>Subtotal</span>
              <strong>{formatCurrency(order.subtotal)}</strong>
            </div>
            <div className="inline wrap" style={{ justifyContent: "space-between" }}>
              <span>GST</span>
              <strong>{formatCurrency(order.gstTotal)}</strong>
            </div>
            <div className="inline wrap" style={{ justifyContent: "space-between" }}>
              <span>Grand total</span>
              <strong>{formatCurrency(order.grandTotal)}</strong>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
