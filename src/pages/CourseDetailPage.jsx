import { useState, useEffect, useRef } from 'react'
import { getCourseDetail } from '../data/courseDetails'
import { PRODUCTS_BY_SCHOOL } from '../data/schools'

const BASE = import.meta.env.BASE_URL

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IconStar = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor">
    <path d="M7 1l1.545 3.13L12 4.635l-2.5 2.435.59 3.44L7 8.885l-3.09 1.625.59-3.44L2 4.635l3.455-.505L7 1z"/>
  </svg>
)
const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IconChevDown = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 250ms ease' }}>
    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IconClock   = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M7 4v3.5l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
const IconUsers   = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M1 12c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="10.5" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M12.5 11c0-1.7-1-3-2.5-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
const IconPlay    = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><polygon points="3,2 12,7 3,12" fill="currentColor"/></svg>
const IconLevel   = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="8" width="3" height="5" rx="1" fill="currentColor" opacity=".5"/><rect x="5.5" y="5" width="3" height="8" rx="1" fill="currentColor" opacity=".75"/><rect x="10" y="2" width="3" height="11" rx="1" fill="currentColor"/></svg>

const INCLUDE_ICONS = {
  video:    () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="3" width="11" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M12 7l5-3v10l-5-3V7z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  clock:    () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.3"/><path d="M9 5v4.5l2.5 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  cert:     () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="2" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.3"/><circle cx="9" cy="7.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M7 16l2-2 2 2V13H7v3z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  file:     () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 1h7l4 4v12a1 1 0 01-1 1H4a1 1 0 01-1-1V2a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.3"/><path d="M11 1v4h4M6 8h6M6 11h6M6 14h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  infinity: () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2.5 9C2.5 7 4 5 6 5c2 0 3 2 3 2s1-2 3-2c2 0 3.5 2 3.5 4S14 13 12 13c-2 0-3-2-3-2s-1 2-3 2C4 13 2.5 11 2.5 9z" stroke="currentColor" strokeWidth="1.3"/></svg>,
  chat:     () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 3h14a1 1 0 011 1v8a1 1 0 01-1 1H5l-4 3V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
}

// ─── Accordion Module ─────────────────────────────────────────────────────────
function Module({ module, defaultOpen, thumb }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={`cdp-module${open ? ' is-open' : ''}`}>
      <button className="cdp-module-header" onClick={() => setOpen(o => !o)}>
        <span className="cdp-module-title">{module.title}</span>
        <span className="cdp-module-count">{module.lessons.length} lecciones</span>
        <IconChevDown open={open} />
      </button>
      {open && (
        <ul className="cdp-module-lessons">
          {module.lessons.map((lesson, i) => {
            const title    = typeof lesson === 'string' ? lesson : lesson.title
            const duration = typeof lesson === 'string' ? null   : lesson.duration
            return (
              <li key={i} className="cdp-module-lesson">
                <div className="cdp-lesson-thumb">
                  {thumb
                    ? <img src={thumb} alt="" />
                    : <span className="cdp-lesson-thumb-placeholder"><IconPlay /></span>
                  }
                </div>
                <span className="cdp-lesson-title">{title}</span>
                {duration && <span className="cdp-lesson-duration"><IconClock /> {duration}</span>}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

// ─── Enrollment Card ──────────────────────────────────────────────────────────
function EnrollCard({ course, detail, ctaLabel, cardRef }) {
  return (
    <div className="cdp-enroll-card" ref={cardRef}>
      {course.image && (
        <div className="cdp-enroll-img-wrap">
          <img src={course.image} alt="" className="cdp-enroll-img" />
          <div className="cdp-enroll-img-overlay" />
        </div>
      )}
      <div className="cdp-enroll-body">
        {detail?.discountLabel && (
          <span className="cdp-discount-badge">{detail.discountLabel}</span>
        )}
        <div className="cdp-enroll-prices">
          {detail?.originalPrice && (
            <span className="cdp-price-original">{detail.originalPrice}</span>
          )}
          <span className="cdp-price-main">{course.price}</span>
        </div>
        <button className="cdp-enroll-cta cta cta-primary">{ctaLabel}</button>
        <ul className="cdp-enroll-perks">
          <li><IconCheck /><span>Acceso inmediato de por vida</span></li>
          <li><IconCheck /><span>Certificado digital + físico</span></li>
          <li><IconCheck /><span>Soporte directo con la instructora</span></li>
        </ul>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CourseDetailPage({ course, school, onBack, onGoToDetail }) {
  const detail   = getCourseDetail(course.id)
  const ctaLabel = course.type === 'masterclass' || course.modality !== 'Grabado' ? 'Inscribirme' : 'Iniciar curso'
  const totalLessons = detail?.curriculum?.reduce((acc, m) => acc + m.lessons.length, 0) ?? 0
  const relatedCourses = (PRODUCTS_BY_SCHOOL[school.productKey] ?? []).filter(c => c.id !== course.id)

  const cardRef   = useRef(null)
  const [stickyCtaVisible, setStickyCtaVisible] = useState(false)

  useEffect(() => {
    document.body.style.overflow = ''
    const obs = new IntersectionObserver(([e]) => setStickyCtaVisible(!e.isIntersecting), { threshold: 0 })
    if (cardRef.current) obs.observe(cardRef.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
    const onKey = e => e.key === 'Escape' && onBack()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onBack])

  return (
    <div className="cdp-page">

      {/* ── Nav (fixed, transparent over hero) ── */}
      <header className={`cdp-nav${stickyCtaVisible ? ' is-scrolled' : ''}`}>
        <button className="cdp-nav-back" onClick={onBack} aria-label="Volver">
          <IconArrowLeft />
          <img src={`${BASE}logos/Logo_aqua.png`} alt="Constructiva" className="cdp-nav-logo" />
        </button>
        <p className="cdp-nav-title">{course.title}</p>
        <div className={`cdp-nav-cta-wrap${stickyCtaVisible ? ' is-visible' : ''}`}>
          <span className="cdp-nav-price">{course.price}</span>
          <button className="cdp-nav-cta cta cta-primary">{ctaLabel}</button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="cdp-hero">
        {/* Background media */}
        <div className="cdp-hero-media">
          {detail?.trailerVideo
            ? <video className="cdp-hero-video" autoPlay muted loop playsInline poster={detail.trailerImage ?? course.image}>
                <source src={detail.trailerVideo} type="video/mp4" />
              </video>
            : <img className="cdp-hero-video" src={detail?.trailerImage ?? course.image} alt="" />
          }
          <div className="cdp-hero-media-fade" />
        </div>

        <div className="cdp-hero-inner">
          {/* Left content */}
          <div className="cdp-hero-content">
            <div className="cdp-hero-badges">
              <span className={`crs-badge crs-badge--${course.type}`}>{course.type}</span>
              <span className="cdp-school-badge" style={{ background: school.gradient }}>
                {school.titleName}
              </span>
            </div>
            <h1 className="cdp-headline">
              {course.type === 'curso' ? `Curso de ${course.title}` : course.title}
            </h1>
            <p className="cdp-description">{course.description}</p>
            {detail && (
              <div className="cdp-hero-rating">
                <span className="cdp-stars">
                  {[1,2,3,4,5].map(i => (
                    <span key={i} className="cdp-star" style={{ color: i <= Math.round(detail.rating) ? '#F5A623' : 'rgba(255,255,255,0.2)' }}>
                      <IconStar />
                    </span>
                  ))}
                </span>
                <span className="cdp-rating-num">{detail.rating}</span>
                <span className="cdp-rating-count">({detail.totalStudents} estudiantes)</span>
              </div>
            )}
            <div className="cdp-hero-stats">
              <span className="cdp-stat"><IconClock />{course.duration}</span>
              <span className="cdp-stat-sep" />
              <span className="cdp-stat"><IconLevel />{course.level}</span>
              <span className="cdp-stat-sep" />
              <span className="cdp-stat"><IconPlay />{course.modality}</span>
              {totalLessons > 0 && <>
                <span className="cdp-stat-sep" />
                <span className="cdp-stat"><IconUsers />{totalLessons} lecciones</span>
              </>}
            </div>
          </div>

          {/* Right: price + CTA */}
          <aside className="cdp-hero-aside" ref={cardRef}>
            <div className="cdp-hero-cta-block">
              {detail?.discountLabel && (
                <span className="cdp-discount-badge">{detail.discountLabel}</span>
              )}
              <div className="cdp-enroll-prices">
                {detail?.originalPrice && (
                  <span className="cdp-price-original">{detail.originalPrice}</span>
                )}
                <span className="cdp-price-main">{course.price}</span>
              </div>
              <button className="cdp-enroll-cta cta cta-primary">{ctaLabel}</button>
              <ul className="cdp-enroll-perks">
                <li><IconCheck /><span>Acceso inmediato de por vida</span></li>
                <li><IconCheck /><span>Certificado digital + físico</span></li>
                <li><IconCheck /><span>Soporte directo con la instructora</span></li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <div className="cdp-body">

        {/* ── Curriculum ── */}
        {detail?.curriculum?.length > 0 && (
          <section className="cdp-section">
            <div className="cdp-section-header">
              <h2 className="cdp-section-title">Temario</h2>
              <span className="cdp-section-meta">
                {detail.curriculum.length} módulos · {totalLessons} lecciones · {course.duration}
              </span>
            </div>
            <div className="cdp-curriculum">
              {detail.curriculum.map((mod, i) => (
                <Module
                  key={mod.id}
                  module={mod}
                  defaultOpen={i === 0}
                  thumb={detail.trailerImage ?? course.image}
                />
              ))}
            </div>
            <div className="cdp-submit-project">
              <button className="cta cta-primary cdp-submit-btn">Entregar Proyecto Final</button>
            </div>
          </section>
        )}

        {/* ── Learning outcomes ── */}
        {detail?.outcomes?.length > 0 && (
          <section className="cdp-section">
            <h2 className="cdp-section-title">Lo que aprenderás</h2>
            <ul className="cdp-outcomes">
              {detail.outcomes.map((o, i) => (
                <li key={i} className="cdp-outcome-item">
                  <span className="cdp-outcome-icon"><IconCheck /></span>
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── What's included ── */}
        {detail?.includes?.length > 0 && (
          <section className="cdp-section">
            <h2 className="cdp-section-title">¿Qué incluye?</h2>
            <ul className="cdp-includes">
              {detail.includes.map((item, i) => {
                const Icon = INCLUDE_ICONS[item.icon] ?? INCLUDE_ICONS.file
                return (
                  <li key={i} className="cdp-include-item">
                    <span className="cdp-include-icon"><Icon /></span>
                    <span>{item.label}</span>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {/* ── Instructor ── */}
        {detail?.instructor && (
          <section className="cdp-section">
            <h2 className="cdp-section-title">Instructora</h2>
            <div className="cdp-instructor">
              <div className="cdp-instructor-img-wrap">
                <img src={detail.instructor.image} alt={detail.instructor.name} className="cdp-instructor-img" />
              </div>
              <div className="cdp-instructor-info">
                <h3 className="cdp-instructor-name">{detail.instructor.name}</h3>
                <p className="cdp-instructor-title">{detail.instructor.title}</p>
                <div className="cdp-instructor-stats">
                  <span><IconStar /> {detail.instructor.rating}</span>
                  <span className="cdp-stat-sep" />
                  <span><IconUsers /> {detail.instructor.students} estudiantes</span>
                  <span className="cdp-stat-sep" />
                  <span><IconPlay /> {detail.instructor.courses} cursos</span>
                </div>
                <p className="cdp-instructor-bio">{detail.instructor.bio}</p>
              </div>
            </div>
          </section>
        )}

        {/* ── School + related courses ── */}
        {relatedCourses.length > 0 && (
          <section className="cdp-section cdp-related-section">
            <div className="cdp-school-banner" style={{ background: school.gradient }}>
              <span className="cdp-school-banner-eyebrow">Parte de la</span>
              <h3 className="cdp-school-banner-name">{school.title}</h3>
              <p className="cdp-school-banner-desc">{school.description}</p>
            </div>
            <h2 className="cdp-section-title" style={{ marginTop: '28px' }}>Continúa tu formación</h2>
            <div className="cdp-related-grid">
              {relatedCourses.map(c => (
                <button
                  key={c.id}
                  className="cdp-related-card"
                  onClick={() => { window.scrollTo(0, 0); onGoToDetail?.(c, school) }}
                >
                  {c.image && (
                    <div className="cdp-related-img-wrap">
                      <img src={c.image} alt="" className="cdp-related-img" />
                    </div>
                  )}
                  <div className="cdp-related-body">
                    <span className={`crs-badge crs-badge--${c.type}`}>{c.type}</span>
                    <h3 className="cdp-related-title">{c.title}</h3>
                    <div className="cdp-related-footer">
                      <span className="cdp-related-duration">{c.duration} · {c.level}</span>
                      <span className={`cdp-related-price${c.price === 'Gratis' ? ' is-free' : ''}`}>{c.price}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* ── Mobile sticky bottom CTA ── */}
      <div className={`cdp-mobile-cta${stickyCtaVisible ? ' is-visible' : ''}`}>
        <div className="cdp-mobile-cta-inner">
          <div>
            {detail?.originalPrice && <span className="cdp-price-original">{detail.originalPrice}</span>}
            <span className="cdp-price-main">{course.price}</span>
          </div>
          <button className="cta cta-primary">{ctaLabel}</button>
        </div>
      </div>

    </div>
  )
}
