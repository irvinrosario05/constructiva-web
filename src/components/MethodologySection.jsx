import { useEffect, useRef } from 'react'

const PILLARS = [
  {
    num: '01',
    title: 'Aprende haciendo',
    description: 'Cada curso en vivo o grabado se aplica a la realidad de nuestros estudiantes.',
  },
  {
    num: '02',
    title: 'Estudio del caso',
    description: 'Casos reales con experiencias y aprendizajes de proyectos reales.',
  },
  {
    num: '03',
    title: 'Proyecto transversal',
    description: 'Evaluamos tu desempeño con proyectos prácticos, no con tareas.',
  },
  {
    num: '04',
    title: 'Escenarios dinámicos',
    description: 'Nuestros estudiantes toman decisiones en situaciones interactivas.',
  },
  {
    num: '05',
    title: 'Comunidad e interacción',
    description: 'Expertos guiándote y estudiantes compartiendo conocimiento.',
  },
]

/* ─────────────────────────────────────────────
   Scoped CSS — injected once via React 19 <style>
───────────────────────────────────────────── */
const CSS = `
.mt-section {
  background: var(--ink-900, #0A0A0A);
  padding: 140px 0 160px;
  overflow: hidden;
  position: relative;
}

.mt-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 clamp(24px, 5vw, 80px);
}

/* ── Zone 1: Header ── */
.mt-header {
  margin-bottom: 112px;
  max-width: 680px;
}

.mt-headline {
  margin: 0 0 32px;
  letter-spacing: -0.04em;
  line-height: 1.0;
}

.mt-hl-light {
  display: block;
  font-family: 'SF Pro Display', system-ui, sans-serif;
  font-size: clamp(48px, 6vw, 76px);
  font-weight: 200;
  color: #FFFFFF;
  opacity: 0.4;
  line-height: 1.0;
}

.mt-hl-bold {
  display: block;
  font-family: 'SF Pro Display', system-ui, sans-serif;
  font-size: clamp(48px, 6vw, 76px);
  font-weight: 700;
  color: #FFFFFF;
  line-height: 1.05;
}

.mt-tagline {
  font-size: 18px;
  font-weight: 400;
  color: #FFFFFF;
  line-height: 1.5;
  margin: 0 0 12px;
}

.mt-tagline-hl {
  color: var(--aqua, #36DBCA);
  font-style: italic;
}

.mt-subtext {
  font-size: 16px;
  font-weight: 400;
  color: var(--ink-500, #6B6B6B);
  line-height: 1.6;
  max-width: 480px;
  margin: 0;
}

/* ── Reveal base ── */
.mt-reveal {
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 700ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 700ms cubic-bezier(0.16, 1, 0.3, 1);
}
.mt-reveal.is-in {
  opacity: 1;
  transform: translateY(0);
}
/* Preserve design opacity on the light headline */
.mt-hl-light.mt-reveal.is-in { opacity: 0.4; }

/* ── Zone 2: Timeline ── */
.mt-timeline {
  position: relative;
}

.mt-timeline-inner {
  position: relative;
  max-width: 960px;
  margin: 0 auto;
}

/* Vertical line */
.mt-vline-track {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  transform: translateX(-1px);
  width: 2px;
  pointer-events: none;
  z-index: 0;
  /* faint ghost of full line so you can see it hasn't loaded yet */
  background: rgba(54,219,202,0.07);
}

.mt-vline {
  width: 100%;
  height: 0;
  background: linear-gradient(
    to bottom,
    var(--aqua, #36DBCA) 0%,
    rgba(54, 219, 202, 0.5) 60%,
    rgba(54, 219, 202, 0.08) 100%
  );
  transition: height 2200ms cubic-bezier(0.16, 1, 0.3, 1);
}
.mt-vline.is-drawn { height: 100%; }

/* ── Timeline node ── */
.mt-node {
  display: grid;
  grid-template-columns: 1fr 80px 1fr;
  align-items: start;
  margin-bottom: 72px;
  position: relative;
}
.mt-node:last-child { margin-bottom: 0; }

/* Dot */
.mt-dot-col {
  grid-column: 2;
  grid-row: 1;
  display: flex;
  justify-content: center;
  padding-top: 38px;
  position: relative;
  z-index: 2;
}

.mt-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--aqua, #36DBCA);
  box-shadow:
    0 0 0 3px rgba(54, 219, 202, 0.18),
    0 0 12px rgba(54, 219, 202, 0.25);
  position: relative;
  flex-shrink: 0;
  transition: box-shadow 400ms cubic-bezier(0.16, 1, 0.3, 1);
}

.mt-node:hover .mt-dot {
  box-shadow:
    0 0 0 6px rgba(54, 219, 202, 0.22),
    0 0 28px rgba(54, 219, 202, 0.55);
}

.mt-pulse {
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  background: rgba(54, 219, 202, 0.28);
  animation: mt-pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  pointer-events: none;
}

@keyframes mt-pulse {
  0%, 100% { transform: scale(1);   opacity: 0.6; }
  50%       { transform: scale(1.7); opacity: 0;   }
}

/* Cards */
.mt-card {
  background: var(--ink-700, #1F1F1F);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 36px 32px 40px;
  position: relative;
  overflow: hidden;
  cursor: default;
  transition:
    transform 550ms cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 550ms cubic-bezier(0.16, 1, 0.3, 1),
    border-color 400ms ease;
}

.mt-card:hover {
  transform: translateY(-4px);
  box-shadow:
    0 28px 64px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(54, 219, 202, 0.16),
    0 0 48px rgba(54, 219, 202, 0.07);
  border-color: rgba(54, 219, 202, 0.14);
}

/* Alternating placement */
.mt-node.is-left .mt-card  { grid-column: 1; grid-row: 1; }
.mt-node.is-right .mt-card { grid-column: 3; grid-row: 1; }

/* Decorative large number */
.mt-num-bg {
  position: absolute;
  bottom: -16px;
  right: 12px;
  font-family: 'SF Pro Display', system-ui, sans-serif;
  font-size: 120px;
  font-weight: 700;
  line-height: 1;
  color: var(--aqua, #36DBCA);
  opacity: 0.07;
  letter-spacing: -0.04em;
  pointer-events: none;
  user-select: none;
  transition: opacity 400ms ease;
}
.mt-card:hover .mt-num-bg { opacity: 0.13; }

/* Card eyebrow: small num */
.mt-card-num {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--aqua, #36DBCA);
  margin-bottom: 14px;
  display: block;
}

/* Thin accent line under eyebrow */
.mt-card-rule {
  width: 32px;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(90deg, var(--teal, #248D84), var(--aqua, #36DBCA));
  margin-bottom: 16px;
}

.mt-card-title {
  font-family: 'SF Pro Display', system-ui, sans-serif;
  font-size: clamp(20px, 1.8vw, 26px);
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.2;
  color: #FFFFFF;
  margin: 0 0 12px;
}

.mt-card-desc {
  font-size: 15px;
  font-weight: 400;
  color: var(--ink-500, #6B6B6B);
  line-height: 1.65;
  margin: 0;
}

/* ── Node reveal animation ── */
.mt-node.mt-reveal {
  transform: translateY(28px) scale(0.97);
}
.mt-node.mt-reveal.is-in {
  transform: translateY(0) scale(1);
}

/* ── Tablet ── */
@media (max-width: 1024px) and (min-width: 768px) {
  .mt-timeline-inner  { max-width: 100%; }
  .mt-vline-track     { left: 22px; transform: none; }
  .mt-node            { grid-template-columns: 44px 1fr; gap: 0 24px; }
  .mt-dot-col         { grid-column: 1; }
  .mt-node.is-left .mt-card,
  .mt-node.is-right .mt-card { grid-column: 2; grid-row: 1; }
}

/* ── Mobile ── */
@media (max-width: 767px) {
  .mt-section          { padding: 88px 0 100px; }
  .mt-header           { margin-bottom: 72px; }
  .mt-hl-light,
  .mt-hl-bold          { font-size: 40px; }
  .mt-timeline-inner   { max-width: 100%; }
  .mt-vline-track      { left: 22px; transform: none; }
  .mt-node             { grid-template-columns: 44px 1fr; gap: 0 20px; margin-bottom: 48px; }
  .mt-dot-col          { grid-column: 1; }
  .mt-node.is-left .mt-card,
  .mt-node.is-right .mt-card { grid-column: 2; grid-row: 1; }
  .mt-card             { padding: 24px 20px 28px; }
  .mt-num-bg           { font-size: 84px; }
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .mt-reveal                          { opacity: 1 !important; transform: none !important; transition: none !important; }
  .mt-hl-light.mt-reveal.is-in        { opacity: 0.4 !important; }
  .mt-vline                           { height: 100% !important; transition: none !important; }
  .mt-pulse                           { animation: none !important; }
  .mt-card                            { transition: none !important; }
  .mt-dot                             { transition: none !important; }
}
`

export default function MethodologySection() {
  const lineRef     = useRef(null)
  const nodeRefs    = useRef([])
  const headerRefs  = useRef([])

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // All elements that participate in the reveal
    const headers = headerRefs.current.filter(Boolean)
    const nodes   = nodeRefs.current.filter(Boolean)

    if (reduced) {
      headers.forEach(el => el.classList.add('is-in'))
      nodes.forEach(el   => el.classList.add('is-in'))
      if (lineRef.current) lineRef.current.classList.add('is-drawn')
      return
    }

    // Line: start drawing when timeline container enters viewport
    const lineObs = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          if (lineRef.current) lineRef.current.classList.add('is-drawn')
          lineObs.disconnect()
        }
      },
      { threshold: 0.05 }
    )
    if (lineRef.current) lineObs.observe(lineRef.current.closest('.mt-timeline-inner'))

    // Header items: fire together (stagger via CSS transition-delay)
    const headerObs = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            headerObs.unobserve(e.target)
          }
        })
      },
      { threshold: 0.1 }
    )
    headers.forEach(el => headerObs.observe(el))

    // Nodes: each observed individually, stagger from CSS delay
    const nodeObs = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            nodeObs.unobserve(e.target)
          }
        })
      },
      { threshold: 0.15 }
    )
    nodes.forEach(el => nodeObs.observe(el))

    return () => {
      lineObs.disconnect()
      headerObs.disconnect()
      nodeObs.disconnect()
    }
  }, [])

  return (
    <>
      <style>{CSS}</style>
      <section className="mt-section" aria-labelledby="mt-heading">
        <div className="mt-container">

          {/* ── Zone 1: Header ── */}
          <header className="mt-header">
            <h2 id="mt-heading" className="mt-headline">
              <span
                className="mt-hl-light mt-reveal"
                ref={el => { headerRefs.current[0] = el }}
              >
                Metodología
              </span>
              <span
                className="mt-hl-bold mt-reveal"
                ref={el => { headerRefs.current[1] = el }}
                style={{ transitionDelay: '160ms' }}
              >
                Constructiva
              </span>
            </h2>
            <p
              className="mt-tagline mt-reveal"
              ref={el => { headerRefs.current[2] = el }}
              style={{ transitionDelay: '280ms' }}
            >
              Construye tu futuro,{' '}
              <em className="mt-tagline-hl">hoy.</em>
            </p>
            <p
              className="mt-subtext mt-reveal"
              ref={el => { headerRefs.current[3] = el }}
              style={{ transitionDelay: '380ms' }}
            >
              Creemos en los profesionales, aquellos con el potencial para transformar la industria.
            </p>
          </header>

          {/* ── Zone 2: Timeline ── */}
          <div className="mt-timeline">
            <div className="mt-timeline-inner">

              {/* Growing vertical line */}
              <div className="mt-vline-track">
                <div className="mt-vline" ref={lineRef} />
              </div>

              {/* Pillar nodes */}
              {PILLARS.map((pillar, i) => (
                <div
                  key={pillar.num}
                  className={`mt-node mt-reveal ${i % 2 === 0 ? 'is-left' : 'is-right'}`}
                  ref={el => { nodeRefs.current[i] = el }}
                  style={{ transitionDelay: `${i * 130}ms` }}
                >
                  {/* Center dot */}
                  <div className="mt-dot-col" aria-hidden="true">
                    <div className="mt-dot">
                      <div className="mt-pulse" />
                    </div>
                  </div>

                  {/* Card */}
                  <article className="mt-card">
                    <span className="mt-card-num" aria-label={`Pilar ${pillar.num}`}>
                      {pillar.num}
                    </span>
                    <div className="mt-card-rule" aria-hidden="true" />
                    <h3 className="mt-card-title">{pillar.title}</h3>
                    <p className="mt-card-desc">{pillar.description}</p>
                    <span className="mt-num-bg" aria-hidden="true">{pillar.num}</span>
                  </article>
                </div>
              ))}

            </div>
          </div>

        </div>
      </section>
    </>
  )
}
