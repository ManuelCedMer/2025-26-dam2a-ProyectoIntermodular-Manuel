/**
 * Selector tipo "chips" reutilizable.
 */
function ChipSelector({
  label,
  options,
  value,
  onToggle,
  getLabel = (opt) => String(opt),
  className = "",
}) {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}

      <div className="chip-row">
        {options.map((opt) => {
          const selected = Array.isArray(value) && value.includes(opt);

          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className={`chip ${selected ? "chip--active" : ""}`}
            >
              <span>{getLabel(opt)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ChipSelector;