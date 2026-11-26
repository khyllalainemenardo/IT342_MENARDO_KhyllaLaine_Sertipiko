import { PASSWORD_RULES } from '../utils/validation'

export default function PasswordRuleList({ password }) {
  return (
    <ul className="pw-rules" aria-label="Password requirements">
      {PASSWORD_RULES.map((r) => (
        <li key={r.label} className={r.test(password) ? 'ok' : ''}>{r.label}</li>
      ))}
    </ul>
  )
}
