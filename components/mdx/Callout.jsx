import React from 'react'

// Colored, titled admonition box. Types map to a semantic color + default icon;
// callers can override the icon or drop it with icon={null}.
const TYPES = {
  info: { icon: 'ℹ', label: 'Note' },
  tip: { icon: '✓', label: 'Tip' },
  success: { icon: '✓', label: 'Success' },
  warning: { icon: '▲', label: 'Warning' },
  danger: { icon: '✕', label: 'Important' },
  note: { icon: '✎', label: 'Note' },
}

export default function Callout({ type = 'info', title, icon, children }) {
  const preset = TYPES[type] || TYPES.info
  const showIcon = icon !== null ? (icon ?? preset.icon) : null
  return (
    <div className={`plcy-callout is-${TYPES[type] ? type : 'info'}`} role="note">
      {showIcon ? <span className="plcy-callout-icon" aria-hidden="true">{showIcon}</span> : null}
      <div className="plcy-callout-body">
        {title ? <p className="plcy-callout-title">{title}</p> : null}
        <div className="plcy-callout-content">{children}</div>
      </div>
    </div>
  )
}
