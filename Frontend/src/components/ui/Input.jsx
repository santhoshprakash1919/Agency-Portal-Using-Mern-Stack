import { forwardRef } from "react";

const Input = forwardRef(function Input(
  { label, error, as = "input", className = "", ...props },
  ref
) {
  const Component = as;

  return (
    <label className="input-group">
      {label ? <span className="label">{label}</span> : null}
      <Component
        ref={ref}
        className={`${as === "textarea" ? "textarea" : "input"} ${className}`.trim()}
        {...props}
      />
      {error ? <span className="helper-error">{error}</span> : null}
    </label>
  );
});

export default Input;
