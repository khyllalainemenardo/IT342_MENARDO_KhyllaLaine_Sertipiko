export default function Logo({ size = 28 }) {
  return (
    <span className="logo">
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
        <rect x="3" y="5" width="26" height="20" rx="3" fill="var(--brand)" />
        <rect x="7" y="10" width="12" height="2.2" rx="1.1" fill="#fff" />
        <rect x="7" y="14.5" width="8" height="2.2" rx="1.1" fill="#fff" opacity=".75" />
        <circle cx="23" cy="20" r="5" fill="var(--accent)" stroke="#fff" strokeWidth="1.5" />
        <path d="M20.5 24.5 19 29l4-2 4 2-1.5-4.5" fill="var(--accent)" />
      </svg>
      <span className="logo-text">Sertipiko</span>
    </span>
  )
}
