/**
 * Estado de carga reutilizable.
 */
function LoadingState({ text = "Cargando...", className = "" }) {
  return <p className={className}>{text}</p>;
}

export default LoadingState;