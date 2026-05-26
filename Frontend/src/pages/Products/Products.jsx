import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Input from "../../components/ui/Input.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Select from "../../components/ui/Select.jsx";
import SearchBar from "../../components/shared/SearchBar.jsx";
import StatusPill from "../../components/shared/StatusPill.jsx";
import Pagination from "../../components/shared/Pagination.jsx";
import useAuth from "../../hooks/useAuth.js";
import useDebounce from "../../hooks/useDebounce.js";
import { useAgencies } from "../../hooks/useAgencies.js";
import { useCreateProduct, useDeleteProduct, useProducts, useUpdateProduct } from "../../hooks/useProducts.js";
import { formatCurrency } from "../../utils/formatters.js";
import { getProductImageUrl } from "../../utils/productImages.js";

const emptyProduct = {
  name: "",
  agency: "",
  category: "Other",
  unit: "box",
  price: 0,
  mrp: 0,
  gstPercent: 5,
  stock: 0,
  lowStockThreshold: 10,
};

export default function ProductsPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [agency, setAgency] = useState("");
  const [lowStock, setLowStock] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const debouncedSearch = useDebounce(search);

  const filters = useMemo(
    () => ({
      page,
      limit: 8,
      search: debouncedSearch || undefined,
      category: category || undefined,
      agency: agency || undefined,
      lowStock: lowStock || undefined,
    }),
    [agency, category, debouncedSearch, lowStock, page]
  );

  const productsQuery = useProducts(filters);
  const agenciesQuery = useAgencies();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const openModal = (product = null) => {
    setEditingId(product?._id || null);
    setForm(
      product
        ? {
            name: product.name,
            agency: product.agency?._id || "",
            category: product.category || "Other",
            unit: product.unit || "box",
            price: product.price || 0,
            mrp: product.mrp || 0,
            gstPercent: product.gstPercent || 5,
            stock: product.stock || 0,
            lowStockThreshold: product.lowStockThreshold || 10,
          }
        : emptyProduct
    );
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyProduct);
  };

  const submitProduct = async (event) => {
    event.preventDefault();

    try {
      if (editingId) {
        await updateProduct.mutateAsync({ id: editingId, ...form });
        toast.success("Product updated");
      } else {
        await createProduct.mutateAsync(form);
        toast.success("Product created");
      }
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save product");
    }
  };

  const removeProduct = async (id) => {
    if (!window.confirm("Delete this product?")) {
      return;
    }

    try {
      await deleteProduct.mutateAsync(id);
      toast.success("Product deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to delete product");
    }
  };

  const products = productsQuery.data?.data || [];
  const agencies = agenciesQuery.data?.data || [];

  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">Track stock, prices, GST, and catalog activity across agencies.</p>
        </div>
        {user?.role === "admin" ? <Button onClick={() => openModal()}>Add Product</Button> : null}
      </div>

      <div className="filters-row">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by product name" />
        <Select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          options={[
            { value: "", label: "All categories" },
            { value: "Beverages", label: "Beverages" },
            { value: "Snacks", label: "Snacks" },
            { value: "Dairy", label: "Dairy" },
            { value: "Personal Care", label: "Personal Care" },
            { value: "Household", label: "Household" },
            { value: "Staples", label: "Staples" },
            { value: "Other", label: "Other" },
          ]}
        />
        <Select
          value={agency}
          onChange={(event) => setAgency(event.target.value)}
          options={[
            { value: "", label: "All agencies" },
            ...agencies.map((item) => ({ value: item._id, label: item.name })),
          ]}
        />
        <Button variant={lowStock ? "primary" : "secondary"} onClick={() => setLowStock((value) => !value)}>
          {lowStock ? "Showing low stock" : "Low stock only"}
        </Button>
      </div>

      {products.length ? (
        <div className="card-grid">
          {products.map((product) => {
            const imageUrl = getProductImageUrl(product.name);
            return (
              <section key={product._id} className="panel product-card">
                {imageUrl ? (
                  <img src={imageUrl} alt={product.name} loading="lazy" />
                ) : (
                  <div className="product-image-fallback">No image</div>
                )}
                <div className="stack" style={{ gap: "0.45rem" }}>
                  <strong>{product.name}</strong>
                  <span style={{ color: "var(--muted)" }}>{product.agency?.name || "Unknown agency"}</span>
                  <div className="inline wrap">
                    <StatusPill value={product.stock <= product.lowStockThreshold ? "pending" : "confirmed"} />
                    <span className="badge">{product.category}</span>
                  </div>
                  <div className="inline wrap" style={{ justifyContent: "space-between" }}>
                    <span>{formatCurrency(product.price)}</span>
                    <span style={{ color: "var(--muted)" }}>Stock: {product.stock}</span>
                  </div>
                </div>
                {user?.role === "admin" ? (
                  <div className="inline wrap">
                    <Button variant="secondary" onClick={() => openModal(product)}>
                      Edit
                    </Button>
                    <Button variant="danger" onClick={() => removeProduct(product._id)}>
                      Delete
                    </Button>
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No products found" message="Try loosening your filters or add a new product." />
      )}

      <Pagination meta={productsQuery.data?.meta} onPageChange={setPage} />

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingId ? "Edit Product" : "Create Product"}
        subtitle="Keep catalog fields aligned with GST and stock rules."
      >
        <form className="stack" onSubmit={submitProduct}>
          <div className="form-grid">
            <Input label="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            <Select
              label="Agency"
              value={form.agency}
              onChange={(event) => setForm({ ...form, agency: event.target.value })}
              options={[
                { value: "", label: "Select an agency" },
                ...agencies.map((item) => ({ value: item._id, label: item.name })),
              ]}
            />
            <Input label="Category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} />
            <Input label="Unit" value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} />
            <Input label="Price" type="number" value={form.price} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} />
            <Input label="MRP" type="number" value={form.mrp} onChange={(event) => setForm({ ...form, mrp: Number(event.target.value) })} />
            <Input label="GST %" type="number" value={form.gstPercent} onChange={(event) => setForm({ ...form, gstPercent: Number(event.target.value) })} />
            <Input label="Stock" type="number" value={form.stock} onChange={(event) => setForm({ ...form, stock: Number(event.target.value) })} />
            <Input
              label="Low stock threshold"
              type="number"
              value={form.lowStockThreshold}
              onChange={(event) => setForm({ ...form, lowStockThreshold: Number(event.target.value) })}
            />
          </div>
          <Button type="submit" loading={createProduct.isPending || updateProduct.isPending}>
            Save product
          </Button>
        </form>
      </Modal>
    </div>
  );
}
