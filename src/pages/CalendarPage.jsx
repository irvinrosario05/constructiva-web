import { useState, useEffect, useRef, useCallback } from 'react'
import NavBar from '../components/NavBar'

// ── Spanish locale ────────────────────────────────────────────────────────────
const ES_MONTHS = ['enero','febrero','marzo','abril','mayo','junio','julio',
  'agosto','septiembre','octubre','noviembre','diciembre']
const ES_DAYS_SHORT = ['lun','mar','mié','jue','vie','sáb','dom']

function monthTitle(d) {
  const m = ES_MONTHS[d.getMonth()]
  return m.charAt(0).toUpperCase() + m.slice(1) + ' ' + d.getFullYear()
}

function formatDateFull(dateStr) {
  const [y, mo, dd] = dateStr.split('-').map(Number)
  return `${dd} de ${ES_MONTHS[mo - 1]} de ${y}`
}

function formatTime(time, durationMin) {
  const [hh, mm] = time.split(':').map(Number)
  const suffix = hh >= 12 ? 'PM' : 'AM'
  const h12 = hh > 12 ? hh - 12 : hh === 0 ? 12 : hh
  const timeStr = `${h12}:${String(mm).padStart(2, '0')} ${suffix}`
  const durH = Math.floor(durationMin / 60)
  const durM = durationMin % 60
  const durStr = durM === 0 ? `${durH}h` : `${durH}h ${durM}m`
  return `${timeStr} · ${durStr}`
}

function formatEventMeta(event) {
  const [, mo, d] = event.date.split('-').map(Number)
  const dateShort = `${d} ${ES_MONTHS[mo - 1].slice(0, 3)}`
  return `${dateShort} · ${formatTime(event.time, event.durationMin)} · ${event.modality} · ${event.level}`
}

// ── Month grid (Monday-first) ─────────────────────────────────────────────────
function getMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1)
  const lastDay  = new Date(year, month + 1, 0)
  const startDow = (firstDay.getDay() + 6) % 7            // 0=Mon
  const totalCells = Math.ceil((startDow + lastDay.getDate()) / 7) * 7
  const days = []
  const cur  = new Date(firstDay)
  cur.setDate(1 - startDow)
  for (let i = 0; i < totalCells; i++) {
    days.push(new Date(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return days
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth()    === b.getMonth()    &&
         a.getDate()     === b.getDate()
}

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ── Event data ────────────────────────────────────────────────────────────────
const EVENTS = [
  {
    id: 'mc-ia-dp-2026-04',
    type: 'masterclass',
    title: 'IA en dirección de proyectos',
    date: '2026-04-12',
    time: '19:00',
    durationMin: 120,
    modality: 'En vivo',
    level: 'Inicial',
    price: 'Gratis',
    instructor: { name: 'Por anunciar', role: 'Director de Proyectos' },
    description: 'Una sesión de 2 horas donde verás cómo se está usando IA hoy en obras reales: estimación, planificación, control y reportería.',
  },
  {
    id: 'mc-ing-pm-2026-04',
    type: 'masterclass',
    title: 'De ingeniero/arquitecto a Project Manager',
    date: '2026-04-26',
    time: '19:00',
    durationMin: 120,
    modality: 'En vivo',
    level: 'Inicial',
    price: 'Gratis',
    instructor: { name: 'Por anunciar', role: 'PMP, Director de Proyectos' },
    description: 'Si eres ingeniero o arquitecto y quieres dar el salto a la gestión, esta masterclass te muestra el camino real, no la versión de LinkedIn.',
  },
  {
    id: 'curso-revit-arq-2026-05',
    type: 'curso',
    title: 'Revit Arquitectura',
    date: '2026-05-05',
    time: '19:00',
    durationMin: 1440,
    modality: 'Grabado + Sesiones en vivo',
    level: 'Intermedio',
    price: 'RD$ 4.500',
    instructor: { name: 'Por anunciar', role: 'Arquitecto BIM' },
    description: 'Domina Revit para arquitectura desde fundamentos hasta documentación profesional. 6 semanas, 24 horas de contenido.',
  },
  {
    id: 'curso-dp-2026-05',
    type: 'curso',
    title: 'Dirección de proyectos de construcción',
    date: '2026-05-12',
    time: '19:00',
    durationMin: 2400,
    modality: 'Híbrido',
    level: 'Intermedio',
    price: 'RD$ 7.500',
    instructor: { name: 'Por anunciar', role: 'PMP, MSc Project Management' },
    description: 'Programa de 40 horas que cubre el ciclo completo de un proyecto de construcción, de la planificación al cierre.',
  },
  {
    id: 'curso-excel-ia-2026-05',
    type: 'curso',
    title: 'Excel + IA para ingenieros',
    date: '2026-05-19',
    time: '19:00',
    durationMin: 720,
    modality: 'Grabado',
    level: 'Intermedio',
    price: 'RD$ 3.200',
    instructor: { name: 'Por anunciar', role: 'Ing. Civil, Especialista en automatización' },
    description: 'Aprende a usar Excel a un nivel profesional aumentado con IA. Fórmulas, automatización con Copilot, dashboards y análisis predictivo aplicado a obras.',
  },
  {
    id: 'curso-revit-est-2026-06',
    type: 'curso',
    title: 'Revit Estructuras',
    date: '2026-06-02',
    time: '19:00',
    durationMin: 1200,
    modality: 'Grabado + Sesiones en vivo',
    level: 'Avanzado',
    price: 'RD$ 4.500',
    instructor: { name: 'Por anunciar', role: 'Ing. Estructural BIM' },
    description: 'Modelado de estructuras de hormigón y acero en Revit. Detallado, cuantificación y coordinación con arquitectura.',
  },
  {
    id: 'taller-presupuestos-2026-04',
    type: 'taller',
    title: 'Taller: Presupuestos en construcción con IA',
    date: '2026-04-19',
    time: '10:00',
    durationMin: 240,
    modality: 'En vivo',
    level: 'Intermedio',
    price: 'RD$ 1.500',
    instructor: { name: 'Por anunciar', role: 'Ing. Costos' },
    description: 'Taller práctico de 4 horas para armar presupuestos asistidos con IA.',
  },
  {
    id: 'mc-bim-coordinacion-2026-05',
    type: 'masterclass',
    title: 'Coordinación BIM: del modelo a la obra',
    date: '2026-05-24',
    time: '19:00',
    durationMin: 120,
    modality: 'En vivo',
    level: 'Inicial',
    price: 'Gratis',
    instructor: { name: 'Por anunciar', role: 'BIM Manager' },
    description: 'Cómo se coordina realmente un proyecto BIM entre disciplinas. Casos reales.',
  },
]

const TYPE_LABEL = { masterclass: 'Masterclass', curso: 'Curso', programa: 'Programa', taller: 'Taller' }

// ── Filter logic ──────────────────────────────────────────────────────────────
function filterEvents(events, activeFilters) {
  const typeKeys   = ['masterclass', 'curso', 'programa', 'taller']
  const activeTypes = typeKeys.filter(f => activeFilters.has(f))
  const isTodos    = activeFilters.has('todos') || activeTypes.length === 0
  const isGratis   = activeFilters.has('gratis')
  return events.filter(e => {
    const typeMatch  = isTodos || activeTypes.includes(e.type)
    const priceMatch = !isGratis || e.price === 'Gratis'
    return typeMatch && priceMatch
  })
}

// ── EventChip ─────────────────────────────────────────────────────────────────
function EventChip({ event, onOpen, overflow, overflowCount }) {
  if (overflow) {
    return <span className="cal-chip cal-chip--more">+{overflowCount} más</span>
  }
  return (
    <button
      className={`cal-chip cal-chip--${event.type}`}
      onClick={e => { e.stopPropagation(); onOpen(event.id) }}
      aria-label={`Abrir detalles de ${event.title}`}
    >
      {event.title}
    </button>
  )
}

// ── DayCell ───────────────────────────────────────────────────────────────────
function DayCell({ date, events, currentMonth, isToday, onOpen }) {
  const inMonth = date.getMonth() === currentMonth.getMonth()
  const day     = date.getDate()
  const label   = `${day} de ${ES_MONTHS[date.getMonth()]}${events.length > 0 ? `, ${events.length} evento${events.length !== 1 ? 's' : ''}` : ''}`

  const maxVisible = events.length > 3 ? 2 : events.length
  const visible    = events.slice(0, maxVisible)
  const overflow   = events.length > 3 ? events.length - 2 : 0

  return (
    <div
      className={[
        'cal-cell',
        !inMonth   ? 'cal-cell--other'      : '',
        isToday    ? 'cal-cell--today'      : '',
        events.length > 0 ? 'cal-cell--has-events' : '',
      ].join(' ')}
      aria-label={label}
    >
      <span className="cal-cell-num">{day}</span>
      <div className="cal-cell-events">
        {visible.map(ev => <EventChip key={ev.id} event={ev} onOpen={onOpen} />)}
        {overflow > 0 && <EventChip overflow overflowCount={overflow} onOpen={onOpen} />}
      </div>
    </div>
  )
}

// ── CalendarGrid ──────────────────────────────────────────────────────────────
function CalendarGrid({ currentMonth, events, onOpen }) {
  const days  = getMonthGrid(currentMonth.getFullYear(), currentMonth.getMonth())
  const today = new Date()
  const byDate = {}
  events.forEach(ev => { byDate[ev.date] = [...(byDate[ev.date] || []), ev] })

  return (
    <div className="cal-grid-wrap">
      <div className="cal-dow-header" aria-hidden="true">
        {ES_DAYS_SHORT.map(d => <div key={d} className="cal-dow-cell">{d}</div>)}
      </div>
      <div className="cal-grid">
        {days.map(day => {
          const ds = toDateStr(day)
          return (
            <DayCell
              key={ds}
              date={day}
              events={byDate[ds] || []}
              currentMonth={currentMonth}
              isToday={isSameDay(day, today)}
              onOpen={onOpen}
            />
          )
        })}
      </div>
    </div>
  )
}

// ── List view ─────────────────────────────────────────────────────────────────
function ListRow({ event, onOpen }) {
  const [, mo, d] = event.date.split('-').map(Number)
  return (
    <div
      className="cal-list-row"
      role="button"
      tabIndex={0}
      onClick={() => onOpen(event.id)}
      onKeyDown={e => e.key === 'Enter' && onOpen(event.id)}
      aria-label={`Ver detalles de ${event.title}`}
    >
      <div className="cal-list-date">
        <span className="cal-list-date-day">{d}</span>
        <span className="cal-list-date-month">{ES_MONTHS[mo - 1].slice(0, 3)}</span>
      </div>
      <div className="cal-list-body">
        <span className={`cal-badge cal-badge--${event.type}`}>{TYPE_LABEL[event.type]}</span>
        <h4 className="cal-list-title">{event.title}</h4>
        <p className="cal-list-meta">{formatEventMeta(event)}</p>
      </div>
      <div className="cal-list-right">
        <span className={event.price === 'Gratis' ? 'cal-price--free' : 'cal-price--paid'}>
          {event.price}
        </span>
        <button
          className="cal-btn-secondary"
          onClick={e => { e.stopPropagation(); onOpen(event.id) }}
        >
          {event.price === 'Gratis' ? 'Inscribirme' : 'Ver detalles'}
        </button>
      </div>
    </div>
  )
}

function ListView({ events, onOpen }) {
  const groups = {}
  events.forEach(ev => {
    const [y, mo] = ev.date.split('-').map(Number)
    const key = `${y}-${String(mo).padStart(2, '0')}`
    if (!groups[key]) {
      const m = ES_MONTHS[mo - 1]
      groups[key] = { label: m.charAt(0).toUpperCase() + m.slice(1) + ' ' + y, events: [] }
    }
    groups[key].events.push(ev)
  })
  const keys = Object.keys(groups).sort()

  if (keys.length === 0) {
    return <div className="cal-list-empty"><p>No hay eventos con los filtros seleccionados.</p></div>
  }

  return (
    <div className="cal-list-wrap">
      {keys.map(k => (
        <div key={k} className="cal-list-group">
          <div className="cal-list-month-header">{groups[k].label}</div>
          {groups[k].events.map(ev => <ListRow key={ev.id} event={ev} onOpen={onOpen} />)}
        </div>
      ))}
    </div>
  )
}

// ── Detail panel ──────────────────────────────────────────────────────────────
function MetaRow({ label, value }) {
  return (
    <div className="cal-panel-meta-row">
      <span className="cal-panel-meta-label">{label}</span>
      <span className="cal-panel-meta-value">{value}</span>
    </div>
  )
}

function EventPanel({ event, onClose }) {
  const closeBtnRef = useRef(null)

  useEffect(() => {
    closeBtnRef.current?.focus()
    const onKey = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  return (
    <>
      <div className="cal-panel-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        className="cal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cal-panel-title"
      >
        <button ref={closeBtnRef} className="cal-panel-close" onClick={onClose} aria-label="Cerrar">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        <div className="cal-panel-content">
          <span className={`cal-badge cal-badge--${event.type}`}>{TYPE_LABEL[event.type]}</span>
          <h2 id="cal-panel-title" className="cal-panel-title">{event.title}</h2>

          <div className="cal-panel-meta">
            <MetaRow label="Fecha"     value={formatDateFull(event.date)} />
            <MetaRow label="Hora"      value={formatTime(event.time, event.durationMin)} />
            <MetaRow label="Modalidad" value={event.modality} />
            <MetaRow label="Nivel"     value={event.level} />
          </div>

          <div className="cal-panel-section">
            <span className="cal-panel-section-label">Sobre este evento</span>
            <p className="cal-panel-desc">{event.description}</p>
          </div>

          {event.instructor && (
            <div className="cal-panel-section">
              <span className="cal-panel-section-label">Instructor</span>
              <div className="cal-panel-instructor">
                <div className="cal-panel-avatar" aria-hidden="true">
                  {event.instructor.name.charAt(0)}
                </div>
                <div>
                  <div className="cal-panel-instructor-name">{event.instructor.name}</div>
                  <div className="cal-panel-instructor-role">{event.instructor.role}</div>
                </div>
              </div>
            </div>
          )}

          <div className="cal-panel-section">
            <span className="cal-panel-section-label">Precio</span>
            <span className={`cal-panel-price${event.price === 'Gratis' ? ' cal-panel-price--free' : ''}`}>
              {event.price}
            </span>
          </div>

          <div className="cal-panel-actions">
            <button className="cta cta-primary cal-panel-cta">
              {event.price === 'Gratis' ? 'Inscribirme gratis' : 'Reservar mi lugar'}
            </button>
            <a href="#" className="cal-panel-link">Ver página completa del curso</a>
          </div>
        </div>
      </div>
    </>
  )
}

// ── CalendarPage ──────────────────────────────────────────────────────────────
const FILTER_PILLS = [
  { id: 'todos',      label: 'Todos'       },
  { id: 'masterclass',label: 'Masterclass' },
  { id: 'curso',      label: 'Cursos'      },
  { id: 'programa',   label: 'Programas'   },
  { id: 'taller',     label: 'Talleres'    },
  { id: 'gratis',     label: 'Gratis'      },
]

export default function CalendarPage({ onBack, onLogin, onEmpresas }) {
  const [viewMode, setViewMode] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'list' : 'month'
  )
  const [currentMonth, setCurrentMonth] = useState(() => {
    const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), 1)
  })
  const [activeFilters, setActiveFilters] = useState(() => new Set(['todos']))
  const [selectedId, setSelectedId]       = useState(null)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const handler = e => { if (e.matches) setViewMode('list') }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const toggleFilter = useCallback(id => {
    setActiveFilters(prev => {
      const next = new Set(prev)
      if (id === 'todos') return new Set(['todos'])
      next.delete('todos')
      if (next.has(id)) {
        next.delete(id)
        if (next.size === 0 || (next.size === 1 && next.has('gratis'))) next.add('todos')
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const prevMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  const nextMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  const goToday   = () => { const t = new Date(); setCurrentMonth(new Date(t.getFullYear(), t.getMonth(), 1)) }

  const filtered      = filterEvents(EVENTS, activeFilters)
  const selectedEvent = EVENTS.find(e => e.id === selectedId) || null

  return (
    <div className="cal-page">
      <NavBar topOffset="16px" onLogin={onLogin} onEmpresas={onEmpresas} onCalendar={() => {}} onHome={onBack} />

      {/* Page hero */}
      <header className="cal-hero">
        <div className="cal-container">
          <button className="cal-back" onClick={onBack}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Constructiva
          </button>
          <span className="cal-eyebrow">AGENDA CONSTRUCTIVA</span>
          <h1 className="cal-h1">Construye tu futuro, hoy.</h1>
          <p className="cal-sub">
            Todos los eventos, masterclass y programas que arrancan en los próximos meses.
            Inscríbete a los que te interesen.
          </p>
        </div>
      </header>

      {/* Sticky filter bar */}
      <div className="cal-filter-bar">
        <div className="cal-container cal-filter-inner">
          <div className="cal-filters" role="group" aria-label="Filtros">
            {FILTER_PILLS.map(f => (
              <button
                key={f.id}
                className={`cal-filter-pill${activeFilters.has(f.id) ? ' is-active' : ''}`}
                onClick={() => toggleFilter(f.id)}
                aria-pressed={activeFilters.has(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="cal-view-toggle" role="group" aria-label="Modo de vista">
            <button className={`cal-view-btn${viewMode === 'month' ? ' is-active' : ''}`} onClick={() => setViewMode('month')}>Mes</button>
            <button className={`cal-view-btn${viewMode === 'list'  ? ' is-active' : ''}`} onClick={() => setViewMode('list') }>Lista</button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="cal-main">
        <div className="cal-container">
          {viewMode === 'month' && (
            <>
              <div className="cal-month-header">
                <h2 className="cal-month-title">{monthTitle(currentMonth)}</h2>
                <div className="cal-month-nav">
                  <button className="cal-nav-btn" onClick={prevMonth} aria-label="Mes anterior">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M8 3L4 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button className="cal-nav-btn" onClick={nextMonth} aria-label="Mes siguiente">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M6 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button className="cal-today-btn" onClick={goToday}>Hoy</button>
                </div>
              </div>
              <CalendarGrid currentMonth={currentMonth} events={filtered} onOpen={setSelectedId} />
            </>
          )}
          {viewMode === 'list' && <ListView events={filtered} onOpen={setSelectedId} />}
        </div>
      </main>

      {selectedId && <EventPanel event={selectedEvent} onClose={() => setSelectedId(null)} />}
    </div>
  )
}
