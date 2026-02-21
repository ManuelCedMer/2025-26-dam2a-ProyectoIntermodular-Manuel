/**
 * Cabecera reutilizable para Cards:
 */
function CardHeader({ title, subtitle, size = "md", className = "" }) {
  const TitleTag = size === "sm" ? "h4" : "h3";
  const titleClass = size === "sm" ? "section-title-sm" : "section-title";

  return (
    <div className={className}>
      {title && <TitleTag className={titleClass}>{title}</TitleTag>}
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
    </div>
  );
}

export default CardHeader;