import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword, validateResetToken } from '../api/accountApi'
import { errorMessage } from '../api/client'
import { validatePasswordPair } from '../utils/validation'
import Logo from '../components/Logo'
import FormField from '../components/FormField'
import PasswordRuleList from '../components/PasswordRuleList'
import Spinner from '../components/Spinner'

const INVALID = 'This reset link is invalid or has expired. Please request a new one.'

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') || ''

  const [status, setStatus] = useState(token ? 'checking' : 'invalid')
  const [invalidMessage, setInvalidMessage] = useState(INVALID)
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!token) return
    validateResetToken(token)
      .then(() => setStatus('ready'))
      .catch((err) => {
        setInvalidMessage(errorMessage(err, INVALID))
        setStatus('invalid')
      })
  }, [token])

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setServerError('')
    const errs = validatePasswordPair(form.newPassword, form.confirmPassword)
    setErrors(errs)
    if (Object.keys(errs).length) return

    setSubmitting(true)
    try {
      await resetPassword({ token, ...form })
      navigate('/login', { replace: true, state: { passwordReset: true } })
    } catch (err) {
      const data = err.response?.data
      if (err.response?.status === 400 && data?.errors && !data.errors.token) {
        setErrors(data.errors)
      } else if (err.response?.status === 400) {
        setInvalidMessage(errorMessage(err, INVALID))
        setStatus('invalid')
      } else {
        setServerError(errorMessage(err, 'Your password could not be reset.'))
      }
      setSubmitting(false)
    }
  }

  if (status === 'checking') return <Spinner full label="Checking your reset link…" />

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <Logo size={36} />
        {status === 'invalid' ? (
          <>
            <h1 className="auth-title">Reset link not valid</h1>
            <div className="alert alert-error" role="alert">{invalidMessage}</div>
            <Link className="btn btn-primary btn-block" to="/forgot-password">Request a new link</Link>
            <p className="muted small center"><Link to="/login">Back to sign in</Link></p>
          </>
        ) : (
          <form className="form-card" onSubmit={handleSubmit} noValidate>
            <div>
              <h1 className="auth-title">Choose a new password</h1>
              <p className="muted">Your old password will stop working once you save the new one.</p>
            </div>
            {serverError && <div className="alert alert-error" role="alert">{serverError}</div>}
            <FormField
              label="New password"
              type="password"
              autoComplete="new-password"
              value={form.newPassword}
              onChange={update('newPassword')}
              error={errors.newPassword}
              maxLength={72}
              autoFocus
            >
              <PasswordRuleList password={form.newPassword} />
            </FormField>
            <FormField
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={update('confirmPassword')}
              error={errors.confirmPassword}
              maxLength={72}
            />
            <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : 'Reset password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
