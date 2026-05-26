import Button from "../ui/Button.jsx";

export default function Pagination({ meta, onPageChange }) {
  if (!meta) {
    return null;
  }

  return (
    <div className="pagination">
      <span style={{ color: "var(--muted)" }}>
        Page {meta.page} of {meta.pages} • {meta.total} items
      </span>
      <div className="inline">
        <Button variant="secondary" disabled={meta.page <= 1} onClick={() => onPageChange(meta.page - 1)}>
          Previous
        </Button>
        <Button
          variant="secondary"
          disabled={meta.page >= meta.pages}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
