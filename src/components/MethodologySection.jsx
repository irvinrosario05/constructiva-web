import { useState, useEffect, useRef } from 'react'

const PILLARS = [
  { num: '01', title: 'Aprende haciendo',        description: 'Cada curso en vivo o grabado se aplica a la realidad de nuestros estudiantes.' },
  { num: '02', title: 'Estudio del caso',         description: 'Casos reales con experiencias y aprendizajes de proyectos reales.' },
  { num: '03', title: 'Proyecto transversal',     description: 'Evaluamos tu desempeño con proyectos prácticos, no con tareas.' },
  { num: '04', title: 'Escenarios dinámicos',     description: 'Nuestros estudiantes toman decisiones en situaciones interactivas.' },
  { num: '05', title: 'Comunidad e interacción',  description: 'Expertos guiándote y estudiantes compartiendo conocimiento.' },
]

const N = PILLARS.length

/* ─── Scoped styles ─── */
const CSS = `
.mt-section {
  background: #0A0A0A;
  min-height: 500vh;
  position: relative;
  z-index: 16;
  border-radius: 28px 28px 0 0;
  box-shadow: 0 -1px 0 rgba(255,255,255,0.05);
}

/* Sticky fullscreen frame */
.mt-sticky {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.mt-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 clamp(24px, 5vw, 80px);
  width: 100%;
}

/* Two-panel grid */
.mt-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: clamp(48px, 7vw, 104px);
  align-items: center;
}

/* ── Left panel ── */
.mt-aside { display: flex; flex-direction: column; gap: 52px; }

.mt-head { overflow: visible; }

.mt-hl-light {
  display: block;
  font-family: 'SF Pro Display', system-ui, sans-serif;
  font-size: clamp(32px, 3.8vw, 52px);
  font-weight: 200;
  letter-spacing: -0.035em;
  line-height: 1.0;
  color: #FFFFFF;
  opacity: 0;
  transform: translateY(18px);
  transition: opacity 700ms cubic-bezier(0.16,1,0.3,1), transform 700ms cubic-bezier(0.16,1,0.3,1);
}
.mt-hl-bold {
  display: block;
  font-family: 'SF Pro Display', system-ui, sans-serif;
  font-size: clamp(32px, 3.8vw, 52px);
  font-weight: 700;
  letter-spacing: -0.035em;
  line-height: 1.05;
  color: #FFFFFF;
  opacity: 0;
  transform: translateY(18px);
  transition: opacity 700ms cubic-bezier(0.16,1,0.3,1) 140ms, transform 700ms cubic-bezier(0.16,1,0.3,1) 140ms;
}
.mt-head.is-entered .mt-hl-light { opacity: 0.4; transform: translateY(0); }
.mt-head.is-entered .mt-hl-bold  { opacity: 1;   transform: translateY(0); }

/* ── Timeline nav ── */
.mt-nav {
  position: relative;
  display: flex;
  flex-direction: column;
}

/* Ghost line */
.mt-nav-bg-line {
  position: absolute;
  left: 4px;
  top: 14px;
  bottom: 14px;
  width: 1px;
  background: rgba(54,219,202,0.1);
  pointer-events: none;
}

/* Progress fill */
.mt-nav-fill-line {
  position: absolute;
  left: 4px;
  top: 14px;
  width: 1px;
  height: 0%;
  background: linear-gradient(to bottom, #36DBCA, rgba(54,219,202,0.25));
  transition: height 500ms cubic-bezier(0.16,1,0.3,1);
  pointer-events: none;
}

.mt-nav-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 9px 0;
  cursor: default;
}

.mt-nav-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: rgba(54,219,202,0.2);
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  transition: background 400ms ease, transform 400ms cubic-bezier(0.16,1,0.3,1), box-shadow 400ms ease;
}
.mt-nav-item.is-past .mt-nav-dot {
  background: rgba(54,219,202,0.5);
  transform: scale(1.1);
}
.mt-nav-item.is-active .mt-nav-dot {
  background: #36DBCA;
  transform: scale(1.55);
  box-shadow: 0 0 0 4px rgba(54,219,202,0.18), 0 0 18px rgba(54,219,202,0.5);
}

.mt-nav-pulse {
  position: absolute;
  inset: -7px;
  border-radius: 50%;
  background: rgba(54,219,202,0.22);
  animation: mt-nav-pulse 2.5s ease-in-out infinite;
  pointer-events: none;
}
@keyframes mt-nav-pulse {
  0%, 100% { transform: scale(1);   opacity: 0.7; }
  50%       { transform: scale(1.9); opacity: 0;   }
}

.mt-nav-label {
  font-size: 13px;
  font-weight: 400;
  line-height: 1.3;
  letter-spacing: -0.01em;
  color: rgba(255,255,255,0.25);
  transition: color 400ms ease, font-weight 300ms ease;
}
.mt-nav-item.is-past   .mt-nav-label { color: rgba(255,255,255,0.42); }
.mt-nav-item.is-active .mt-nav-label { color: #FFFFFF; font-weight: 500; }

/* ── Right: sliding stage ── */
.mt-stage {
  position: relative;
  height: clamp(300px, 50vh, 440px);
  overflow: hidden;
}

.mt-slide {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
}

/* Waiting below */
.mt-slide.is-future {
  transform: translateY(52px);
  transition: opacity 550ms cubic-bezier(0.16,1,0.3,1), transform 550ms cubic-bezier(0.16,1,0.3,1);
}

/* Visible */
.mt-slide.is-active {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
  transition: opacity 550ms cubic-bezier(0.16,1,0.3,1), transform 550ms cubic-bezier(0.16,1,0.3,1);
}

/* Gone above */
.mt-slide.is-past {
  transform: translateY(-40px);
  transition: opacity 380ms ease, transform 380ms cubic-bezier(0.4,0,1,1);
}

/* Large decorative number */
.mt-slide-num-bg {
  position: absolute;
  right: -8px;
  top: -12px;
  font-family: 'SF Pro Display', system-ui, sans-serif;
  font-size: clamp(140px, 18vw, 240px);
  font-weight: 700;
  letter-spacing: -0.06em;
  line-height: 1;
  color: #36DBCA;
  opacity: 0;
  pointer-events: none;
  user-select: none;
  transition: opacity 700ms cubic-bezier(0.16,1,0.3,1);
}
.mt-slide.is-active .mt-slide-num-bg { opacity: 0.055; }

.mt-slide-eyebrow {
  display: block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.17em;
  text-transform: uppercase;
  color: #36DBCA;
  margin-bottom: 16px;
}

.mt-slide-rule {
  width: 48px;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(90deg, #248D84, #36DBCA);
  margin-bottom: 24px;
  flex-shrink: 0;
}

.mt-slide-title {
  font-family: 'SF Pro Display', system-ui, sans-serif;
  font-size: clamp(36px, 4.8vw, 64px);
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.05;
  color: #FFFFFF;
  margin: 0 0 20px;
}

.mt-slide-desc {
  font-size: 18px;
  font-weight: 400;
  color: rgba(255,255,255,0.58);
  line-height: 1.65;
  max-width: 520px;
  margin: 0;
}

/* ── Tablet ── */
@media (max-width: 1024px) and (min-width: 768px) {
  .mt-layout { grid-template-columns: 240px 1fr; gap: 40px; }
  .mt-hl-light, .mt-hl-bold { font-size: 36px; }
  .mt-slide-title { font-size: 40px; }
  .mt-slide-desc  { font-size: 16px; }
}

/* ── Mobile ── */
@media (max-width: 767px) {
  .mt-section       { min-height: 550vh; }
  .mt-sticky        { align-items: flex-start; padding-top: 72px; }
  .mt-layout        { grid-template-columns: 1fr; gap: 28px; }
  .mt-aside         { flex-direction: row; align-items: center; justify-content: space-between; gap: 16px; }
  .mt-hl-light, .mt-hl-bold { font-size: 22px; }
  .mt-nav           { flex-direction: row; gap: 10px; align-items: center; }
  .mt-nav-bg-line,
  .mt-nav-fill-line { display: none; }
  .mt-nav-label     { display: none; }
  .mt-nav-item      { padding: 0; }
  .mt-nav-dot       { width: 7px; height: 7px; }
  .mt-stage         { height: clamp(260px, 48vh, 340px); }
  .mt-slide-title   { font-size: 30px; }
  .mt-slide-desc    { font-size: 15px; }
  .mt-slide-num-bg  { font-size: 110px; }
  .mt-slide-rule    { margin-bottom: 16px; }
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .mt-hl-light, .mt-hl-bold { transition: none !important; opacity: 0.4 !important; transform: none !important; }
  .mt-hl-bold { opacity: 1 !important; }
  .mt-slide   { transition: none !important; }
  .mt-slide.is-active { opacity: 1 !important; transform: none !important; }
  .mt-slide.is-past, .mt-slide.is-future { opacity: 0 !important; }
  .mt-nav-dot           { transition: none !important; }
  .mt-nav-fill-line     { transition: none !important; }
  .mt-nav-pulse         { animation: none !important; }
  .mt-slide-num-bg      { transition: none !important; }
}
`

export default function MethodologySection() {
  const sectionRef   = useRef(null)
  const headRef      = useRef(null)
  const activeIdxRef = useRef(0)
  const enteredRef   = useRef(false)

  const [activeIdx, setActiveIdx] = useState(0)
  const [entered,   setEntered]   = useState(false)

  // Scroll-driven pillar advance
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    let raf, stopped = false

    const tick = () => {
      if (stopped) return
      const rect  = section.getBoundingClientRect()
      const vh    = window.innerHeight
      const total = section.offsetHeight - vh

      // Entrance: trigger head animation once top edge enters view
      if (!enteredRef.current && rect.top < vh * 0.88) {
        enteredRef.current = true
        setEntered(true)
      }

      if (rect.top <= 0 && rect.bottom >= vh) {
        const p   = total > 0 ? Math.max(0, Math.min(1, -rect.top / total)) : 0
        const idx = Math.min(Math.floor(p * N), N - 1)
        if (idx !== activeIdxRef.current) {
          activeIdxRef.current = idx
          setActiveIdx(idx)
        }
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => { stopped = true; cancelAnimationFrame(raf) }
  }, [])

  // Fill line height: 0% at pillar 0, 100% at last pillar
  const fillPct = N > 1 ? (activeIdx / (N - 1)) * 100 : 0

  return (
    <>
      <style>{CSS}</style>
      <section ref={sectionRef} className="mt-section" aria-labelledby="mt-heading">
        <div className="mt-sticky">
          <div className="mt-container">
            <div className="mt-layout">

              {/* ── Left: title + nav ── */}
              <aside className="mt-aside" aria-hidden="true">
                <div ref={headRef} className={`mt-head${entered ? ' is-entered' : ''}`}>
                  <span className="mt-hl-light">Metodología</span>
                  <span className="mt-hl-bold">Constructiva</span>
                </div>

                <nav className="mt-nav" aria-label="Pilares de la metodología">
                  <div className="mt-nav-bg-line" />
                  <div className="mt-nav-fill-line" style={{ height: `${fillPct}%` }} />
                  {PILLARS.map((p, i) => {
                    const isActive = i === activeIdx
                    const isPast   = i < activeIdx
                    return (
                      <div
                        key={p.num}
                        className={`mt-nav-item${isActive ? ' is-active' : isPast ? ' is-past' : ''}`}
                      >
                        <div className="mt-nav-dot">
                          {isActive && <div className="mt-nav-pulse" />}
                        </div>
                        <span className="mt-nav-label">{p.title}</span>
                      </div>
                    )
                  })}
                </nav>
              </aside>

              {/* ── Right: animated pillar stage ── */}
              <div className="mt-stage" aria-live="polite" aria-atomic="true">
                {PILLARS.map((pillar, i) => {
                  const state = i === activeIdx ? 'is-active' : i < activeIdx ? 'is-past' : 'is-future'
                  return (
                    <div
                      key={pillar.num}
                      className={`mt-slide ${state}`}
                      aria-hidden={i !== activeIdx}
                    >
                      <span className="mt-slide-num-bg" aria-hidden="true">{pillar.num}</span>
                      <span className="mt-slide-eyebrow">{pillar.num}</span>
                      <div className="mt-slide-rule" aria-hidden="true" />
                      <h3 id="mt-heading" className="mt-slide-title">{pillar.title}</h3>
                      <p className="mt-slide-desc">{pillar.description}</p>
                    </div>
                  )
                })}
              </div>

            </div>
          </div>
        </div>
      </section>
    </>
  )
}
