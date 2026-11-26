import { useState } from 'react'
import { changePassword } from '../../api/accountApi'
import { errorMessage } from '../../api/client'
import { validatePasswordPair } from '../../utils/validation'
import FormField from '../../components/FormField'
import PasswordRuleList from '../../components/PasswordRuleList'

const EMPTY = { currentPassword: '', newPassword: '', confirmPassword: '' }

export default function ChangePasswordPage() {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setServerError('')
    setNotice('')
    const errs = validatePasswordPair(form.newPassword, form.confirmPassword)
    if (!form.currentPassword) errs.currentPassword = 'Current password is required.'
    else if (form.newPassword && form.newPassword === form.currentPassword)
      errs.newPassword = 'New password must be different from your current password.'
    setErrors(errs)
    if (Object.keys(errs).length) return

    setSaving(true)
    try {
      const res = await changePassword(form)
      setForm(EMPTY)
      setErrors({})
      setNotice(res?.message || 'Your password has been changed.')
    } catch (err) {
      const s = err.response?.status
      if (s === 400 && err.response.data?.errors) {
        setErrors(err.response.data.errors)
        if (err.response.data.errors.currentPassword) setForm((f) => ({ ...f, currentPassword: '' }))
      } else if (s === 429) {
        setServerError(errorMessage(err, 'Too many attempts. Please try again later.'))
      } else {
        setServerError(errorMessage(err, 'Your password could not be changed.'))
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <section>
      <h1 className="page-title">Change Password</h1>
      <p className="muted page-sub">
        Enter your current password, then choose a new one. You will be signed out on your other devices.
      </p>

      {notice && <div className="alert alert-success" role="status">{notice}</div>}

      <form className="card form-card" onSubmit={handleSubmit} noValidate>
        {serverError && <div className="alert alert-error" role="alert">{serverError}</div>}

        <FormField
          label="Current password"
          type="password"
          autoComplete="current-password"
          value={form.currentPassword}
          onChange={update('currentPassword')}
          error={errors.currentPassword}
        />
        <FormField
          label="New password"
          type="password"
          autoComplete="new-password"
          value={form.newPassword}
          onChange={update('newPassword')}
          error={errors.newPassword}
          maxLength={72}
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

        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Updating…' : 'Update password'}
          </button>
        </div>
      </form>
    </section>
  )
}
