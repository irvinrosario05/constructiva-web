import { useState, useEffect, useRef } from 'react'

const SCHOOLS_DATA = [
  {
    id: 'bim',
    title: 'Escuela BIM',
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
    gradient: 'linear-gradient(145deg, #1C1208, #3D2A10)',
    description: 'Aprende cómo se construye y se lidera en el campo — desde la planificación hasta la ejecución de cada proyecto.',
    courses: [
      { name: 'Cubicaciones de obra', duration: '6 h' },
      { name: 'Presupuestos de obras intermedio', duration: '18 h' },
      { name: 'Excel para ingenieros y arquitectos', duration: '10 h' },
    ],
  },
]

function useInView(threshold = 0.3) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) { setInView(true); obs.disconnect() } }) },
      { threshold }
    )
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, inView]
}

function SchoolsHeader() {
  const [ref, inView] = useInView(0.3)
  const headlineWords = 'Descubre las escuelas dentro de Constructiva'.split(' ')
  return (
    <div ref={ref} className="schools-header">
      <div className={`schools-eyebrow ${inView ? 'is-in' : ''}`}>Learn. Apply. Lead.</div>
      <h2 className="schools-headline">
        {headlineWords.map((w, i) => (
          <span
            key={`${w}-${i}`}
            className={`schools-headword ${inView ? 'is-in' : ''}`}
            style={{ transitionDelay: `${120 + i * 60}ms` }}
          >
            {w}{i < headlineWords.length - 1 ? ' ' : ''}
          </span>
        ))}
      </h2>
    </div>
  )
}

function SchoolCard({ school, hoveredId, setHoveredId, isLast }) {
  const isHovered = hoveredId === school.id
  const anyHovered = hoveredId !== null
  const isDimmed = anyHovered && !isHovered

  return (
    <div
      className={`school-card ${isHovered ? 'is-hovered' : ''} ${isDimmed ? 'is-dimmed' : ''}`}
      onMouseEnter={() => setHoveredId(school.id)}
      onMouseLeave={() => setHoveredId(null)}
    >
      <div className="school-card-bg" style={{ backgroundImage: school.gradient }} />
      <div className="school-card-overlay" />
      <div className="school-card-title-default">{school.title}</div>
      <div className="school-card-expanded">
        <h3 className="school-card-title-expanded">{school.title}</h3>
        <p className="school-card-desc">{school.description}</p>
        <div className="school-card-courses-label">Cursos disponibles</div>
        <ul className="school-card-courses">
          {school.courses.map((c, i) => (
            <li key={i} className="school-card-course">
              <span className="school-card-course-name">{c.name}</span>
              <span className="school-card-course-duration">{c.duration}</span>
            </li>
          ))}
        </ul>
        <button className="school-card-cta">Empieza ahora</button>
      </div>
      {!isLast && <div className="school-card-divider" />}
    </div>
  )
}

export default function SchoolsSection() {
  const sectionRef = useRef(null)
  const [scrollActiveId, setScrollActiveId] = useState(null)
  const [hoverActiveId, setHoverActiveId] = useState(null)
  const [entering, setEntering] = useState(false)

  // Scroll-driven: auto-advance active card as user scrolls through section
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    let raf = 0, stopped = false

    const tick = () => {
      if (stopped) return
      const rect = section.getBoundingClientRect()
      const vh = window.innerHeight
      const sectionH = section.offsetHeight
      const total = sectionH - vh

      if (rect.top > vh || rect.bottom < 0) {
        setScrollActiveId(null)
        raf = requestAnimationFrame(tick)
        return
      }

      const scrolled = -rect.top
      const p = total > 0 ? Math.max(0, Math.min(1, scrolled / total)) : 0
      // Map 0→1 to card index (4 cards = 0-0.25, 0.25-0.5, 0.5-0.75, 0.75-1)
      const idx = Math.min(Math.floor(p * SCHOOLS_DATA.length), SCHOOLS_DATA.length - 1)
      setScrollActiveId(SCHOOLS_DATA[idx].id)
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => { stopped = true; if (raf) cancelAnimationFrame(raf) }
  }, [])

  // Cinematic entrance when section first appears
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) { setEntering(true); obs.disconnect() }
      },
      { threshold: 0.05 }
    )
    if (sectionRef.current) obs.observe(sectionRef.current)
    return () => obs.disconnect()
  }, [])

  // Hover overrides scroll-driven focus
  const activeId = hoverActiveId ?? scrollActiveId

  return (
    <section
      ref={sectionRef}
      className={`schools-section${entering ? ' section-entering' : ''}`}
    >
      <SchoolsHeader />
      <div
        className="schools-cards"
        onMouseLeave={() => setHoverActiveId(null)}
      >
        {SCHOOLS_DATA.map((school, i) => (
          <SchoolCard
            key={school.id}
            school={school}
            hoveredId={activeId}
            setHoveredId={setHoverActiveId}
            isLast={i === SCHOOLS_DATA.length - 1}
          />
        ))}
      </div>
    </section>
  )
}
