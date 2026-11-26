import { useEffect, useState } from 'react'
import { getProfile, updateProfile } from '../../api/accountApi'
import { errorMessage } from '../../api/client'
import { useAuth } from '../../auth/useAuth'
import { ROLE_LABELS } from '../../auth/roles'
import { USER_TYPES, validateProfile } from '../../utils/validation'
import Avatar from '../../components/Avatar'
import FormField from '../../components/FormField'
import Spinner from '../../components/Spinner'

function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

function toForm(profile) {
  return { department: profile.department || '', userType: profile.userType || '' }
}

export default function ProfilePage() {
  const { refresh } = useAuth()
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ department: '', userType: '' })
  const [errors, setErrors] = useState({})
  const [loadError, setLoadError] = useState('')
  const [serverError, setServerError] = useState('')
  const [notice, setNotice] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getProfile()
      .then((p) => {
        setProfile(p)
        setForm(toForm(p))
      })
      .catch((e) => setLoadError(errorMessage(e, 'Could not load your profile.')))
  }, [])

  function update(field) {
    return (e) => {
      const next = { ...form, [field]: e.target.value }
      setForm(next)
      if (errors[field]) setErrors(validateProfile(next))
    }
  }

  function startEdit() {
    setNotice('')
    setServerError('')
    setErrors({})
    setForm(toForm(profile))
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
    setErrors({})
    setServerError('')
    setForm(toForm(profile))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setServerError('')
    setNotice('')
    const errs = validateProfile(form)
    setErrors(errs)
    if (Object.keys(errs).length) return

    setSaving(true)
    try {
      const saved = await updateProfile({
        department: form.department.trim().replace(/\s+/g, ' '),
        userType: form.userType,
      })
      setProfile(saved)
      setForm(toForm(saved))
      setEditing(false)
      setNotice('Your profile has been updated.')
      refresh()
    } catch (err) {
      if (err.response?.status === 400 && err.response.data?.errors) {
        setErrors(err.response.data.errors)
      } else {
        setServerError(errorMessage(err, 'Your changes could not be saved.'))
      }
    } finally {
      setSaving(false)
    }
  }

  if (loadError) {
    return (
      <section>
        <h1 className="page-title">My Profile</h1>
        <div className="alert alert-error" role="alert">{loadError}</div>
      </section>
    )
  }

  if (!profile) return <Spinner label="Loading your profile…" />

  const typeLabel = USER_TYPES.find((t) => t.value === profile.userType)?.label || 'Not set'

  return (
    <section>
      <h1 className="page-title">My Profile</h1>
      <p className="muted page-sub">View and update your account information.</p>

      {notice && <div className="alert alert-success" role="status">{notice}</div>}

      <div className="card form-card">
        <div className="profile-head">
          <Avatar name={profile.fullName} size={56} />
          <div>
            <h2 className="profile-name">{profile.fullName}</h2>
            <p className="muted">{profile.email}</p>
          </div>
        </div>

        <dl className="readonly-grid">
          <div>
            <dt>Role</dt>
            <dd>{ROLE_LABELS[profile.role] || profile.role}</dd>
          </div>
          <div>
            <dt>Member since</dt>
            <dd>{formatDate(profile.createdAt)}</dd>
          </div>
          {!editing && (
            <>
              <div>
                <dt>Department / Organization</dt>
                <dd>{profile.department || '—'}</dd>
              </div>
              <div>
                <dt>I am a</dt>
                <dd>{typeLabel}</dd>
              </div>
            </>
          )}
        </dl>

        <p className="muted small">
          Your name and email are used on your certificates and to sign in, so they can't be changed
          here. If your name is misspelled, ask the administrator to correct it.
        </p>

        {!editing ? (
          <div className="form-actions">
            <button className="btn btn-primary" onClick={startEdit}>Edit profile</button>
          </div>
        ) : (
          <form className="form-card" onSubmit={handleSubmit} noValidate>
            {serverError && <div className="alert alert-error" role="alert">{serverError}</div>}
            <FormField
              label="Department / Organization"
              value={form.department}
              onChange={update('department')}
              error={errors.department}
              maxLength={120}
              placeholder="e.g. College of Computer Studies"
            />
            <div className={errors.userType ? 'field has-error' : 'field'}>
              <label htmlFor="userType">I am a</label>
              <select
                id="userType"
                className="input"
                value={form.userType}
                onChange={update('userType')}
                aria-invalid={Boolean(errors.userType)}
              >
                <option value="">Select one</option>
                {USER_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              {errors.userType && <p className="field-error">{errors.userType}</p>}
            </div>
            <div className="form-actions">
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              <button className="btn btn-ghost" type="button" onClick={cancelEdit} disabled={saving}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
