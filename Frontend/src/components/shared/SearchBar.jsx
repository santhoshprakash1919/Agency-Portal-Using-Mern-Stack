export default function SearchBar({ value, onChange, placeholder = "Search..." }) {
  return (
    <label className="searchbar">
      <span>⌕</span>
      <input
        className="input"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
