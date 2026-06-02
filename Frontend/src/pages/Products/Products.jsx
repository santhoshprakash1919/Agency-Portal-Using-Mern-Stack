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

const UNIT_OPTIONS = [
  { value: "piece", label: "Piece" },
  { value: "box",   label: "Box" },
  { value: "bag",   label: "Bag" },
  { value: "kg",    label: "Kg" },
  { value: "litre", label: "Litre" },
  { value: "pack",  label: "Pack" },
];

const emptyProduct = {
  name: "", agency: "", category: "Other",
  price: 0, mrp: 0,
  piecePrice: 0, boxPrice: 0, bagPrice: 0,
  piecesPerBox: 0, piecesPerBag: 0,
  availableUnits: ["piece"],
  gstPercent: 5, stock: 0, lowStockThreshold: 10,
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

  const filters = useMemo(() => ({
    page, limit: 8,
    search: debouncedSearch || undefined,
    category: category || undefined,
    agency: agency || undefined,
    lowStock: lowStock || undefined,
  }), [agency, category, debouncedSearch, lowStock, page]);

  const productsQuery = useProducts(filters);
  const agenciesQuery = useAgencies();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const openModal = (product = null) => {
    setEditingId(product?._id || null);
    setForm(product ? {
      name:           product.name,
      agency:         product.agency?._id || "",
      category:       product.category || "Other",
      price:          product.price || 0,
      mrp:            product.mrp || 0,
      piecePrice:     product.piecePrice || 0,
      boxPrice:       product.boxPrice || 0,
      bagPrice:       product.bagPrice || 0,
      piecesPerBox:   product.piecesPerBox || 0,
      piecesPerBag:   product.piecesPerBag || 0,
      availableUnits: product.availableUnits?.length ? product.availableUnits : ["piece"],
      gstPercent:     product.gstPercent || 5,
      stock:          product.stock || 0,
      lowStockThreshold: product.lowStockThreshold || 10,
    } : emptyProduct);
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditingId(null); setForm(emptyProduct); };

  const toggleUnit = (unit) => {
    setForm((f) => ({
      ...f,
      availableUnits: f.availableUnits.includes(unit)
        ? f.availableUnits.filter((u) => u !== unit)
        : [...f.availableUnits, unit],
    }));
  };

  const submitProduct = async (e) => {
    e.preventDefault();
    if (!form.availableUnits.length) { toast.error("Select at least one unit type"); return; }
    try {
      if (editingId) {
        await updateProduct.mutateAsync({ id: editingId, ...form });
        toast.success("Product updated");
      } else {
        await createProduct.mutateAsync(form);
        toast.success("Product created");
      }
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to save product");
    }
  };

  const removeProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteProduct.mutateAsync(id);
      toast.success("Product deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to delete product");
    }
  };

  const products  = productsQuery.data?.data  || [];
  const agencies  = agenciesQuery.data?.data  || [];

  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">Manage catalog, unit pricing, MRP and stock across agencies.</p>
        </div>
        {user?.role === "admin" && <Button onClick={() => openModal()}>Add Product</Button>}
      </div>

      <div className="filters-row">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by product name" />
        <Select value={category} onChange={(e) => setCategory(e.target.value)}
          options={[
            { value: "", label: "All categories" },
            ...["Beverages","Snacks","Dairy","Personal Care","Household","Staples","Other"].map(c => ({ value: c, label: c }))
          ]} />
        <Select value={agency} onChange={(e) => setAgency(e.target.value)}
          options={[{ value: "", label: "All agencies" }, ...agencies.map(a => ({ value: a._id, label: a.name }))]} />
        <Button variant={lowStock ? "primary" : "secondary"} onClick={() => setLowStock(v => !v)}>
          {lowStock ? "Showing low stock" : "Low stock only"}
        </Button>
      </div>

      {products.length ? (
        <div className="card-grid">
          {products.map((product) => {
            const imageUrl = getProductImageUrl(product.name);
            const units = product.availableUnits || [];
            return (
              <section key={product._id} className="panel admin-product-card">
                {imageUrl
                  ? <img src={imageUrl} alt={product.name} loading="lazy" />
                  : <div className="admin-product-image-fallback">No image</div>}

                <div className="stack" style={{ gap: "0.45rem" }}>
                  <strong>{product.name}</strong>
                  <span style={{ color: "var(--muted)" }}>{product.agency?.name || "Unknown agency"}</span>

                  <div className="inline wrap">
                    <StatusPill value={product.stock <= product.lowStockThreshold ? "pending" : "confirmed"} />
                    <span className="badge">{product.category}</span>
                  </div>

                  {/* Pricing display */}
                  <div className="stack" style={{ gap: "0.25rem", marginTop: "0.25rem" }}>
                    <div className="inline wrap" style={{ justifyContent: "space-between" }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--muted)", textDecoration: "line-through" }}>
                        MRP {formatCurrency(product.mrp)}
                      </span>
                      <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>Stock: {product.stock}</span>
                    </div>
                    {units.includes("piece") && product.piecePrice > 0 && (
                      <span style={{ fontSize: "0.82rem" }}>🔹 Piece: <strong>{formatCurrency(product.piecePrice)}</strong></span>
                    )}
                    {units.includes("box") && product.boxPrice > 0 && (
                      <span style={{ fontSize: "0.82rem" }}>📦 Box ({product.piecesPerBox} pcs): <strong>{formatCurrency(product.boxPrice)}</strong></span>
                    )}
                    {units.includes("bag") && product.bagPrice > 0 && (
                      <span style={{ fontSize: "0.82rem" }}>🛍 Bag ({product.piecesPerBag} pcs): <strong>{formatCurrency(product.bagPrice)}</strong></span>
                    )}
                  </div>
                </div>

                {user?.role === "admin" && (
                  <div className="inline wrap">
                    <Button variant="secondary" onClick={() => openModal(product)}>Edit</Button>
                    <Button variant="danger" onClick={() => removeProduct(product._id)}>Delete</Button>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No products found" message="Try loosening your filters or add a new product." />
      )}

      <Pagination meta={productsQuery.data?.meta} onPageChange={setPage} />

      <Modal open={modalOpen} onClose={closeModal}
        title={editingId ? "Edit Product" : "Create Product"}
        subtitle="Set MRP, retail price and unit pricing for piece, box and bag.">
        <form className="stack" onSubmit={submitProduct}>

          {/* Basic info */}
          <div className="form-grid">
            <Input label="Product Name" value={form.name} required
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Select label="Agency" value={form.agency}
              onChange={(e) => setForm({ ...form, agency: e.target.value })}
              options={[{ value: "", label: "Select an agency" }, ...agencies.map(a => ({ value: a._id, label: a.name }))]} />
            <Select label="Category" value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              options={["Beverages","Snacks","Dairy","Personal Care","Household","Staples","Other"].map(c => ({ value: c, label: c }))} />
            <Select label="GST %" value={form.gstPercent}
              onChange={(e) => setForm({ ...form, gstPercent: Number(e.target.value) })}
              options={[0,5,12,18,28].map(g => ({ value: g, label: `${g}%` }))} />
          </div>

          {/* MRP + Retail */}
          <div style={{ padding: "1rem", background: "rgba(206,106,25,0.06)", borderRadius: 14, border: "1px solid rgba(206,106,25,0.12)" }}>
            <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--primary-dark)", marginBottom: "0.75rem" }}>
              💰 MRP & Base Price
            </div>
            <div className="form-grid">
              <Input label="MRP (printed on packet)" type="number" min="0" value={form.mrp}
                onChange={(e) => setForm({ ...form, mrp: Number(e.target.value) })} />
              <Input label="Retail Price (default)" type="number" min="0" value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            </div>
          </div>

          {/* Available unit types */}
          <div style={{ padding: "1rem", background: "rgba(206,106,25,0.06)", borderRadius: 14, border: "1px solid rgba(206,106,25,0.12)" }}>
            <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--primary-dark)", marginBottom: "0.75rem" }}>
              📦 Available Unit Types (select all that apply)
            </div>
            <div className="inline wrap" style={{ gap: "0.5rem", marginBottom: "1rem" }}>
              {UNIT_OPTIONS.map(({ value, label }) => (
                <button key={value} type="button"
                  onClick={() => toggleUnit(value)}
                  style={{
                    padding: "0.4rem 0.9rem",
                    borderRadius: 999,
                    border: "1.5px solid",
                    borderColor: form.availableUnits.includes(value) ? "var(--primary)" : "rgba(113,76,46,0.2)",
                    background: form.availableUnits.includes(value) ? "rgba(206,106,25,0.12)" : "white",
                    color: form.availableUnits.includes(value) ? "var(--primary-dark)" : "var(--muted)",
                    fontWeight: 600, fontSize: "0.84rem", cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}>
                  {form.availableUnits.includes(value) ? "✓ " : ""}{label}
                </button>
              ))}
            </div>

            {/* Piece pricing */}
            {form.availableUnits.includes("piece") && (
              <div style={{ marginBottom: "0.75rem" }}>
                <Input label="🔹 Price per Piece (₹)" type="number" min="0" value={form.piecePrice}
                  onChange={(e) => setForm({ ...form, piecePrice: Number(e.target.value) })} />
              </div>
            )}

            {/* Box pricing */}
            {form.availableUnits.includes("box") && (
              <div className="form-grid" style={{ marginBottom: "0.75rem" }}>
                <Input label="📦 Price per Box (₹)" type="number" min="0" value={form.boxPrice}
                  onChange={(e) => setForm({ ...form, boxPrice: Number(e.target.value) })} />
                <Input label="Pieces per Box" type="number" min="0" value={form.piecesPerBox}
                  onChange={(e) => setForm({ ...form, piecesPerBox: Number(e.target.value) })} />
              </div>
            )}

            {/* Bag pricing */}
            {form.availableUnits.includes("bag") && (
              <div className="form-grid">
                <Input label="🛍 Price per Bag (₹)" type="number" min="0" value={form.bagPrice}
                  onChange={(e) => setForm({ ...form, bagPrice: Number(e.target.value) })} />
                <Input label="Pieces per Bag" type="number" min="0" value={form.piecesPerBag}
                  onChange={(e) => setForm({ ...form, piecesPerBag: Number(e.target.value) })} />
              </div>
            )}
          </div>

          {/* Stock */}
          <div className="form-grid">
            <Input label="Stock Quantity" type="number" min="0" value={form.stock}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
            <Input label="Low Stock Alert at" type="number" min="0" value={form.lowStockThreshold}
              onChange={(e) => setForm({ ...form, lowStockThreshold: Number(e.target.value) })} />
          </div>

          <Button type="submit" loading={createProduct.isPending || updateProduct.isPending}>
            Save Product
          </Button>
        </form>
      </Modal>
    </div>
  );
}
