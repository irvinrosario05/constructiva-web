import { useState, useEffect } from 'react'

const TARGET = new Date('2026-06-25T00:00:00')

function getTimeLeft() {
  const diff = TARGET - Date.now()
  if (diff <= 0) return { d: '00', h: '00', m: '00', s: '00' }
  const s = Math.floor(diff / 1000)
  return {
    d: String(Math.floor(s / 86400)).padStart(2, '0'),
    h: String(Math.floor((s % 86400) / 3600)).padStart(2, '0'),
    m: String(Math.floor((s % 3600) / 60)).padStart(2, '0'),
    s: String(s % 60).padStart(2, '0'),
  }
}

function Countdown() {
  const [t, setT] = useState(getTimeLeft)
  useEffect(() => {
    const id = setInterval(() => setT(getTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <span className="evl-countdown">
      <span className="evl-countdown-unit"><span className="evl-countdown-num">{t.d}</span><span className="evl-countdown-label">d</span></span>
      <span className="evl-countdown-sep">·</span>
      <span className="evl-countdown-unit"><span className="evl-countdown-num">{t.h}</span><span className="evl-countdown-label">h</span></span>
      <span className="evl-countdown-sep">·</span>
      <span className="evl-countdown-unit"><span className="evl-countdown-num">{t.m}</span><span className="evl-countdown-label">m</span></span>
      <span className="evl-countdown-sep">·</span>
      <span className="evl-countdown-unit"><span className="evl-countdown-num">{t.s}</span><span className="evl-countdown-label">s</span></span>
    </span>
  )
}

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
      <span className="announcement-text">
        Plataforma disponible este 25 de junio&nbsp;&nbsp;<Countdown />
      </span>
      <button onClick={onClose} aria-label="Cerrar anuncio" className="announcement-close">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3.5 3.5L12.5 12.5M12.5 3.5L3.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
