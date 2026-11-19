import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { DASHBOARD_PATH } from '../auth/roles'
import { errorMessage } from '../api/client'
import Logo from '../components/Logo'
import Spinner from '../components/Spinner'
import FormField from '../components/FormField'

export default function LoginPage() {
  const { status, user, login, sessionExpired, clearSessionExpired } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [email, setEmail] = useState(location.state?.email || '')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const notice = location.state?.registered
    ? 'Account created. You can now sign in.'
    : location.state?.loggedOut
      ? 'You have been signed out.'
      : ''

  useEffect(() => () => clearSessionExpired(), [clearSessionExpired])

  if (status === 'loading') return <Spinner full label="Checking your session…" />
  if (status === 'authenticated' && !submitting) return <Navigate to={DASHBOARD_PATH[user.role]} replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const errs = {}
    if (!email.trim()) errs.email = 'Email is required.'
    if (!password) errs.password = 'Password is required.'
    setFieldErrors(errs)
    if (Object.keys(errs).length) return

    setSubmitting(true)
    try {
      const u = await login(email.trim().toLowerCase(), password)
      const from = location.state?.from
      // Only go back to the page they wanted if their role may open it.
      const target = from && from.startsWith(DASHBOARD_PATH[u.role]) ? from : DASHBOARD_PATH[u.role]
      navigate(target, { replace: true })
    } catch (err) {
      const s = err.response?.status
      if (s === 401) setError('Invalid email or password.')
      else if (s === 403) setError(errorMessage(err, 'Your account has been disabled. Please contact the administrator.'))
      else if (s === 429) setError('Too many sign-in attempts. Please wait a moment and try again.')
      else setError(errorMessage(err, 'Sign-in failed. Please try again.'))
      setPassword('')
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card card" onSubmit={handleSubmit} noValidate>
        <Logo size={36} />
        <div>
          <h1 className="auth-title">Sign in</h1>
          <p className="muted">Seminar attendance and e-certificates for CIT-U.</p>
        </div>

        {error && <div className="alert alert-error" role="alert">{error}</div>}
        {!error && sessionExpired && (
          <div className="alert alert-warn" role="alert">Your session has ended. Please sign in again.</div>
        )}
        {!error && !sessionExpired && notice && <div className="alert alert-success" role="status">{notice}</div>}

        <FormField
          label="School email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
          autoFocus={!email}
        />
        <FormField
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          autoFocus={Boolean(email)}
        />

        <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="muted small center">
          New to Sertipiko? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  )
}
