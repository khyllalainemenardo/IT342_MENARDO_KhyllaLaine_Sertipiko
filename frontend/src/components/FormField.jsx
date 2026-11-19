import { useId, useState } from 'react'

export default function FormField({ label, error, hint, type = 'text', children, ...inputProps }) {
  const id = useId()
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'

  return (
    <div className={error ? 'field has-error' : 'field'}>
      <label htmlFor={id}>{label}</label>
      <div className="field-control">
        <input
          id={id}
          className="input"
          type={isPassword && show ? 'text' : type}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-err` : undefined}
          {...inputProps}
        />
        {isPassword && (
          <button
            type="button"
            className="pw-toggle"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Hide password' : 'Show password'}
          >
            {show ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {error && <p id={`${id}-err`} className="field-error">{error}</p>}
      {!error && hint && <p className="field-hint">{hint}</p>}
      {children}
    </div>
  )
}
