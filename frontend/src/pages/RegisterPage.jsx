import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { DASHBOARD_PATH } from '../auth/roles'
import { registerAccount } from '../api/authApi'
import { errorMessage } from '../api/client'
import { PASSWORD_RULES, SCHOOL_DOMAIN, validateRegistration } from '../utils/validation'
import Logo from '../components/Logo'
import Spinner from '../components/Spinner'
import FormField from '../components/FormField'

const EMPTY = { fullName: '', email: '', department: '', password: '', confirmPassword: '' }

// Self-registration always creates a PARTICIPANT account. The role is set by
// the backend; the form never sends one. Organizers are promoted by the admin.
export default function RegisterPage() {
  const { status, user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (status === 'loading') return <Spinner full label="Loading…" />
  if (status === 'authenticated') return <Navigate to={DASHBOARD_PATH[user.role]} replace />

  function update(field) {
    return (e) => {
      const next = { ...form, [field]: e.target.value }
      setForm(next)
      if (touched[field]) setErrors(validateRegistration(next))
    }
  }

  function blur(field) {
    return () => {
      setTouched((t) => ({ ...t, [field]: true }))
      setErrors(validateRegistration(form))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setServerError('')
    const errs = validateRegistration(form)
    setErrors(errs)
    setTouched({ fullName: true, email: true, department: true, password: true, confirmPassword: true })
    if (Object.keys(errs).length) return

    setSubmitting(true)
    try {
      const email = form.email.trim().toLowerCase()
      await registerAccount({
        fullName: form.fullName.trim().replace(/\s+/g, ' '),
        email,
        department: form.department.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      })
      navigate('/login', { replace: true, state: { registered: true, email } })
    } catch (err) {
      const s = err.response?.status
      if (s === 409) {
        setErrors((x) => ({ ...x, email: 'An account with this email already exists.' }))
      } else if (s === 400 && err.response.data?.errors) {
        setErrors((x) => ({ ...x, ...err.response.data.errors }))
      } else {
        setServerError(errorMessage(err, 'Registration failed. Please try again.'))
      }
      setSubmitting(false)
    }
  }

  const show = (f) => (touched[f] ? errors[f] : undefined)

  return (
    <div className="auth-page">
      <form className="auth-card card auth-card-wide" onSubmit={handleSubmit} noValidate>
        <Logo size={36} />
        <div>
          <h1 className="auth-title">Create your account</h1>
          <p className="muted">Register with your school email to join seminars and receive certificates.</p>
        </div>

        {serverError && <div className="alert alert-error" role="alert">{serverError}</div>}

        <FormField
          label="Full name"
          autoComplete="name"
          value={form.fullName}
          onChange={update('fullName')}
          onBlur={blur('fullName')}
          error={show('fullName')}
          hint="Type it exactly as it should appear on your certificates."
          maxLength={100}
        />
        <FormField
          label="School email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={update('email')}
          onBlur={blur('email')}
          error={show('email')}
          hint={`Must end with @${SCHOOL_DOMAIN}`}
        />
        <FormField
          label="Department / Organization"
          value={form.department}
          onChange={update('department')}
          onBlur={blur('department')}
          error={show('department')}
          placeholder="e.g. College of Computer Studies"
          maxLength={120}
        />
        <FormField
          label="Password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={update('password')}
          onBlur={blur('password')}
          error={show('password')}
          maxLength={72}
        >
          <ul className="pw-rules" aria-label="Password requirements">
            {PASSWORD_RULES.map((r) => (
              <li key={r.label} className={r.test(form.password) ? 'ok' : ''}>{r.label}</li>
            ))}
          </ul>
        </FormField>
        <FormField
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={update('confirmPassword')}
          onBlur={blur('confirmPassword')}
          error={show('confirmPassword')}
          maxLength={72}
        />

        <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>

        <p className="muted small center">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  )
}
