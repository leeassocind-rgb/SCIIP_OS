import React, { useId } from 'react';

export default function TextField({
  id,
  label,
  description,
  error,
  className = '',
  ...props
}) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const descriptionId = description ? `${inputId}-description` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <label className={`sciip-field ${className}`.trim()} htmlFor={inputId}>
      <span className="sciip-field__label">{label}</span>
      <input
        id={inputId}
        className="sciip-input"
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        {...props}
      />
      {description && <small id={descriptionId}>{description}</small>}
      {error && <small id={errorId} role="alert">{error}</small>}
    </label>
  );
}
