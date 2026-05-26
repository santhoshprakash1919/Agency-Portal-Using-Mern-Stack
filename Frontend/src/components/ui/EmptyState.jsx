export default function EmptyState({ title, message }) {
  return (
    <div className="empty-state panel">
      <div style={{ fontSize: "2rem" }}>▦</div>
      <h3 style={{ margin: 0 }}>{title}</h3>
      <p style={{ margin: 0, color: "var(--muted)" }}>{message}</p>
    </div>
  );
}
