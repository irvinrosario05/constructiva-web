import { useState, useEffect, useRef } from 'react'
import ParticleCanvas from '../components/ParticleCanvas'

// ─── useInView (fires once) ───────────────────────────────────────────────────
function useInView() {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); io.disconnect() }
    }, { rootMargin: '-80px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return [ref, inView]
}

// ─── Counter ──────────────────────────────────────────────────────────────────
function useCounter(target, active) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!active) return
    let start = null
    const step = ts => {
      if (!start) start = ts
      const p = Math.min((ts - start) / 2200, 1)
      setVal(Math.round((1 - Math.pow(1 - p, 4)) * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [active, target])
  return val
}

// ─── EMPRESAS HERO (spec v1) ─────────────────────────────────────────────────
function EmpresasHero() {
  const [formState, setFormState] = useState('default') // 'default'|'loading'|'success'|'error'
  const [fields, setFields] = useState({
    nombre: '', empresa: '', email: '', tamano: '', necesidades: ''
  })
  const timerRef = useRef(null)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const set = key => e => setFields(prev => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = e => {
    e.preventDefault()
    setFormState('loading')
    console.log('Empresas form:', fields)
    timerRef.current = setTimeout(() => setFormState('success'), 1500)
  }

  return (
    <section className="eh-section" aria-labelledby="eh-headline">
      <div className="eh-inner">

        {/* ── Columna izquierda: copy ── */}
        <div className="eh-copy">
          <span className="eh-eyebrow-badge">Para empresas</span>
          <h1 id="eh-headline" className="eh-h1">
            Tu equipo técnico,<br />
            al nivel que la industria exige.
          </h1>
          <p className="eh-sub">
            Capacitamos ingenieros y arquitectos en las herramientas
            y habilidades que los proyectos de hoy requieren.
            Tú defines el equipo, nosotros diseñamos el plan.
          </p>
          <ul className="eh-bullets" aria-label="Qué incluye">
            {[
              'BIM · Revit · Ms Project · IA aplicada',
              'Workshops en vivo + cursos grabados',
              'Seguimiento de progreso por empleado',
              'Certificados con validez profesional',
            ].map(item => (
              <li key={item} className="eh-bullet">
                <span className="eh-bullet-check" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8.5L6.5 12L13 5" stroke="currentColor" strokeWidth="1.75"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* ── Columna derecha: form card ── */}
        <div className="eh-form-wrap">
          <div className="eh-form-card">
            {formState === 'success' ? (

              <div className="eh-success" role="status">
                <div className="eh-success-icon" aria-hidden="true">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path d="M6 14.5L11.5 20L22 9" stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="eh-success-title">¡Listo! Te contactamos pronto.</h3>
                <p className="eh-success-sub">Revisa tu correo para confirmar.</p>
              </div>

            ) : (

              <form id="empresas-form" onSubmit={handleSubmit} noValidate>
                <h2 className="eh-form-title">Diseñamos el plan para tu empresa</h2>
                <p className="eh-form-caption">Sin compromiso. Te contactamos en menos de 24 h.</p>

                <div className="eh-field">
                  <label className="eh-label" htmlFor="eh-nombre">Nombre completo</label>
                  <input id="eh-nombre" className="eh-input" type="text"
                    value={fields.nombre} onChange={set('nombre')}
                    placeholder="Juan García" required disabled={formState === 'loading'} />
                </div>

                <div className="eh-field">
                  <label className="eh-label" htmlFor="eh-empresa">Empresa</label>
                  <input id="eh-empresa" className="eh-input" type="text"
                    value={fields.empresa} onChange={set('empresa')}
                    placeholder="Constructora Ejemplo S.A." required disabled={formState === 'loading'} />
                </div>

                <div className="eh-field">
                  <label className="eh-label" htmlFor="eh-email">Correo corporativo</label>
                  <input id="eh-email" className="eh-input" type="email"
                    value={fields.email} onChange={set('email')}
                    placeholder="juan@empresa.com" required disabled={formState === 'loading'} />
                </div>

                <div className="eh-field">
                  <label className="eh-label" htmlFor="eh-tamano">Tamaño del equipo</label>
                  <select id="eh-tamano" className="eh-input eh-select"
                    value={fields.tamano} onChange={set('tamano')}
                    required disabled={formState === 'loading'}>
                    <option value="">Selecciona un rango</option>
                    <option value="1-5">1–5 personas</option>
                    <option value="6-20">6–20 personas</option>
                    <option value="21-50">21–50 personas</option>
                    <option value="50+">Más de 50</option>
                  </select>
                </div>

                <div className="eh-field">
                  <label className="eh-label" htmlFor="eh-necesidades">
                    ¿Qué necesitan aprender?
                    <span className="eh-label-opt"> (opcional)</span>
                  </label>
                  <textarea id="eh-necesidades" className="eh-input eh-textarea"
                    rows={3} value={fields.necesidades} onChange={set('necesidades')}
                    placeholder="Ej: Revit para modelado, gestión de obra, BIM…"
                    disabled={formState === 'loading'} />
                </div>

                {formState === 'error' && (
                  <div className="eh-error" role="alert">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.5"
                        strokeLinecap="round" />
                    </svg>
                    Algo salió mal. Intenta de nuevo.
                  </div>
                )}

                <button type="submit" className="cta cta-primary eh-submit"
                  disabled={formState === 'loading'} aria-busy={formState === 'loading'}>
                  {formState === 'loading' ? 'Enviando…' : 'Solicitar información'}
                </button>
                <p className="eh-form-note">Respondemos en menos de 24 horas · Sin spam</p>
              </form>

            )}
          </div>
        </div>

      </div>
    </section>
  )
}

// ─── STATS ────────────────────────────────────────────────────────────────────
const STATS_DATA = [
  { n: 500, suffix: '+', label: 'Profesionales formados' },
  { n: 70,  suffix: '%', label: 'Tasa de completación' },
  { n: 4,   suffix: ' escuelas', label: 'especializadas en construcción' },
]

function Stats() {
  const [ref, inView] = useInView()
  const a = useCounter(500, inView)
  const b = useCounter(70,  inView)
  const c = useCounter(4,   inView)
  const vals = [a, b, c]

  return (
    <section ref={ref} className="ep-stats">
      {STATS_DATA.map((s, i) => (
        <div key={i} className={`ep-stat ${inView ? 'ep-stat--in' : ''}`} style={{ transitionDelay: `${i * 120}ms` }}>
          <div className="ep-stat-n">{vals[i]}<span className="ep-stat-sfx">{s.suffix}</span></div>
          <div className="ep-stat-lbl">{s.label}</div>
        </div>
      ))}
    </section>
  )
}

// ─── PROPOSITION ──────────────────────────────────────────────────────────────
const PROPS = [
  {
    num: '01',
    title: 'Formación que cierra brechas reales',
    body: 'Diagnóstico inicial, rutas personalizadas por rol y seguimiento por proyecto. No cursos genéricos: capacitación alineada a los objetivos de tu empresa.',
  },
  {
    num: '02',
    title: 'Contenido creado por expertos de la industria',
    body: 'Cada escuela fue diseñada con profesionales activos en obra, no con académicos. Tus ingenieros aprenden lo que de verdad se usa en proyectos reales.',
  },
  {
    num: '03',
    title: 'Dashboard de empresa con métricas claras',
    body: 'Progreso individual, por área y por proyecto en tiempo real. Reportes automáticos para que RRHH y gerencia tengan visibilidad total del avance.',
  },
]

function Proposition() {
  const [ref, inView] = useInView()
  return (
    <section ref={ref} className="ep-prop" id="ep-how">
      <div className="ep-prop-header">
        <span className="ep-eyebrow">Por qué Constructiva</span>
        <h2 className="ep-prop-h2">
          Formación técnica de élite.<br />Resultados medibles.
        </h2>
      </div>
      <div className="ep-prop-list">
        {PROPS.map((p, i) => (
          <div key={i} className={`ep-prop-item ${inView ? 'ep-prop-item--in' : ''}`} style={{ transitionDelay: `${i * 140}ms` }}>
            <span className="ep-prop-num">{p.num}</span>
            <div className="ep-prop-body">
              <h3 className="ep-prop-title">{p.title}</h3>
              <p className="ep-prop-text">{p.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── ESCUELAS ─────────────────────────────────────────────────────────────────
const SCHOOLS = [
  { label: 'BIM',                 color: '#0D2B2A', courses: 3 },
  { label: 'Gestión de Obras',    color: '#1C1208', courses: 3 },
  { label: 'Transformación Digital', color: '#0A1628', courses: 3 },
  { label: 'Dirección de Proyectos', color: '#1A1A2E', courses: 3 },
]

function Escuelas() {
  const [ref, inView] = useInView()
  return (
    <section ref={ref} className="ep-schools">
      <div className="ep-schools-header">
        <span className="ep-eyebrow">Contenido disponible</span>
        <h2 className="ep-schools-h2">4 escuelas. Un ecosistema completo.</h2>
      </div>
      <div className="ep-schools-grid">
        {SCHOOLS.map((s, i) => (
          <div
            key={i}
            className={`ep-school ${inView ? 'ep-school--in' : ''}`}
            style={{ background: s.color, transitionDelay: `${i * 80}ms` }}
          >
            <span className="ep-school-num">0{i + 1}</span>
            <span className="ep-school-label">{s.label}</span>
            <span className="ep-school-courses">{s.courses} cursos</span>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── CTA / FORM ───────────────────────────────────────────────────────────────
function CTAForm() {
  const [f, setF] = useState({ nombre: '', empresa: '', email: '', tamano: '' })
  const [ok, setOk] = useState(false)
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }))

  return (
    <section className="ep-cta" id="ep-cta">
      <div className="ep-cta-inner">
        <div className="ep-cta-copy">
          <span className="ep-eyebrow" style={{ color: 'var(--aqua)' }}>Empieza hoy</span>
          <h2 className="ep-cta-h2">¿Listo para capacitar<br />a tu equipo?</h2>
          <p className="ep-cta-sub">
            Diseñamos contigo un plan de formación a medida. Sin compromisos — solo resultados.
          </p>
          <ul className="ep-cta-list">
            {['Diagnóstico inicial sin costo', 'Plan a medida en 48 h', 'Soporte dedicado para empresas'].map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="ep-form-card">
          {ok ? (
            <div className="ep-form-ok">
              <div className="ep-form-ok-icon">✓</div>
              <h3>¡Mensaje enviado!</h3>
              <p>Te contactamos en menos de 24 horas hábiles.</p>
            </div>
          ) : (
            <form onSubmit={e => { e.preventDefault(); setOk(true) }}>
              <div className="ep-field">
                <label>Nombre completo</label>
                <input className="ep-input" value={f.nombre} onChange={set('nombre')} placeholder="Juan García" required />
              </div>
              <div className="ep-field">
                <label>Empresa</label>
                <input className="ep-input" value={f.empresa} onChange={set('empresa')} placeholder="Constructora Ejemplo S.A." required />
              </div>
              <div className="ep-field">
                <label>Email corporativo</label>
                <input className="ep-input" type="email" value={f.email} onChange={set('email')} placeholder="juan@empresa.com" required />
              </div>
              <div className="ep-field">
                <label>Tamaño del equipo</label>
                <select className="ep-input ep-sel" value={f.tamano} onChange={set('tamano')} required>
                  <option value="">Selecciona un rango</option>
                  <option>1 – 10 personas</option>
                  <option>11 – 50 personas</option>
                  <option>51 – 200 personas</option>
                  <option>Más de 200 personas</option>
                </select>
              </div>
              <button type="submit" className="cta cta-primary" style={{ width: '100%', marginTop: 8 }}>
                Solicitar demo gratuita
              </button>
              <p className="ep-form-note">Sin spam · Respuesta en menos de 24 h</p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
const BASE = import.meta.env.BASE_URL

export default function EmpresasPage({ onBack }) {
  return (
    <div className="ep-page">
      <nav className="ep-nav">
        <button className="ep-nav-back" onClick={onBack} aria-label="Volver al inicio">
          <img src={`${BASE}logos/Logo_aqua.png`} alt="Constructiva" className="ep-nav-logo" />
        </button>
        <span className="ep-nav-brand">Empresas</span>
        <a href="#ep-cta" className="cta cta-primary" style={{ padding: '9px 22px', fontSize: 14 }}>
          Solicitar demo
        </a>
      </nav>

      <EmpresasHero />
      <Stats />
      <Proposition />
      <Escuelas />
      <CTAForm />

      <footer className="ep-footer">
        <span>© 2025 Constructiva</span>
        <button onClick={onBack} className="ep-footer-back">← Volver al inicio</button>
      </footer>
    </div>
  )
}
