import { useState, useEffect } from 'react'

export default function AnnouncementBar({ open, onClose }) {
  const [closing, setClosing] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    if (!open) {
      setClosing(true)
      const t = setTimeout(() => setHidden(true), 220)
      return () => clearTimeout(t)
    }
  }, [open])

  if (hidden) return null

  return (
    <div
      className={`announcement-bar ${closing ? 'is-closing' : 'is-entering'}`}
      style={{
        background: 'var(--ink-700)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        fontSize: 13,
        fontWeight: 500,
        color: 'rgba(255,255,255,0.85)',
        letterSpacing: '-0.005em',
      }}
    >
      <span
        className="announcement-text"
        dangerouslySetInnerHTML={{
          __html:
            'Regístrate y aprende hoy con nuestros <a href="#cursos-gratis" style="color:var(--aqua);text-decoration:underline;text-underline-offset:3px;text-decoration-thickness:1px;cursor:pointer;">cursos gratis</a>',
        }}
      />
      <button onClick={onClose} aria-label="Cerrar anuncio" className="announcement-close">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3.5 3.5L12.5 12.5M12.5 3.5L3.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
