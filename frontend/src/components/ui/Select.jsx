export default function Select({ label, id, options = [], error, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label htmlFor={id} className="form-label">{label}</label>}
      <select
        id={id}
        className={`form-input ${error ? 'border-red-400 focus:ring-red-400' : ''}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
