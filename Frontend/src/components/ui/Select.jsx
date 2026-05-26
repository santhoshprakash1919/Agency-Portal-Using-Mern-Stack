export default function Select({ label, error, options = [], ...props }) {
  return (
    <label className="select-group">
      {label ? <span className="label">{label}</span> : null}
      <select className="select" {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <span className="helper-error">{error}</span> : null}
    </label>
  );
}
