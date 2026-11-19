// Client-side checks give instant feedback only. The backend repeats every
// rule, because anything in the browser can be bypassed.

export const SCHOOL_DOMAIN = (import.meta.env.VITE_SCHOOL_DOMAIN || 'cit.edu').toLowerCase()

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const PASSWORD_RULES = [
  { test: (p) => p.length >= 8, label: 'At least 8 characters' },
  { test: (p) => /[A-Z]/.test(p), label: 'An uppercase letter' },
  { test: (p) => /[a-z]/.test(p), label: 'A lowercase letter' },
  { test: (p) => /\d/.test(p), label: 'A number' },
]

export function validateEmail(email) {
  const e = email.trim().toLowerCase()
  if (!e) return 'Email is required.'
  if (!EMAIL_RE.test(e)) return 'Enter a valid email address.'
  if (!e.endsWith(`@${SCHOOL_DOMAIN}`)) return `Use your school email (@${SCHOOL_DOMAIN}).`
  return ''
}

export function validateRegistration(form) {
  const errors = {}
  const name = form.fullName.trim()

  if (!name) errors.fullName = 'Full name is required.'
  else if (name.length < 2 || name.length > 100) errors.fullName = 'Full name must be 2–100 characters.'
  else if (!/^[\p{L}][\p{L} .'-]*$/u.test(name)) errors.fullName = 'Use letters, spaces, periods, apostrophes, or hyphens only.'

  const emailError = validateEmail(form.email)
  if (emailError) errors.email = emailError

  if (!form.department.trim()) errors.department = 'Department or organization is required.'

  if (!form.password) errors.password = 'Password is required.'
  else if (!PASSWORD_RULES.every((r) => r.test(form.password)))
    errors.password = 'Password does not meet the requirements below.'
  else if (form.password.length > 72) errors.password = 'Password must be at most 72 characters.'

  if (!form.confirmPassword) errors.confirmPassword = 'Please confirm your password.'
  else if (form.confirmPassword !== form.password) errors.confirmPassword = 'Passwords do not match.'

  return errors
}
