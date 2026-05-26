import { useState } from "react";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Input from "../../components/ui/Input.jsx";
import Modal from "../../components/ui/Modal.jsx";
import DataTable from "../../components/shared/DataTable.jsx";
import useAuth from "../../hooks/useAuth.js";
import { useAgencies, useCreateAgency, useUpdateAgency } from "../../hooks/useAgencies.js";

const emptyAgency = {
  name: "",
  category: "",
};

export default function AgenciesPage() {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyAgency);

  const agenciesQuery = useAgencies();
  const createAgency = useCreateAgency();
  const updateAgency = useUpdateAgency();
  const agencies = agenciesQuery.data?.data || [];

  const openModal = (agency = null) => {
    setEditingId(agency?._id || null);
    setForm(agency ? { name: agency.name || "", category: agency.category || "" } : emptyAgency);
    setModalOpen(true);
  };

  const saveAgency = async (event) => {
    event.preventDefault();
    try {
      if (editingId) {
        await updateAgency.mutateAsync({ id: editingId, ...form });
        toast.success("Agency updated");
      } else {
        await createAgency.mutateAsync(form);
        toast.success("Agency created");
      }
      setModalOpen(false);
      setEditingId(null);
      setForm(emptyAgency);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save agency");
    }
  };

  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <h1 className="page-title">Agencies</h1>
          <p className="page-subtitle">Maintain agency relationships and track attached product counts.</p>
        </div>
        {user?.role === "admin" ? <Button onClick={() => openModal()}>Add Agency</Button> : null}
      </div>

      {agencies.length ? (
        <DataTable
          columns={[
            { key: "name", title: "Agency" },
            { key: "category", title: "Category" },
            { key: "productCount", title: "Products" },
            {
              key: "actions",
              title: "Actions",
              render: (row) => (
                user?.role === "admin" ? (
                  <Button variant="secondary" onClick={() => openModal(row)}>
                    Edit
                  </Button>
                ) : null
              ),
            },
          ]}
          rows={agencies}
        />
      ) : (
        <EmptyState title="No agencies found" message="Create agencies first so products can be categorized correctly." />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit agency" : "Add agency"}>
        <form className="stack" onSubmit={saveAgency}>
          <Input label="Agency name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <Input label="Category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} />
          <Button type="submit" loading={createAgency.isPending || updateAgency.isPending}>
            Save agency
          </Button>
        </form>
      </Modal>
    </div>
  );
}
