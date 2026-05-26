import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Modal from "../../components/ui/Modal.jsx";
import SearchBar from "../../components/shared/SearchBar.jsx";
import StatusPill from "../../components/shared/StatusPill.jsx";
import Pagination from "../../components/shared/Pagination.jsx";
import DataTable from "../../components/shared/DataTable.jsx";
import useDebounce from "../../hooks/useDebounce.js";
import { useCustomers } from "../../hooks/useCustomers.js";
import { useOrders, useCreateOrder, useDeleteOrder } from "../../hooks/useOrders.js";
import { useProducts } from "../../hooks/useProducts.js";
import { formatCurrency, formatDate } from "../../utils/formatters.js";
import OrderForm from "./OrderForm.jsx";

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const debouncedSearch = useDebounce(search);

  const filters = useMemo(
    () => ({
      page,
      limit: 10,
      status: status || undefined,
      search: debouncedSearch || undefined,
    }),
    [debouncedSearch, page, status]
  );

  const ordersQuery = useOrders(filters);
  const productsQuery = useProducts({ page: 1, limit: 100 });
  const customersQuery = useCustomers({ page: 1, limit: 100 });
  const createOrder = useCreateOrder();
  const deleteOrder = useDeleteOrder();

  const orders = ordersQuery.data?.data || [];
  const products = productsQuery.data?.data || [];
  const customers = customersQuery.data?.data || [];

  const handleCreateOrder = async (values, product, quantity) => {
    try {
      await createOrder.mutateAsync({
        customer: values.customer || undefined,
        storeName: values.storeName,
        customerName: values.customerName,
        phone: values.phone,
        notes: values.notes,
        items: [
          {
            product: values.product,
            quantity,
            unitPrice: product?.price || 0,
            gstPercent: product?.gstPercent || 0,
          },
        ],
      });
      toast.success("Order created");
      setModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to create order");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this order?")) {
      return;
    }

    try {
      await deleteOrder.mutateAsync(id);
      toast.success("Order deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to delete order");
    }
  };

  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">Monitor the pipeline from pending to delivered with searchable history.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>New Order</Button>
      </div>

      <div className="filters-row">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by order number, customer, store, phone" />
        <select className="select" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="packed">Packed</option>
          <option value="dispatched">Dispatched</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {orders.length ? (
        <DataTable
          columns={[
            { key: "orderNumber", title: "Order" },
            {
              key: "customerName",
              title: "Customer",
              render: (row) => (
                <div>
                  <strong>{row.storeName || row.customerName}</strong>
                  <div style={{ color: "var(--muted)" }}>{row.phone}</div>
                </div>
              ),
            },
            {
              key: "items",
              title: "Items",
              render: (row) => row.items?.map((item) => `${item.product?.name || "Product"} x${item.quantity}`).join(", "),
            },
            { key: "status", title: "Status", render: (row) => <StatusPill value={row.status} /> },
            { key: "grandTotal", title: "Total", render: (row) => formatCurrency(row.grandTotal) },
            { key: "createdAt", title: "Date", render: (row) => formatDate(row.createdAt) },
            {
              key: "actions",
              title: "Actions",
              render: (row) => (
                <div className="inline wrap">
                  <Link to={`/admin/orders/${row._id}`}>
                    <Button variant="secondary">View</Button>
                  </Link>
                  <Button variant="danger" onClick={() => handleDelete(row._id)}>
                    Delete
                  </Button>
                </div>
              ),
            },
          ]}
          rows={orders}
        />
      ) : (
        <EmptyState title="No orders found" message="Create a new order to start the dispatch workflow." />
      )}

      <Pagination meta={ordersQuery.data?.meta} onPageChange={setPage} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create order" subtitle="Use the quick order form to book and price a dispatch.">
        <OrderForm
          customers={customers}
          products={products}
          isSubmitting={createOrder.isPending}
          onSubmit={handleCreateOrder}
        />
      </Modal>
    </div>
  );
}
