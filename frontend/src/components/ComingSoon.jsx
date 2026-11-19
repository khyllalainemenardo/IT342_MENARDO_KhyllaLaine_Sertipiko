// Placeholder for pages that belong to later SRS features. It shows no fake
// data — just which requirement the page will implement.
export default function ComingSoon({ title, feature, description }) {
  return (
    <section>
      <h1 className="page-title">{title}</h1>
      <div className="card empty-state">
        <p className="eyebrow">{feature}</p>
        <p>{description}</p>
        <p className="muted small">This page will be built in a later module.</p>
      </div>
    </section>
  )
}
