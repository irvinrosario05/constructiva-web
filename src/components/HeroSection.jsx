import { useState, useEffect, useRef, useMemo, forwardRef } from 'react'

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
    const id = setInterval(() => setWordIdx((i) => (i + 1) % words.length), 2200)
    return () => clearInterval(id)
  }, [reduced, words.length])

  useEffect(() => {
    if (reduced) return
    let timer
    if (phase === 'typing') {
      if (count < word.length) {
        timer = setTimeout(() => setCount((c) => c + 1), 80)
      } else {
        timer = setTimeout(() => setPhase('deleting'), 1800)
      }
    } else if (phase === 'deleting') {
      if (count > 0) {
        timer = setTimeout(() => setCount((c) => c - 1), 40)
      } else {
        setWordIdx((i) => (i + 1) % words.length)
        setPhase('typing')
      }
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
        <span key={`${wordIdx}-${i}`} className="rw-letter" style={{ display: 'inline-block', whiteSpace: 'pre' }}>
          {ch}
        </span>
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

  useEffect(() => {
    if (reduced) return
    if (count >= fullText.length) { setDone(true); return }
    const t = setTimeout(() => setCount((c) => c + 1), 40)
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
      <span className="hero-headline-line hero-headline-rotator-line">
        {done && (
          <span className="head-rotator">
            <RotatingWord words={ROTATING_WORDS} longestWord={LONGEST_WORD} />
          </span>
        )}
      </span>
    </h1>
  )
}

const CTAs = forwardRef(function CTAs(_, ref) {
  return (
    <div className="hero-ctas" ref={ref}>
      <button className="cta cta-primary">Ver Cursos</button>
      <button className="cta cta-secondary">Unirme gratis</button>
    </div>
  )
})

function ScrollCue() {
  return (
    <div className="scroll-cue">
      <span className="scroll-cue-label">Scroll</span>
      <span className="scroll-cue-chevron">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  )
}

export default function HeroSection({ sectionRef }) {
  const [videoReady, setVideoReady] = useState(false)
  const videoRef = useRef(null)
  const ctasRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (video.readyState >= 3) { setVideoReady(true); return }
    const checkReady = () => { if (video.readyState >= 3) setVideoReady(true) }
    video.addEventListener('canplay', checkReady)
    video.addEventListener('canplaythrough', checkReady)
    const timer = setTimeout(() => setVideoReady(true), 6000)
    return () => {
      video.removeEventListener('canplay', checkReady)
      video.removeEventListener('canplaythrough', checkReady)
      clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (videoReady) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [videoReady])

  useEffect(() => {
    if (!videoReady) return
    const video = videoRef.current
    const section = sectionRef.current
    const ctas = ctasRef.current
    if (!video || !section) return

    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      try { video.pause(); video.currentTime = (video.duration || 13) - 0.1 } catch (e) {}
      if (ctas) { ctas.style.opacity = '1'; ctas.style.transform = 'translateY(0)'; ctas.style.pointerEvents = 'auto' }
      return
    }

    let ctasVisible = false
    let rafId = null
    let lastProgress = 0
    const CTA_THRESHOLD = 0.841

    const updateVideo = (progress) => {
      const dur = video.duration && !isNaN(video.duration) ? video.duration : 13
      const targetTime = progress * dur
      const diff = targetTime - video.currentTime
      if (Math.abs(diff) < 0.1) {
        if (!video.paused) video.pause()
      } else if (diff > 0) {
        if (video.paused) { const p = video.play(); if (p?.catch) p.catch(() => {}) }
        video.playbackRate = Math.min(Math.max(Math.abs(diff) * 2, 0.5), 4)
      } else {
        if (!video.paused) video.pause()
        try { video.currentTime = Math.max(targetTime, 0) } catch (e) {}
      }
    }

    const onScroll = () => {
      const rect = section.getBoundingClientRect()
      const total = section.offsetHeight - window.innerHeight
      const scrolled = -rect.top
      let progress = total > 0 ? scrolled / total : 0
      progress = Math.max(0, Math.min(1, progress))
      lastProgress = progress
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => updateVideo(lastProgress))

      const shouldShow = progress >= CTA_THRESHOLD
      if (ctas && shouldShow !== ctasVisible) {
        ctasVisible = shouldShow
        ctas.style.transition = shouldShow
          ? 'opacity 500ms cubic-bezier(0.16,1,0.3,1), transform 500ms cubic-bezier(0.16,1,0.3,1)'
          : 'opacity 400ms cubic-bezier(0.5,0,0.75,0), transform 400ms cubic-bezier(0.5,0,0.75,0)'
        ctas.style.opacity = shouldShow ? '1' : '0'
        ctas.style.transform = shouldShow ? 'translateY(0)' : 'translateY(20px)'
        ctas.style.pointerEvents = shouldShow ? 'auto' : 'none'
      }
    }

    const initVideo = () => { try { video.pause(); video.currentTime = 0 } catch (e) {} }
    if (video.readyState >= 1) { initVideo() } else { video.addEventListener('loadedmetadata', initVideo, { once: true }) }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      window.removeEventListener('scroll', onScroll)
      video.removeEventListener('loadedmetadata', initVideo)
      if (rafId) cancelAnimationFrame(rafId)
      try { video.pause() } catch (e) {}
    }
  }, [videoReady, sectionRef])

  return (
    <>
      <div className="hero-video-stage">
        <div className="hero-video-fallback" />
        <video
          ref={videoRef}
          src="/videos/hero-master.mp4"
          playsInline
          muted
          preload="auto"
          crossOrigin="anonymous"
          className="hero-video"
          style={{ zIndex: 0 }}
        />
        <div className="hero-video-overlay" />
      </div>

      {!videoReady && (
        <div className="hero-loading" aria-live="polite">
          <div className="hero-loading-inner">
            <div className="hero-loading-spinner" aria-hidden="true" />
            <div className="hero-loading-label">Cargando experiencia…</div>
          </div>
        </div>
      )}

      <div className="hero-content-sticky">
        <div className="hero-content">
          <Headline />
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <CTAs ref={ctasRef} />
          </div>
        </div>
        <ScrollCue />
      </div>
    </>
  )
}
