import { useState } from 'react'
import { Link } from 'react-router-dom'
import { requestPasswordReset } from '../api/accountApi'
import { errorMessage } from '../api/client'
import Logo from '../components/Logo'
import FormField from '../components/FormField'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [serverError, setServerError] = useState('')
  const [sentMessage, setSentMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setServerError('')
    const value = email.trim().toLowerCase()
    if (!value) return setError('Email is required.')
    if (!EMAIL_RE.test(value)) return setError('Enter a valid email address.')
    setError('')

    setSubmitting(true)
    try {
      const res = await requestPasswordReset(value)
      setSentMessage(res?.message || 'If an account exists for that email, a reset link has been sent.')
    } catch (err) {
      if (err.response?.status === 400 && err.response.data?.errors?.email) {
        setError(err.response.data.errors.email)
      } else {
        setServerError(errorMessage(err, 'Could not send the reset link. Please try again.'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card card" onSubmit={handleSubmit} noValidate>
        <Logo size={36} />
        <div>
          <h1 className="auth-title">Forgot your password?</h1>
          <p className="muted">Enter your school email and we'll send you a link to reset it.</p>
        </div>

        {sentMessage ? (
          <>
            <div className="alert alert-success" role="status">{sentMessage}</div>
            <p className="muted small">
              The link expires in 30 minutes and works only once. Check your spam folder if you don't see it.
            </p>
            <button type="button" className="btn btn-ghost btn-block" onClick={() => setSentMessage('')}>
              Send another link
            </button>
          </>
        ) : (
          <>
            {serverError && <div className="alert alert-error" role="alert">{serverError}</div>}
            <FormField
              label="School email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
              autoFocus
            />
            <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
              {submitting ? 'Sending…' : 'Send reset link'}
            </button>
          </>
        )}

        <p className="muted small center">
          Remembered it? <Link to="/login">Back to sign in</Link>
        </p>
      </form>
    </div>
  )
}
