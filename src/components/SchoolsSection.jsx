import { useState, useEffect, useRef } from 'react'

const BASE = import.meta.env.BASE_URL

const SCHOOLS_DATA = [
  {
    id: 'bim',
    title: 'Escuela BIM',
    titlePrefix: 'Escuela',
    titleName: 'BIM',
    image: `${BASE}schools/school-bim.jpg`,
    gradient: 'linear-gradient(145deg, #0D2B2A, #1A4A47)',
    description: 'Domina la metodología BIM y aprende de expertos las herramientas que están transformando la forma de construir.',
    courses: [
      { name: 'Fundamentos de la metodología BIM', duration: '6 h' },
      { name: 'Revit Arquitectura básico', duration: '18 h' },
      { name: 'Navisworks básico', duration: '10 h' },
    ],
  },
  {
    id: 'direction',
    title: 'Escuela de Dirección de Proyectos',
    titlePrefix: 'Escuela de',
    titleName: 'Dirección de Proyectos',
    image: `${BASE}schools/school-direction.jpg`,
    gradient: 'linear-gradient(145deg, #1A1A2E, #2D2D4A)',
    description: 'Recorre el camino de ingeniero o arquitecto a Director de Proyectos.',
    courses: [
      { name: 'Fundamentos de la gestión de proyectos', duration: '4 h' },
      { name: 'Dirección de Proyectos', duration: '18 h' },
      { name: 'Lean Construction', duration: '10 h' },
    ],
  },
  {
    id: 'digital',
    title: 'Escuela de Transformación Digital',
    titlePrefix: 'Escuela de',
    titleName: 'Transformación Digital',
    image: `${BASE}schools/school-digital.jpg`,
    gradient: 'linear-gradient(145deg, #0A1628, #1A2D4A)',
    description: 'Únete a la revolución digital en la construcción y lidera el cambio de paradigma con la inteligencia artificial.',
    courses: [
      { name: 'Inteligencia Artificial para productividad', duration: '6 h' },
      { name: 'Creación de renders + IA', duration: '18 h' },
      { name: 'Claude para ingenieros y arquitectos', duration: '10 h' },
    ],
  },
  {
    id: 'management',
    title: 'Escuela de Gestión de Obras',
    titlePrefix: 'Escuela de',
    titleName: 'Gestión de Obras',
    image: `${BASE}schools/school-management.jpg`,
    gradient: 'linear-gradient(145deg, #1C1208, #3D2A10)',
    description: 'Aprende cómo se construye y se lidera en el campo — desde la planificación hasta la ejecución de cada proyecto.',
    courses: [
      { name: 'Cubicaciones de obra', duration: '6 h' },
      { name: 'Presupuestos de obras intermedio', duration: '18 h' },
      { name: 'Excel para ingenieros y arquitectos', duration: '10 h' },
    ],
  },
]

export default function SchoolsSection() {
  const sectionRef  = useRef(null)
  const bgRef       = useRef(null)
  const phaseRef    = useRef(0)
  const [phase, setPhase]         = useState(0)
  const [hoveredId, setHoveredId] = useState(null)

  // 0 = not visible, 1 = title, 2 = cards entering, 3 = hover active
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

      // Parallax: image travels -15% → +15% as p goes 0 → 1
      if (bgRef.current) {
        bgRef.current.style.transform = `translateY(${(p - 0.5) * 30}%)`
      }

      // Phase transitions
      let next
      if (rect.top > vh * 0.95) next = 0
      else if (p < 0.4) next = 1
      else if (p < 0.6) next = 2
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
        ? 'translateY(calc(-50% + 30px))'
        : phase >= 2
          ? 'translateY(calc(-50% - 40px))'
          : 'translateY(-50%)',
    transition:
      phase === 1
        ? 'opacity 700ms var(--ease-cinema), transform 700ms var(--ease-cinema)'
        : 'opacity 450ms ease, transform 500ms ease',
  }

  return (
    <section ref={sectionRef} className="schools-section">
      <div className="schools-sticky">

        {/* Parallax background image */}
        <div className="schools-parallax-wrap" aria-hidden="true">
          <img
            ref={bgRef}
            className="schools-parallax-img"
            src={`${BASE}schools/schools-bg.jpg`}
            alt=""
          />
        </div>
        <div className="schools-video-overlay" />

        {/* Phase 1: title */}
        <div className="schools-title-wrap" style={titleStyle}>
          <h2 className="schools-title">Descubre las Escuelas dentro de Constructiva</h2>
        </div>

        {/* Phase 2+: cards */}
        <div
          className="schools-cards"
          onMouseLeave={() => setHoveredId(null)}
          style={{ pointerEvents: hoverActive ? 'auto' : 'none' }}
        >
          {SCHOOLS_DATA.map((school, i) => {
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
                  <h3 className="school-card-title-expanded">{school.title}</h3>
                  <div className="school-card-deco-line" />
                  <p className="school-card-desc">{school.description}</p>
                  <div className="school-card-courses-label">Cursos</div>
                  <ul className="school-card-courses">
                    {school.courses.map((c, ci) => (
                      <li key={ci} className="school-card-course">
                        <span className="school-card-course-name">{c.name}</span>
                        <span className="school-card-course-duration">{c.duration}</span>
                      </li>
                    ))}
                  </ul>
                  <a href="#" className="school-card-cta-link">
                    Empieza ahora <span className="school-card-cta-arrow">→</span>
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
