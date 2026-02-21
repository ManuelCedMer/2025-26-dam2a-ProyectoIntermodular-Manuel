/**
 * Estado vacío reutilizable.
 */
function EmptyState({ text = "No hay datos para mostrar.", className = "" }) {
  return <p className={className}>{text}</p>;
}

export default EmptyState;