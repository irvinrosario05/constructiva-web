import { useState, useEffect, useRef, useCallback } from 'react'
import { SCHOOLS_DATA, PRODUCTS_BY_SCHOOL } from '../data/schools'

const BASE = import.meta.env.BASE_URL

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconClose = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M14 4L4 14M4 4l10 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
)
const IconArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IconClock = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M7 4v3.5l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IconChevLeft = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IconChevRight = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const LEVEL_COLOR = { Inicial: '#36DBCA', Intermedio: '#F5A623', Avanzado: '#E05252' }

// ─── Course Modal ─────────────────────────────────────────────────────────────
function CourseModal({ course, school, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = e => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [onClose])

  return (
    <div className="crs-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="crs-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="crs-modal-hero">
          {course.image
            ? <img src={course.image} alt="" className="crs-modal-hero-img" />
            : <div className="crs-modal-hero-fallback" style={{ background: school.gradient }} />
          }
          <div className="crs-modal-hero-overlay" />
          <button className="crs-modal-close" onClick={onClose} aria-label="Cerrar"><IconClose /></button>
          <div className="crs-modal-hero-content">
            <span className={`crs-badge crs-badge--${course.type}`}>{course.type}</span>
            <h2 id="modal-title" className="crs-modal-title">{course.title}</h2>
          </div>
        </div>
        <div className="crs-modal-body">
          <div className="crs-modal-school-tag">
            <span className="crs-modal-school-dot" style={{ background: school.color }} />
            {school.title}
          </div>
          <p className="crs-modal-desc">{course.description}</p>
          <div className="crs-modal-meta">
            <span className="crs-meta-chip"><IconClock /> {course.duration}</span>
            <span className="crs-meta-chip" style={{ color: LEVEL_COLOR[course.level] }}>{course.level}</span>
            <span className="crs-meta-chip">{course.modality}</span>
          </div>
          <div className="crs-modal-footer">
            <div>
              <p className="crs-modal-price-label">Precio</p>
              <p className={`crs-modal-price${course.price === 'Gratis' ? ' crs-modal-price--free' : ''}`}>{course.price}</p>
            </div>
            <button className="cta cta-primary crs-modal-cta">
              {course.price === 'Gratis' ? 'Registrarme gratis' : 'Inscribirme'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Stage Carousel ───────────────────────────────────────────────────────────
const INTERVAL = 10000

function StageCarousel({ products, school, onCardClick, onGoToDetail }) {
  const [active, setActive] = useState(0)
  const [progress, setProgress] = useState(0)
  const timerRef    = useRef(null)
  const progressRef = useRef(null)
  const startRef    = useRef(null)

  const count = products.length

  const startTimer = useCallback(() => {
    clearTimeout(timerRef.current)
    cancelAnimationFrame(progressRef.current)
    setProgress(0)
    startRef.current = performance.now()
    const tick = (now) => {
      const elapsed = now - startRef.current
      setProgress(Math.min(elapsed / INTERVAL, 1))
      if (elapsed < INTERVAL) progressRef.current = requestAnimationFrame(tick)
    }
    progressRef.current = requestAnimationFrame(tick)
    timerRef.current = setTimeout(() => {
      setActive(i => (i + 1) % count)
    }, INTERVAL)
  }, [count])

  useEffect(() => {
    if (count > 1) startTimer()
    return () => { clearTimeout(timerRef.current); cancelAnimationFrame(progressRef.current) }
  }, [active, count, startTimer])

  const goTo = (idx) => setActive(idx)

  const getPos = (i) => {
    let pos = i - active
    if (pos > Math.floor(count / 2))  pos -= count
    if (pos < -Math.floor(count / 2)) pos += count
    return pos
  }

  if (count === 0) {
    return (
      <div className="crs-stage-empty">
        <span className="crs-badge crs-badge--soon">Próximamente</span>
        <p>Estamos diseñando los cursos de esta escuela.</p>
      </div>
    )
  }

  return (
    <div className="crs-stage">
      <div className="crs-stage-track">
        {products.map((course, i) => {
          const pos = getPos(i)
          const abs = Math.abs(pos)
          if (abs > 2) return null
          const isActive = pos === 0
          const scale   = isActive ? 1 : Math.max(0.58, 1 - abs * 0.22)
          const opacity = isActive ? 1 : Math.max(0.28, 1 - abs * 0.44)
          const zIndex  = isActive ? 10 : Math.max(1, 10 - abs * 3)

          return (
            <button
              key={course.id}
              className={`crs-stage-card${isActive ? ' is-active' : ''}`}
              style={{
                transform: `translateX(calc(${pos} * var(--card-offset))) scale(${scale})`,
                opacity,
                zIndex,
              }}
              onClick={() => isActive ? onCardClick(course, school) : goTo(i)}
              aria-label={isActive ? `Ver detalle de ${course.title}` : `Ir a ${course.title}`}
            >
              <div className="crs-stage-img-wrap">
                {course.image
                  ? <img src={course.image} alt="" className="crs-stage-img" />
                  : <div className="crs-stage-img-fallback" style={{ background: school.gradient }} />
                }
                <div className="crs-stage-img-overlay" />
              </div>
              <div className="crs-stage-card-info">
                <span className={`crs-badge crs-badge--${course.type}`}>{course.type}</span>
                <h3 className="crs-stage-card-title">{course.title}</h3>
                {course.teacher && (
                  <p className="crs-stage-card-teacher">
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true" style={{display:'inline',verticalAlign:'middle',marginRight:4,opacity:0.6}}>
                      <circle cx="6" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
                      <path d="M1.5 10.5c0-2.485 2.015-4 4.5-4s4.5 1.515 4.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                    {course.teacher}
                  </p>
                )}
                <div className="crs-stage-card-meta">
                  <span><IconClock />{course.duration}</span>
                  <span className="crs-meta-dot" />
                  <span style={{ color: LEVEL_COLOR[course.level] }}>{course.level}</span>
                  <span className="crs-meta-dot" />
                  <span>{course.modality}</span>
                </div>
                <div className="crs-stage-card-bottom">
                  <p className={`crs-stage-card-price${course.price === 'Gratis' ? ' is-free' : ''}`}>
                    {course.price}
                  </p>
                  <span
                    role="button"
                    tabIndex={isActive ? 0 : -1}
                    className="crs-stage-card-cta"
                    onClick={e => { e.stopPropagation(); if (isActive) onGoToDetail(course, school) }}
                    onKeyDown={e => e.key === 'Enter' && e.stopPropagation()}
                  >
                    {course.type === 'masterclass' || course.modality !== 'Grabado' ? 'Inscribirme' : 'Iniciar'}
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {count > 1 && (
        <>
          <button className="crs-stage-arrow crs-stage-arrow--prev" onClick={() => goTo((active - 1 + count) % count)} aria-label="Anterior">
            <IconChevLeft />
          </button>
          <button className="crs-stage-arrow crs-stage-arrow--next" onClick={() => goTo((active + 1) % count)} aria-label="Siguiente">
            <IconChevRight />
          </button>
        </>
      )}

      {count > 1 && (
        <div className="crs-stage-dots">
          {products.map((_, i) => (
            <button key={i} className={`crs-stage-dot${active === i ? ' is-active' : ''}`} onClick={() => goTo(i)} aria-label={`Ir al curso ${i + 1}`}>
              {active === i && <span className="crs-stage-dot-fill" style={{ transform: `scaleX(${progress})` }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── School Section ───────────────────────────────────────────────────────────
function SchoolSection({ school, onCourseClick, onGoToDetail }) {
  const products = PRODUCTS_BY_SCHOOL[school.productKey] ?? []
  return (
    <section id={`school-${school.id}`} className="crs-school-section">
      <StageCarousel products={products} school={school} onCardClick={onCourseClick} onGoToDetail={onGoToDetail} />
    </section>
  )
}


// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CoursesPage({ onBack, initialSchoolId = null, onGoToDetail }) {
  const [activeTab, setActiveTab]     = useState(initialSchoolId ?? SCHOOLS_DATA[0].id)
  const [modalCourse, setModalCourse] = useState(null)
  const [modalSchool, setModalSchool] = useState(null)

  const scrollTo = id => {
    const el = document.getElementById(`school-${id}`)
    if (!el) return
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: 'smooth' })
  }

  useEffect(() => {
    const sections = SCHOOLS_DATA.map(s => document.getElementById(`school-${s.id}`)).filter(Boolean)
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActiveTab(entry.target.id.replace('school-', ''))
      })
    }, { rootMargin: '-25% 0px -65% 0px' })
    sections.forEach(s => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!initialSchoolId) return
    setTimeout(() => {
      const el = document.getElementById(`school-${initialSchoolId}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 120)
  }, [initialSchoolId])

  return (
    <div className="crs-page">

      {/* ── Floating left navigation panel ── */}
      <aside className="crs-float-nav">
        <button className="crs-float-back" onClick={onBack} aria-label="Volver al inicio">
          <img src={`${BASE}logos/Logo_aqua.png`} alt="Constructiva" className="crs-nav-logo" />
        </button>

        <div className="crs-float-divider" />

        <p className="crs-float-label">Escuelas</p>
        <nav className="crs-float-tabs" aria-label="Escuelas">
          {SCHOOLS_DATA.map(s => {
            const count = (PRODUCTS_BY_SCHOOL[s.productKey] ?? []).length
            return (
              <button
                key={s.id}
                className={`crs-tab${activeTab === s.id ? ' crs-tab--active' : ''}`}
                onClick={() => scrollTo(s.id)}
              >
                {s.titleName}{count > 0 ? ` (${count})` : ''}
              </button>
            )
          })}
        </nav>
      </aside>

      <main className="crs-main">
        {SCHOOLS_DATA.map(school => (
          <SchoolSection
            key={school.id}
            school={school}
            onCourseClick={(course, school) => { setModalCourse(course); setModalSchool(school) }}
            onGoToDetail={onGoToDetail}
          />
        ))}
      </main>

      <footer className="crs-footer">
        <span>© 2025 Constructiva</span>
        <button onClick={onBack} className="crs-footer-back">← Volver al inicio</button>
      </footer>

      {modalCourse && modalSchool && (
        <CourseModal
          course={modalCourse}
          school={modalSchool}
          onClose={() => { setModalCourse(null); setModalSchool(null) }}
        />
      )}
    </div>
  )
}
