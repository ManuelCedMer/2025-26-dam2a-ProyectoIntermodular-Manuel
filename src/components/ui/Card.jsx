/**
 * Card reutilizable con la clase global .card
 * (fondo, borde, sombra, padding, etc.)
 */
export default function Card({ children, className = "" }) {
  return <section className={`card ${className}`.trim()}>{children}</section>;
}