// Syllabus (Lectures 55-60) & Feature 2/4: Reusable Input component
export default function Input({
  label,
  name,
  id,
  type = 'text',
  value,
  onChange,
  onBlur,
  required = false,
  error,
  placeholder,
  as = 'input',
  rows = 3,
  className = '',
  disabled = false,
  onClear,
}) {
  const inputId = id || name || `input-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className={`form-group ${error ? 'has-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {required && <span className="field-required"> *</span>}
        </label>
      )}

      {as === 'textarea' ? (
        <textarea
          id={inputId}
          name={name}
          className={`form-input form-textarea ${error ? 'input-error' : ''}`}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
        />
      ) : (
        <div className="input-with-action">
          <input
            id={inputId}
            name={name}
            type={type}
            className={`form-input ${error ? 'input-error' : ''}`}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
          />
          {onClear && value && (
            <button
              type="button"
              className="input-clear-icon-btn"
              onClick={onClear}
              aria-label="Clear input"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {error && (
        <span className="field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
