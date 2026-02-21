import { Link } from "react-router-dom";

/**
 * Botón reutilizable:
 * - variant: primary | secondary | danger
 * - size: md | sm
 * - block: width 100%
 *
 * Nota: hereda el comportamiento disabled del botón nativo + CSS (.btn:disabled)
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  block = false,
  className = "",
  ...props
}) {
  const variantClass =
    variant === "secondary"
      ? "btn-secondary"
      : variant === "danger"
        ? "btn-danger"
        : "btn-primary";

  const sizeClass = size === "sm" ? "btn-sm" : "";
  const blockClass = block ? "btn-block" : "";

  return (
    <button
      {...props}
      className={`btn ${variantClass} ${sizeClass} ${blockClass} ${className}`.trim()}
    >
      {children}
    </button>
  );
}

/**
 * Link con estilo de botón (para navegación con React Router)
 * Mantiene la misma estética de .btn.
 */
export function LinkButton({
  to,
  state,
  children,
  variant = "secondary",
  size = "md",
  block = false,
  className = "",
  ...props
}) {
  const variantClass =
    variant === "secondary"
      ? "btn-secondary"
      : variant === "danger"
        ? "btn-danger"
        : "btn-primary";

  const sizeClass = size === "sm" ? "btn-sm" : "";
  const blockClass = block ? "btn-block" : "";

  return (
    <Link
      to={to}
      state={state}
      className={`btn ${variantClass} ${sizeClass} ${blockClass} link-btn ${className}`.trim()}
      {...props}
    >
      {children}
    </Link>
  );
}