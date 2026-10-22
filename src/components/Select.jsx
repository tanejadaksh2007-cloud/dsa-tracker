// Syllabus (Lectures 55-60) & Feature 2: Reusable Select component
export default function Select({
  label,
  name,
  id,
  value,
  onChange,
  onBlur,
  required = false,
  error,
  options = [],
  placeholder,
  className = '',
  disabled = false,
}) {
  const selectId = id || name || `select-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className={`form-group ${error ? 'has-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={selectId} className="form-label">
          {label}
          {required && <span className="field-required"> *</span>}
        </label>
      )}

      <select
        id={selectId}
        name={name}
        className={`form-input form-select ${error ? 'input-error' : ''}`}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => {
          const optValue = typeof opt === 'object' ? opt.value : opt;
          const optLabel = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={optValue} value={optValue}>
              {optLabel}
            </option>
          );
        })}
      </select>

      {error && (
        <span className="field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
