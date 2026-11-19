export default function Avatar({ name = '', src, size = 36 }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('')

  if (src) {
    return (
      <img
        className="avatar"
        src={src}
        alt=""
        width={size}
        height={size}
        referrerPolicy="no-referrer"
      />
    )
  }
  return (
    <span className="avatar avatar-initials" style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {initials || '?'}
    </span>
  )
}
