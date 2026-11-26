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

export const USER_TYPES = [
  { value: 'STUDENT', label: 'Student' },
  { value: 'FACULTY', label: 'Faculty' },
  { value: 'STAFF', label: 'Staff' },
]

export function validatePasswordPair(password, confirm, passwordField = 'newPassword', confirmField = 'confirmPassword') {
  const errors = {}
  if (!password) errors[passwordField] = 'New password is required.'
  else if (password.length > 72) errors[passwordField] = 'Password must be at most 72 characters.'
  else if (!PASSWORD_RULES.every((r) => r.test(password)))
    errors[passwordField] = 'Password does not meet the requirements below.'

  if (!confirm) errors[confirmField] = 'Please confirm your new password.'
  else if (confirm !== password) errors[confirmField] = 'Passwords do not match.'
  return errors
}

export function validateProfile(form) {
  const errors = {}
  const dept = form.department.trim()
  if (!dept) errors.department = 'Department or organization is required.'
  else if (dept.length > 120) errors.department = 'Department or organization must be at most 120 characters.'
  else if (!/^[\p{L}\p{N} .,'&()/-]+$/u.test(dept))
    errors.department = 'Use letters, numbers, spaces, and basic punctuation only.'
  if (!form.userType) errors.userType = 'Please choose whether you are a student, faculty, or staff.'
  return errors
}
