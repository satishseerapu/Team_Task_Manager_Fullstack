export default function Textarea({ label, id, error, rows = 3, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label htmlFor={id} className="form-label">{label}</label>}
      <textarea
        id={id}
        rows={rows}
        className={`form-input resize-none ${error ? 'border-red-400 focus:ring-red-400' : ''}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
