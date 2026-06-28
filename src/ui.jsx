export function Button({ children, onClick, variant = "primary", className = "", type = "button", disabled = false }) {
  return <button type={type} className={`button ${variant} ${className}`} onClick={onClick} disabled={disabled}>{children}</button>;
}

export function Panel({ eyebrow, title, description, children, className = "" }) {
  return <section className={`panel ${className}`}>
    {(eyebrow || title) && <div className="panel-head"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}{title && <h2>{title}</h2>}{description && <p>{description}</p>}</div></div>}
    {children}
  </section>;
}

export function Badge({ children, tone = "neutral" }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

export function Progress({ value, tone = "gold" }) {
  return <div className="progress"><i className={tone} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>;
}

export function Metric({ label, value, detail, tone = "gold", icon }) {
  return <article className={`metric ${tone}`}><div><span>{label}</span><i>{icon}</i></div><strong>{value}</strong><small>{detail}</small></article>;
}

export function Avatar({ initials, tone = "gold" }) {
  return <span className={`avatar ${tone}`}>{initials}</span>;
}

export function PageHeading({ eyebrow, title, text, action }) {
  return <header className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{text}</p></div>{action && <div className="page-action">{action}</div>}</header>;
}
