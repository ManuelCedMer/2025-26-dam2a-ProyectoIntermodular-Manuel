/**
 * Item reutilizable para listados con acciones a la derecha.
 */
function EntityListItem({ title, meta, actions, className = "" }) {
  return (
    <li className={`item-card ${className}`.trim()}>
      <div>
        {title && <strong>{title}</strong>}
        {meta}
      </div>

      {actions && <div className="item-actions">{actions}</div>}
    </li>
  );
}

export default EntityListItem;