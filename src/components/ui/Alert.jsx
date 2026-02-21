/**
 * Componente de aviso simple para mostrar mensajes.
 */
function Alert({ variant = "info", children, className = "" }) {
  if (!children) return null;

  
  const variantClass =
    variant === "error"
      ? "text-error"
      : variant === "success"
        ? "text-ok"
        : "text-muted";

  return <p className={`${variantClass} ${className}`.trim()}>{children}</p>;
}

export default Alert;