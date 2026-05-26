import Badge from "../ui/Badge.jsx";

const statusTheme = {
  pending: { tone: "warning", label: "Pending" },
  confirmed: { tone: "success", label: "Confirmed" },
  packed: { tone: "neutral", label: "Packed" },
  dispatched: { tone: "neutral", label: "Dispatched" },
  delivered: { tone: "success", label: "Delivered" },
  cancelled: { tone: "danger", label: "Cancelled" },
  unpaid: { tone: "danger", label: "Unpaid" },
  partial: { tone: "warning", label: "Partial" },
  paid: { tone: "success", label: "Paid" },
};

export default function StatusPill({ value }) {
  const config = statusTheme[value] || { tone: "neutral", label: value || "Unknown" };

  return (
    <Badge tone={config.tone}>
      <span className="status-dot" style={{ background: "currentColor" }} />
      {config.label}
    </Badge>
  );
}
