/**
 * Componentes de layout reutilizables:
 * - Page: contenedor principal con ancho/padding global.
 * - PageHeader / PageTitle / PageSubtitle: cabecera consistente.
 */
export function Page({ children, size = "lg" }) {
  const sizeClass = size === "md" ? "page-container--md" : "";
  return (
    <main className={`page-container ${sizeClass}`.trim()}>{children}</main>
  );
}

export function PageHeader({ children }) {
  return <header className="page-header">{children}</header>;
}

export function PageTitle({ children }) {
  return <h2 className="page-title">{children}</h2>;
}

export function PageSubtitle({ children, strong = false }) {
  if (strong) return <p className="page-subtitle-strong">{children}</p>;
  return <p className="page-subtitle">{children}</p>;
}