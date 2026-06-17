import { useState, useEffect, useRef } from 'react'
import ParticleCanvas from './ParticleCanvas'
import { SCHOOLS_DATA, PRODUCTS_BY_SCHOOL } from '../data/schools'

const BASE = import.meta.env.BASE_URL

// ─── PRODUCT CARD ──────────────────────────────────────────────────────────────
function ProductCard({ product, index }) {
  const num = String(index + 1).padStart(2, '0')
  return (
    <div className={`spc-card${product.image ? ' spc-card--has-img' : ''}`}>
      {product.image && (
        <img src={product.image} alt="" className="spc-card-bg-img" aria-hidden="true" />
      )}
      <span className="spc-card-num" aria-hidden="true">{num}</span>
      <div className="spc-card-glass" aria-hidden="true" />
      <span className={`spc-badge spc-badge--${product.type}`}>{product.type}</span>
      <span className="spc-card-arrow" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 12L12 4M12 4H6.5M12 4V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
      <div className="spc-card-body">
        <h4 className="spc-card-title">{product.title}</h4>
        <p className="spc-card-meta">{product.duration} · {product.level} · {product.modality}</p>
        <p className={`spc-card-price${product.price === 'Gratis' ? ' spc-price--free' : ''}`}>
          {product.price}
        </p>
      </div>
    </div>
  )
}

// ─── PRODUCT CAROUSEL ─────────────────────────────────────────────────────────
function ProductCarousel({ products }) {
  const trackRef  = useRef(null)
  const [canLeft,  setCanLeft]  = useState(false)
  const [canRight, setCanRight] = useState(products.length > 1)

  const sync = () => {
    const el = trackRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 4)
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const raf = requestAnimationFrame(sync)
    el.addEventListener('scroll', sync, { passive: true })
    return () => { cancelAnimationFrame(raf); el.removeEventListener('scroll', sync) }
  }, [products.length])

  const scroll = dir => trackRef.current?.scrollBy({ left: dir * 296, behavior: 'smooth' })

  if (products.length === 0) {
    return (
      <div className="spc-wrap">
        <div className="spc-card spc-card--empty">
          <span className="spc-card-num spc-card-num--icon" aria-hidden="true">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="0.8" />
              <path d="M8 2v4M16 2v4M3 10h18" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
            </svg>
          </span>
          <div className="spc-card-glass" aria-hidden="true" />
          <span className="spc-badge spc-badge--soon">Próximamente</span>
          <div className="spc-card-body">
            <h4 className="spc-card-title">Cursos en camino</h4>
            <p className="spc-card-meta">Estamos diseñando el contenido de esta escuela.</p>
            <button className="spc-empty-cta">Avísame cuando estén listos</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="spc-wrap">
      <div ref={trackRef} className="spc-track">
        {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>
      <button
        className={`spc-btn spc-btn--prev${canLeft ? ' spc-btn--vis' : ''}`}
        onClick={() => scroll(-1)}
        aria-label="Anterior"
        tabIndex={canLeft ? 0 : -1}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 2.5L4.5 7 9 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        className={`spc-btn spc-btn--next${canRight ? ' spc-btn--vis' : ''}`}
        onClick={() => scroll(1)}
        aria-label="Siguiente"
        tabIndex={canRight ? 0 : -1}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M5 2.5L9.5 7 5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}

export default function SchoolsSection({ onViewCourses }) {
  const sectionRef   = useRef(null)
  const progressRef  = useRef(0)
  const phaseRef     = useRef(0)
  const entryRef     = useRef(null)

  const [phase, setPhase]         = useState(0)
  const [hoveredId, setHoveredId] = useState(null)

  useEffect(() => {
    document.body.classList.toggle('school-card-open', hoveredId !== null)
    return () => document.body.classList.remove('school-card-open')
  }, [hoveredId])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    let raf = 0, stopped = false

    const tick = () => {
      if (stopped) return
      const rect  = section.getBoundingClientRect()
      const vh    = window.innerHeight
      const total = section.offsetHeight - vh

      let p = 0
      if (rect.top <= 0 && rect.bottom >= vh) {
        p = total > 0 ? Math.max(0, Math.min(1, -rect.top / total)) : 0
      } else if (rect.bottom < vh) {
        p = 1
      }

      progressRef.current = p

      const entryT = rect.top > 0
        ? Math.max(0, Math.min(1, 1 - rect.top / (vh * 0.6)))
        : 1
      if (entryRef.current) {
        entryRef.current.style.opacity = String(1 - entryT)
      }

      let next
      if (rect.top > vh * 0.85) next = 0
      else if (p < 0.38) next = 1
      else if (p < 0.58) next = 2
      else next = 3

      if (next !== phaseRef.current) {
        phaseRef.current = next
        setPhase(next)
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => { stopped = true; cancelAnimationFrame(raf) }
  }, [])

  const cardsVisible = phase >= 2
  const hoverActive  = phase >= 2

  const titleStyle = {
    opacity: phase === 1 ? 1 : 0,
    transform:
      phase === 0
        ? 'translateY(calc(-50% + 40px))'
        : phase >= 2
          ? 'translateY(calc(-50% - 50px))'
          : 'translateY(-50%)',
    transition:
      phase === 1
        ? 'opacity 800ms var(--ease-cinema), transform 800ms var(--ease-cinema)'
        : phase === 0
          ? 'opacity 300ms ease, transform 300ms ease'
          : 'opacity 550ms ease, transform 600ms ease',
  }

  const isOpen = hoveredId !== null

  const stickyStyle = isOpen
    ? { top: 0, height: '100vh' }
    : undefined

  const cardsStyle = {
    pointerEvents: hoverActive ? 'auto' : 'none',
    ...(isOpen ? { height: '100vh', top: 0, transform: 'none' } : {}),
  }

  return (
    <section ref={sectionRef} className={`schools-section${isOpen ? ' has-active-card' : ''}`}>
      <div className="schools-sticky" style={stickyStyle}>

        {/* Animated particle background */}
        <div className="schools-parallax-wrap" aria-hidden="true">
          <ParticleCanvas progressRef={progressRef} />
        </div>

        {/* Entry-transition overlay */}
        <div ref={entryRef} className="schools-entry-overlay" />

        {/* Persistent dark gradient overlay */}
        <div className="schools-video-overlay" />

        {/* Phase 1: title */}
        <div className="schools-title-wrap" style={titleStyle}>
          <h2 className="schools-title">Descubre las Escuelas dentro de Constructiva</h2>
        </div>

        {/* Phase 2+: cards */}
        <div
          className="schools-cards"
          onMouseLeave={() => setHoveredId(null)}
          style={cardsStyle}
        >
          {SCHOOLS_DATA.map((school, i) => {
            const schoolProducts = PRODUCTS_BY_SCHOOL[school.productKey] ?? []
            const isHovered = hoveredId === school.id
            const isDimmed  = hoveredId !== null && !isHovered
            return (
              <div
                key={school.id}
                className={`school-card${cardsVisible ? ' cards-visible' : ''}${isHovered ? ' is-hovered' : ''}${isDimmed ? ' is-dimmed' : ''}`}
                style={{ transitionDelay: phase === 2 ? `${i * 80}ms` : '0ms' }}
                onMouseEnter={() => hoverActive && setHoveredId(school.id)}
              >
                <div
                  className="school-card-bg"
                  style={{
                    backgroundImage: school.image
                      ? `url(${school.image})`
                      : school.gradient,
                  }}
                />
                <div className="school-card-overlay" />
                <div className="school-card-title-default">
                  <span className="card-title-prefix">{school.titlePrefix}</span>
                  <span className="card-title-name">{school.titleName}</span>
                </div>
                <div className="school-card-expanded">
                  <div className="spc-panel-top">
                    <h3 className="school-card-title-expanded">{school.title}</h3>
                    <div className="school-card-deco-line" />
                    <p className="school-card-desc spc-desc-clamp">{school.description}</p>
                  </div>
                  <ProductCarousel products={schoolProducts} />
                  <a
                    href="#"
                    className="school-card-cta-link"
                    onClick={e => { e.preventDefault(); onViewCourses?.(school.id) }}
                  >
                    {schoolProducts.length > 0 ? 'Ver todos los cursos' : 'Suscribirme a novedades'}
                    <span className="school-card-cta-arrow">→</span>
                  </a>
                </div>
                {i < SCHOOLS_DATA.length - 1 && <div className="school-card-divider" />}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
