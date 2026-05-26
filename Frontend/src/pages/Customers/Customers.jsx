import { useState } from "react";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Input from "../../components/ui/Input.jsx";
import Modal from "../../components/ui/Modal.jsx";
import SearchBar from "../../components/shared/SearchBar.jsx";
import Pagination from "../../components/shared/Pagination.jsx";
import DataTable from "../../components/shared/DataTable.jsx";
import useAuth from "../../hooks/useAuth.js";
import useDebounce from "../../hooks/useDebounce.js";
import { useCreateCustomer, useCustomerOrders, useCustomers, useUpdateCustomer } from "../../hooks/useCustomers.js";
import { formatCurrency, formatDate } from "../../utils/formatters.js";

const emptyCustomer = {
  shopName: "",
  ownerName: "",
  phone: "",
  area: "",
  address: "",
  gstNumber: "",
  creditLimit: 0,
};

export default function CustomersPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyCustomer);
  const debouncedSearch = useDebounce(search);

  const customersQuery = useCustomers({ page, limit: 10, search: debouncedSearch || undefined });
  const customerOrdersQuery = useCustomerOrders(selectedCustomerId);
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();

  const customers = customersQuery.data?.data || [];
  const customerOrders = customerOrdersQuery.data?.data || [];

  const openModal = (customer = null) => {
    setEditingId(customer?._id || null);
    setForm(
      customer
        ? {
            shopName: customer.shopName || "",
            ownerName: customer.ownerName || "",
            phone: customer.phone || "",
            area: customer.area || "",
            address: customer.address || "",
            gstNumber: customer.gstNumber || "",
            creditLimit: customer.creditLimit || 0,
          }
        : emptyCustomer
    );
    setModalOpen(true);
  };

  const saveCustomer = async (event) => {
    event.preventDefault();
    try {
      if (editingId) {
        await updateCustomer.mutateAsync({ id: editingId, ...form });
        toast.success("Customer updated");
      } else {
        await createCustomer.mutateAsync(form);
        toast.success("Customer created");
      }
      setModalOpen(false);
      setEditingId(null);
      setForm(emptyCustomer);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save customer");
    }
  };

  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">Search retail accounts, update contact details, and inspect order history.</p>
        </div>
        {user?.role === "admin" ? <Button onClick={() => openModal()}>Add Customer</Button> : null}
      </div>

      <div className="filters-row">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, phone, or area" />
      </div>

      {customers.length ? (
        <DataTable
          columns={[
            { key: "shopName", title: "Shop" },
            { key: "ownerName", title: "Owner" },
            { key: "phone", title: "Phone" },
            { key: "area", title: "Area" },
            { key: "creditLimit", title: "Credit", render: (row) => formatCurrency(row.creditLimit) },
            {
              key: "actions",
              title: "Actions",
              render: (row) => (
                <div className="inline wrap">
                  <Button variant="secondary" onClick={() => setSelectedCustomerId(row._id)}>
                    Orders
                  </Button>
                  {user?.role === "admin" ? (
                    <Button variant="secondary" onClick={() => openModal(row)}>
                      Edit
                    </Button>
                  ) : null}
                </div>
              ),
            },
          ]}
          rows={customers}
        />
      ) : (
        <EmptyState title="No customers found" message="Customer accounts will appear here as you create them." />
      )}

      <Pagination meta={customersQuery.data?.meta} onPageChange={setPage} />

      {selectedCustomerId ? (
        <section className="panel">
          <div className="page-header">
            <div>
              <h2 style={{ margin: 0 }}>Customer Order History</h2>
              <p className="page-subtitle">Recent orders for the selected account.</p>
            </div>
            <Button variant="ghost" onClick={() => setSelectedCustomerId(null)}>
              Hide
            </Button>
          </div>
          {customerOrders.length ? (
            <div className="stack">
              {customerOrders.map((order) => (
                <div key={order._id} className="panel" style={{ boxShadow: "none" }}>
                  <strong>{order.orderNumber}</strong>
                  <div style={{ color: "var(--muted)" }}>
                    {formatDate(order.createdAt)} • {formatCurrency(order.grandTotal)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No customer orders yet" message="This account does not have linked orders yet." />
          )}
        </section>
      ) : null}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit customer" : "Add customer"}>
        <form className="stack" onSubmit={saveCustomer}>
          <div className="form-grid">
            <Input label="Shop name" value={form.shopName} onChange={(event) => setForm({ ...form, shopName: event.target.value })} />
            <Input label="Owner name" value={form.ownerName} onChange={(event) => setForm({ ...form, ownerName: event.target.value })} />
            <Input label="Phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
            <Input label="Area" value={form.area} onChange={(event) => setForm({ ...form, area: event.target.value })} />
            <Input label="GST number" value={form.gstNumber} onChange={(event) => setForm({ ...form, gstNumber: event.target.value })} />
            <Input
              label="Credit limit"
              type="number"
              value={form.creditLimit}
              onChange={(event) => setForm({ ...form, creditLimit: Number(event.target.value) })}
            />
            <div style={{ gridColumn: "1 / -1" }}>
              <Input label="Address" as="textarea" rows={3} value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
            </div>
          </div>
          <Button type="submit" loading={createCustomer.isPending || updateCustomer.isPending}>
            Save customer
          </Button>
        </form>
      </Modal>
    </div>
  );
}
