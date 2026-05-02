import { useState, useEffect, useRef, useMemo } from 'react'
import MethodologySection from './MethodologySection'

/* ── Intersection-based in-view (fires once) ── */
function useInView(threshold = 0.2, once = true) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    let raf = 0, stopped = false
    const check = () => {
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight || document.documentElement.clientHeight
      return r.top < vh - 40 && r.bottom > 40
    }
    const tick = () => {
      if (stopped) return
      if (check()) {
        setInView(true)
        if (once) { stopped = true; return }
      } else if (!once) { setInView(false) }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { stopped = true; if (raf) cancelAnimationFrame(raf) }
  }, [threshold, once])
  return [ref, inView]
}

/* ── Scroll progress through element (0 → 1) ── */
function useScrollProgress(ref) {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    let raf = 0, stopped = false
    const tick = () => {
      if (stopped) return
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      const total = el.offsetHeight - vh
      const scrolled = -r.top
      const p = total > 0 ? Math.max(0, Math.min(1, scrolled / total)) : 0
      setProgress(p)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { stopped = true; if (raf) cancelAnimationFrame(raf) }
  }, [])
  return progress
}

/* ── Cinematic parallax (more aggressive than original) ── */
function useParallaxY(factor = 0.28, range = 120) {
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    let raf = 0, stopped = false
    const tick = () => {
      if (stopped) return
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight || document.documentElement.clientHeight
      const elH = r.height || 1
      const total = vh + elH
      const passed = vh - r.top
      const p = Math.max(0, Math.min(1, passed / total))
      const offset = (p - 0.5) * 2 * range * factor
      el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { stopped = true; if (raf) cancelAnimationFrame(raf) }
  }, [factor, range])
  return ref
}

/* ── Cinematic section entrance hook ── */
function useSectionEnter() {
  const ref = useRef(null)
  const [entered, setEntered] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) { setEntered(true); obs.disconnect() } },
      { threshold: 0.05 }
    )
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, entered]
}

function SectionDivider() {
  return <div className="section-divider" aria-hidden="true" />
}

function WordFade({ text, start, baseDelay = 0, perWord = 30, className = '' }) {
  const words = useMemo(() => text.split(' '), [text])
  return (
    <span className={className}>
      {words.map((w, i) => (
        <span key={i} className={`v2-wfade ${start ? 'is-in' : ''}`} style={{ transitionDelay: `${baseDelay + i * perWord}ms` }}>
          {w}{i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </span>
  )
}

function CountUp({ target, start, duration = 400 }) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!start) return
    const t0 = performance.now()
    let raf = 0
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / duration)
      setV(Math.round((1 - Math.pow(1 - t, 3)) * target))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [start, target, duration])
  return <span>{String(v).padStart(2, '0')}</span>
}

/* ════════════════════════════════════════════
   SECTION 4 — PROFESORES
   ════════════════════════════════════════════ */
const TEACHERS = [
  { name: 'Ing. Carlos Méndez',  role: 'Director de Proyectos, 15 años exp.',  spec: 'BIM · Revit · Gestión',        photoBg: 'linear-gradient(145deg, #1F1F1F, #2E2E2E)', initial: 'CM' },
  { name: 'Arq. María Santos',   role: 'Especialista en Diseño Sostenible',    spec: 'Renders · IA · Diseño',        photoBg: 'linear-gradient(145deg, #1A2628, #2A3D40)', initial: 'MS' },
  { name: 'Ing. Roberto Acosta', role: 'Gerente de Construcción',              spec: 'Presupuestos · Lean · Obras',  photoBg: 'linear-gradient(145deg, #261A1A, #3D2A2A)', initial: 'RA' },
  { name: 'Arq. Laura Guzmán',   role: 'Consultora en Transformación Digital', spec: 'IA · Automatización · BIM',    photoBg: 'linear-gradient(145deg, #1F1A26, #2D2840)', initial: 'LG' },
]

function TypewriterWord({ word, start, speed = 70 }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start || count >= word.length) return
    const t = setTimeout(() => setCount((c) => c + 1), speed)
    return () => clearTimeout(t)
  }, [start, count, word.length, speed])
  return (
    <span className="v2-tw-word">
      {word.slice(0, count).split('').map((ch, i) => <span key={i} className="v2-tw-letter">{ch}</span>)}
    </span>
  )
}

function TeachersSection() {
  const [sectionEnterRef, entered] = useSectionEnter()
  const [headRef, headIn] = useInView(0.35)
  const [gridRef, gridIn] = useInView(0.1)
  const parallaxRef = useParallaxY(0.28, 120)

  const setHeadAndParallax = (node) => {
    headRef.current = node
    parallaxRef.current = node
  }

  return (
    <section
      ref={sectionEnterRef}
      className={`m-section v2-teachers${entered ? ' section-entering' : ''}`}
    >
      <div className="m-container m-container-wide">
        <div ref={setHeadAndParallax} className={`v2-teachers-header v2-parallax ${headIn ? 'is-in' : ''}`}>
          <h2 className="v2-teachers-headline">
            <span className="v2-clip-reveal v2-teachers-h-light">Aprende de quienes</span>
            <br />
            <span className="v2-teachers-h-italic"><TypewriterWord word="construyen" start={headIn} /></span>
          </h2>
        </div>
        <div ref={gridRef} className="v2-teachers-grid">
          {TEACHERS.map((t, i) => (
            <div
              key={t.name}
              className={`v2-teacher ${gridIn ? 'is-in' : ''}`}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <div className="v2-teacher-photo-wrap">
                <div className="v2-teacher-photo" style={{ background: t.photoBg }}>
                  <span className="v2-teacher-initial">{t.initial}</span>
                </div>
                <div className="v2-teacher-overlay" />
                <div className="v2-teacher-info">
                  <div className="v2-teacher-name">{t.name}</div>
                  <div className="v2-teacher-role">{t.role}</div>
                  <div className="v2-teacher-spec">{t.spec}</div>
                </div>
              </div>
              <div className="v2-teacher-rule" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════
   SECTION 5 — COMUNIDAD
   ════════════════════════════════════════════ */
function IconChat() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <path d="M6 10C6 8.34 7.34 7 9 7h16c1.66 0 3 1.34 3 3v10c0 1.66-1.34 3-3 3h-7l-5 4v-4H9c-1.66 0-3-1.34-3-3V10z" stroke="#248D84" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="13" cy="15" r="1" fill="#248D84" />
      <circle cx="17" cy="15" r="1" fill="#248D84" />
      <circle cx="21" cy="15" r="1" fill="#248D84" />
    </svg>
  )
}
function IconCalendar() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <rect x="5" y="8" width="24" height="22" rx="3" stroke="#248D84" strokeWidth="1.5" />
      <path d="M5 14h24" stroke="#248D84" strokeWidth="1.5" />
      <path d="M11 4v6M23 4v6" stroke="#248D84" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="11" y="19" width="4" height="4" rx="1" fill="#248D84" />
    </svg>
  )
}
function IconWhats() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <path d="M17 4C9.82 4 4 9.82 4 17c0 2.3.6 4.45 1.65 6.32L4 30l6.85-1.6A12.92 12.92 0 0 0 17 30c7.18 0 13-5.82 13-13S24.18 4 17 4z" stroke="#248D84" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 12c.5-.3 1.2-.3 1.6.3l1 1.6c.3.4.2 1-.2 1.4l-.6.6c.7 1.5 2 2.7 3.5 3.4l.6-.6c.4-.4 1-.5 1.4-.2l1.6 1c.6.4.7 1.2.3 1.7-.7 1.3-2.2 1.8-3.7 1.5-2.6-.5-4.9-2.8-5.4-5.4-.3-1.5.2-3 1.5-3.7z" fill="#248D84" />
    </svg>
  )
}

const COMMUNITY_CARDS = [
  { icon: <IconChat />,     title: 'Foro',           desc: 'Comparte conocimiento, resuelve dudas y conecta con colegas de toda LATAM.',          cta: 'Entrar al foro' },
  { icon: <IconCalendar />, title: 'Eventos',        desc: 'Workshops en vivo, meetups y conferencias con expertos de la industria.',               cta: 'Ver calendario' },
  { icon: <IconWhats />,    title: 'Grupo WhatsApp', desc: 'Acceso directo a la comunidad. Networking, oportunidades y recursos en tiempo real.',    cta: 'Unirse al grupo' },
]

function CommunitySection() {
  const [sectionEnterRef, entered] = useSectionEnter()
  const [headRef, headIn] = useInView(0.25)
  const [gridRef, gridIn] = useInView(0.15)
  const parallaxRef = useParallaxY(0.24, 100)

  const setHeadAndParallax = (node) => {
    headRef.current = node
    parallaxRef.current = node
  }

  return (
    <section
      ref={sectionEnterRef}
      className={`m-section v2-community${entered ? ' section-entering' : ''}`}
    >
      <div className="m-container m-container-narrow-2">
        <div ref={setHeadAndParallax} className={`v2-community-header v2-parallax ${headIn ? 'is-in' : ''}`}>
          <h2 className="v2-community-headline">
            <span className="v2-clip-reveal">
              Únete a la comunidad de profesionales de la construcción y sé parte de la conversación
            </span>
          </h2>
          <div className={`v2-community-sub ${headIn ? 'is-in' : ''}`} style={{ transitionDelay: '600ms' }}>
            Participa de eventos y potencia tu networking
          </div>
        </div>
        <div ref={gridRef} className="community-grid">
          {COMMUNITY_CARDS.map((c, i) => (
            <div
              key={c.title}
              className={`community-card ${gridIn ? 'is-in' : ''}`}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <div className="community-icon">{c.icon}</div>
              <div className="community-title">{c.title}</div>
              <div className="community-desc">{c.desc}</div>
              <a href="#" className="community-cta">{c.cta} <span aria-hidden="true">→</span></a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════
   SECTION 6 — TESTIMONIOS
   ════════════════════════════════════════════ */
const TESTIMONIALS = [
  { text: 'Constructiva cambió mi forma de trabajar. Pasé de hacer presupuestos en Excel a dominar BIM en semanas.', name: 'José Ramírez', role: 'Ingeniero Civil, Santo Domingo' },
  { text: 'La metodología práctica es lo que diferencia a Constructiva. No es teoría vacía, es aplicación real.', name: 'Ana Pérez', role: 'Arquitecta, Santiago' },
  { text: 'Gracias al curso de IA pude automatizar reportes que me tomaban horas. Mi productividad se duplicó.', name: 'Miguel Torres', role: 'Gerente de Proyectos, La Vega' },
  { text: 'La comunidad es increíble. Conocí colegas que ahora son socios en proyectos reales.', name: 'Carmen Díaz', role: 'Arquitecta, Punta Cana' },
  { text: 'El programa Constructiva Experience transformó mi carrera en 5 semanas. Vale cada peso invertido.', name: 'Pedro Almánzar', role: 'Ingeniero Estructural, San Cristóbal' },
]

function TestimonialsSection() {
  const [sectionEnterRef, entered] = useSectionEnter()
  const [headRef, headIn] = useInView(0.25)
  const [stageRef, stageIn] = useInView(0.15, false)
  const [idx, setIdx] = useState(0)
  const [direction, setDirection] = useState(1)
  const [animKey, setAnimKey] = useState(0)
  const [firstSeen, setFirstSeen] = useState(false)
  const parallaxRef = useParallaxY(0.24, 100)

  const setHeadAndParallax = (node) => {
    headRef.current = node
    parallaxRef.current = node
  }

  useEffect(() => { if (stageIn && !firstSeen) setFirstSeen(true) }, [stageIn, firstSeen])

  const goTo = (newIdx, dir) => {
    setDirection(dir)
    setIdx((newIdx + TESTIMONIALS.length) % TESTIMONIALS.length)
    setAnimKey((k) => k + 1)
  }

  useEffect(() => {
    if (!stageIn) return
    const t = setInterval(() => {
      setDirection(1)
      setIdx((i) => (i + 1) % TESTIMONIALS.length)
      setAnimKey((k) => k + 1)
    }, 5000)
    return () => clearInterval(t)
  }, [stageIn])

  const t = TESTIMONIALS[idx]
  const slideClass = animKey === 0 ? 'v2-testi-first' : `v2-dir-${direction > 0 ? 'next' : 'prev'}`

  return (
    <section
      ref={sectionEnterRef}
      className={`m-section v2-testimonials${entered ? ' section-entering' : ''}`}
    >
      <div className="m-container">
        <div ref={setHeadAndParallax} className={`v2-testi-header v2-parallax ${headIn ? 'is-in' : ''}`}>
          <h2 className="v2-testi-headline">
            <span className="v2-clip-reveal">Historias reales de <em className="v2-testi-em">transformación</em></span>
          </h2>
        </div>
        <div ref={stageRef} className="v2-testi-stage">
          <div className="v2-testi-quote-mark" aria-hidden="true">"</div>
          <div key={animKey} className={`v2-testi-slide ${slideClass} ${firstSeen ? 'is-in' : ''}`}>
            <p className="v2-testi-text">{t.text}</p>
            <div className="v2-testi-sep" />
            <div className="v2-testi-name">{t.name}</div>
            <div className="v2-testi-role">{t.role}</div>
          </div>
          <div className="v2-testi-controls">
            <button className="v2-testi-arrow" onClick={() => goTo(idx - 1, -1)} aria-label="Anterior"><span aria-hidden="true">←</span></button>
            <button className="v2-testi-arrow" onClick={() => goTo(idx + 1, 1)} aria-label="Siguiente"><span aria-hidden="true">→</span></button>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════
   SECTION 7 — FAQ
   ════════════════════════════════════════════ */
const FAQS = [
  { q: '¿Necesito experiencia previa para empezar?', a: 'No. Tenemos cursos desde nivel introductorio hasta avanzado. Si recién empiezas, te recomendamos partir por los cursos de fundamentos de cada escuela.' },
  { q: '¿Los cursos son en vivo o grabados?', a: 'Ofrecemos ambos formatos. Los cursos en vivo incluyen clases con expertos en tiempo real, mientras que los grabados los puedes tomar a tu ritmo. Todos los cursos en vivo quedan grabados para revisión posterior.' },
  { q: '¿Recibo certificado al terminar?', a: 'Sí. Al completar cada curso recibes un certificado de Constructiva con tu nombre, las horas cursadas y los temas vistos. El certificado es validable y compartible en LinkedIn.' },
  { q: '¿Cuánto cuestan los cursos?', a: 'Tenemos cursos gratuitos para que conozcas la plataforma, y planes de membresía mensual que te dan acceso al catálogo completo. También vendemos cursos individuales según tu interés.' },
  { q: '¿Puedo cancelar mi membresía cuando quiera?', a: 'Sí. La membresía es mes a mes y puedes cancelar en cualquier momento desde tu panel de usuario. Sin compromisos ni letra pequeña.' },
  { q: '¿Tienen planes para empresas?', a: 'Sí. Diseñamos programas a medida para equipos y empresas constructoras. Contáctanos desde la sección Empresas para una cotización personalizada.' },
]

function FaqItem({ item, isOpen, onToggle }) {
  const contentRef = useRef(null)
  return (
    <div className={`faq-item ${isOpen ? 'is-open' : ''}`}>
      <button className="faq-q" onClick={onToggle} aria-expanded={isOpen}>
        <span className="faq-q-text">{item.q}</span>
        <span className="faq-q-icon" aria-hidden="true" />
      </button>
      <div
        className="faq-a-wrap"
        style={{ maxHeight: isOpen && contentRef.current ? contentRef.current.scrollHeight + 'px' : 0 }}
      >
        <div ref={contentRef} className="faq-a">{item.a}</div>
      </div>
    </div>
  )
}

function FaqSection() {
  const [sectionEnterRef, entered] = useSectionEnter()
  const [headRef, headIn] = useInView(0.25)
  const [openIdx, setOpenIdx] = useState(0)
  const parallaxRef = useParallaxY(0.24, 100)

  const setHeadAndParallax = (node) => {
    headRef.current = node
    parallaxRef.current = node
  }

  return (
    <section
      ref={sectionEnterRef}
      className={`m-section v2-faq${entered ? ' section-entering' : ''}`}
    >
      <div className="m-container m-container-narrow-2">
        <div ref={setHeadAndParallax} className={`v2-faq-header v2-parallax ${headIn ? 'is-in' : ''}`}>
          <h2 className="v2-faq-headline">
            <span className="v2-clip-reveal">Preguntas frecuentes</span>
          </h2>
        </div>
        <div className="faq-list">
          {FAQS.map((item, i) => (
            <FaqItem
              key={i}
              item={item}
              isOpen={openIdx === i}
              onToggle={() => setOpenIdx(openIdx === i ? -1 : i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default function MarketingSections() {
  return (
    <>
      <SectionDivider />
      <MethodologySection />
      <SectionDivider />
      <TeachersSection />
      <SectionDivider />
      <CommunitySection />
      <SectionDivider />
      <TestimonialsSection />
      <SectionDivider />
      <FaqSection />
    </>
  )
}
