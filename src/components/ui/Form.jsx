/**
 * Helpers para formularios:
 * - FormStack: layout vertical con espaciado consistente.
 * - Field: label + children (inputs/textarea/etc).
 * - Input / Textarea: aplican clases .input / .textarea.
 */
export function FormStack({ children, compact = false, className = "" }) {
  const base = compact ? "form-stack-compact" : "form-stack";
  return <div className={`${base} ${className}`.trim()}>{children}</div>;
}

export function Field({ label, children }) {
  return (
    <div>
      {label ? <label className="label">{label}</label> : null}
      {children}
    </div>
  );
}

export function Input(props) {
  return <input {...props} className={`input ${props.className || ""}`.trim()} />;
}

export function Textarea(props) {
  return (
    <textarea
      {...props}
      className={`textarea ${props.className || ""}`.trim()}
    />
  );
}