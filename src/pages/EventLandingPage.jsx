import { useState, useEffect, useRef, useMemo, forwardRef } from 'react'
import AnnouncementBar from '../components/AnnouncementBar'
import NavBar from '../components/NavBar'
import LoginPage from './LoginPage'

const BASE = import.meta.env.BASE_URL

// ─── Exactamente igual que en HeroSection ─────────────────────────────────────

const ROTATING_WORDS = ['BIM', 'IA', 'Revit', 'Presupuestos', 'Renders', 'Gestión', 'Calidad']
const LONGEST_WORD = ROTATING_WORDS.reduce((a, b) => (a.length >= b.length ? a : b))

function RotatingWord({ words, longestWord }) {
  const reduced = useMemo(
    () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  )
  const [wordIdx, setWordIdx] = useState(0)
  const [phase, setPhase] = useState('typing')
  const [count, setCount] = useState(0)
  const word = words[wordIdx]

  useEffect(() => {
    if (!reduced) return
    const id = setInterval(() => setWordIdx(i => (i + 1) % words.length), 2200)
    return () => clearInterval(id)
  }, [reduced, words.length])

  useEffect(() => {
    if (reduced) return
    let timer
    if (phase === 'typing') {
      if (count < word.length) timer = setTimeout(() => setCount(c => c + 1), 80)
      else timer = setTimeout(() => setPhase('deleting'), 1800)
    } else {
      if (count > 0) timer = setTimeout(() => setCount(c => c - 1), 40)
      else { setWordIdx(i => (i + 1) % words.length); setPhase('typing') }
    }
    return () => clearTimeout(timer)
  }, [phase, count, word, reduced, words.length])

  const wordStyle = {
    display: 'inline-block',
    minWidth: `${longestWord.length}ch`,
    textAlign: 'left',
    color: 'var(--aqua)',
    fontStyle: 'italic',
    fontWeight: 700,
    WebkitTextFillColor: 'var(--aqua)',
  }

  if (reduced) {
    return (
      <span style={wordStyle}>
        <span key={words[wordIdx]} className="rw-crossfade">{words[wordIdx]}</span>
      </span>
    )
  }

  const visible = word.slice(0, count)
  return (
    <span style={wordStyle}>
      {visible.split('').map((ch, i) => (
        <span key={`${wordIdx}-${i}`} className="rw-letter" style={{ display: 'inline-block', whiteSpace: 'pre' }}>{ch}</span>
      ))}
      {phase === 'typing' && count < word.length && (
        <span key={`ghost-${wordIdx}-${count}`} className="rw-ghost" style={{ display: 'inline-block', whiteSpace: 'pre' }}>
          {word[count]}
        </span>
      )}
    </span>
  )
}

function Headline() {
  const LINE_1 = 'La plataforma digital donde'
  const LINE_2 = 'ingenieros y arquitectos aprenden'
  const fullText = LINE_1 + ' ' + LINE_2
  const reduced = useMemo(
    () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  )
  const [count, setCount] = useState(reduced ? fullText.length : 0)
  const [done, setDone] = useState(reduced)

  // Typewriter corre por tiempo, no por scroll
  useEffect(() => {
    if (reduced) return
    if (count >= fullText.length) { setDone(true); return }
    const t = setTimeout(() => setCount(c => c + 1), 40)
    return () => clearTimeout(t)
  }, [count, reduced, fullText.length])

  const line1Visible = Math.min(count, LINE_1.length)
  const line2Visible = Math.max(0, Math.min(count - LINE_1.length - 1, LINE_2.length))

  const renderLine = (text, visibleCount, keyPrefix) => {
    const visible = text.slice(0, visibleCount)
    const chunks = visible.split(/(\s+)/)
    return chunks.map((chunk, wi) => {
      if (/^\s+$/.test(chunk)) return <span key={`${keyPrefix}-s-${wi}`}>{chunk}</span>
      return (
        <span key={`${keyPrefix}-w-${wi}`} className="head-word-tw">
          {chunk.split('').map((ch, li) => (
            <span key={li} className="tw-letter">{ch}</span>
          ))}
        </span>
      )
    })
  }

  return (
    <h1 className="hero-headline">
      <span className="hero-headline-line">{renderLine(LINE_1, line1Visible, 'l1')}</span>
      <span className="hero-headline-line">{renderLine(LINE_2, line2Visible, 'l2')}</span>
      <span className="hero-headline-rotator-line">
        {done && (
          <span className="head-rotator">
            <RotatingWord words={ROTATING_WORDS} longestWord={LONGEST_WORD} />
          </span>
        )}
      </span>
    </h1>
  )
}

const CTAs = forwardRef(function CTAs({ onLogin }, ref) {
  return (
    <div className="hero-ctas" ref={ref}>
      <button className="cta cta-primary">Registro Masterclass</button>
      <button className="cta cta-secondary" onClick={onLogin}>Unirme gratis</button>
    </div>
  )
})

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EventLandingPage() {
  const [announcementOpen, setAnnouncementOpen] = useState(true)
  const [collapsed, setCollapsed] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const videoRef = useRef(null)
  const ctasRef = useRef(null)

  const goToLogin = () => { window.scrollTo(0, 0); setShowLogin(true) }
  const goBack    = () => { window.scrollTo(0, 0); setShowLogin(false) }

  const handleClose = () => {
    setAnnouncementOpen(false)
    setTimeout(() => setCollapsed(true), 220)
  }

  // Video: autoplay loop a 1.6× (no scroll)
  useEffect(() => {
    if (showLogin) return
    const v = videoRef.current
    if (!v) return
    v.playbackRate = 1.6
    v.play().catch(() => {})
  }, [showLogin])

  // CTAs: visibles inmediatamente (sin esperar scroll)
  useEffect(() => {
    if (showLogin) return
    const ctas = ctasRef.current
    if (!ctas) return
    ctas.style.opacity = '1'
    ctas.style.transform = 'translateY(0)'
    ctas.style.pointerEvents = 'auto'
    ctas.style.transition = 'opacity 500ms cubic-bezier(0.16,1,0.3,1), transform 500ms cubic-bezier(0.16,1,0.3,1)'
  }, [showLogin])

  const topOffset = announcementOpen && !collapsed ? 'calc(38px + 16px)' : '16px'

  if (showLogin) return <LoginPage onBack={goBack} />

  return (
    <div className="page">
      <AnnouncementBar open={announcementOpen} onClose={handleClose} />
      <NavBar topOffset={topOffset} onLogin={goToLogin} />

      <section className="hero-section evl-hero-section">
        <div className="hero-video-stage">
          <div className="hero-video-fallback" />
          <video
            ref={videoRef}
            src={`${BASE}videos/hero-master.mp4`}
            playsInline
            muted
            loop
            preload="auto"
            crossOrigin="anonymous"
            className="hero-video"
            style={{ zIndex: 0 }}
          />
          <div className="hero-video-overlay" />
        </div>

        <div className="hero-content-sticky">
          <div className="hero-content">
            <Headline />
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <CTAs ref={ctasRef} onLogin={goToLogin} />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
