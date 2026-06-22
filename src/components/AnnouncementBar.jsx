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
        background: 'linear-gradient(90deg, #0a1f1e 0%, #0d2b2a 50%, #0a1f1e 100%)',
        borderBottom: '1px solid rgba(54,219,202,0.15)',
        fontSize: 13,
        fontWeight: 500,
        color: 'rgba(255,255,255,0.85)',
        letterSpacing: '-0.005em',
      }}
    >
      <span className="announcement-text">
        <strong style={{fontWeight:700}}>Masterclass gratuita</strong>: &ldquo;IA en el sector construcción&rdquo;, 25 junio&nbsp;&nbsp;<a href="#registro-masterclass" className="ann-cta">Reservar cupo →</a>
      </span>
      <button onClick={onClose} aria-label="Cerrar anuncio" className="announcement-close">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3.5 3.5L12.5 12.5M12.5 3.5L3.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
