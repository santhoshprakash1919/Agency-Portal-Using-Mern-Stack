export default function DataTable({ columns, rows, emptyMessage = "No data found." }) {
  return (
    <div className="table-card">
      <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>{column.title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row, rowIndex) => (
                <tr key={row.id || row._id || rowIndex}>
                  {columns.map((column) => (
                    <td key={column.key}>{column.render ? column.render(row, rowIndex) : row[column.key]}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: "center", color: "var(--muted)" }}>
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
