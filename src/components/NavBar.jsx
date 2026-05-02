import { useState, useEffect, useRef } from 'react'

const DROPDOWNS = {
  Cursos: {
    items: [
      { label: 'Dirección de Proyectos', href: '#cursos/direccion' },
      { label: 'Inteligencia Artificial', href: '#cursos/ia' },
      { label: 'Transformación Digital', href: '#cursos/transformacion' },
      { label: 'Gestión de Obras', href: '#cursos/gestion' },
      { type: 'separator' },
      { label: 'Ver todos los cursos', href: '#cursos', cta: true },
    ],
  },
  Comunidad: {
    items: [
      { label: 'Foro', href: '#comunidad/foro' },
      { label: 'WhatsApp', href: '#comunidad/whatsapp' },
      { label: 'Newsletter', href: '#comunidad/newsletter' },
    ],
  },
}

export default function NavBar({ topOffset }) {
  const [scrolled, setScrolled] = useState(false)
  const [hoverIdx, setHoverIdx] = useState(null)
  const [openLabel, setOpenLabel] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [logoBroken, setLogoBroken] = useState(false)
  const closeTimerRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const openDropdown = (label) => {
    if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null }
    setOpenLabel(label)
  }
  const scheduleClose = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    closeTimerRef.current = setTimeout(() => setOpenLabel(null), 120)
  }

  const links = ['Cursos', 'Calendario', 'Empresas', 'Comunidad']

  return (
    <>
      <div className="navbar-outer" style={{ top: topOffset }}>
        <nav className={`navbar-pill ${scrolled ? 'is-scrolled' : ''}`}>
          <div className="navbar-inner">
            <a href="#" className="logo" aria-label="Constructiva — inicio">
              {!logoBroken ? (
                <img
                  src="/logos/Logo_aqua.png"
                  alt="Constructiva"
                  className="logo-img"
                  onError={() => setLogoBroken(true)}
                />
              ) : (
                <span className="logo-fallback">
                  constructiva<span style={{ color: 'var(--aqua)' }}>.</span>
                </span>
              )}
            </a>

            <div className="nav-links">
              {links.map((label, i) => {
                const dd = DROPDOWNS[label]
                const isOpen = openLabel === label
                return (
                  <div
                    key={label}
                    className={`nav-link-wrap ${isOpen ? 'is-open' : ''}`}
                    onMouseEnter={() => { setHoverIdx(i); if (dd) openDropdown(label) }}
                    onMouseLeave={() => { setHoverIdx(null); if (dd) scheduleClose() }}
                  >
                    <a
                      href={`#${label.toLowerCase()}`}
                      className={`nav-link ${hoverIdx === i ? 'is-hover' : ''}`}
                    >
                      {label}
                      {dd && (
                        <svg className="nav-chevron" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                          <path d="M2 4L5 7L8 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                      <span className="nav-link-underline" />
                    </a>
                    {dd && (
                      <>
                        <span className="nav-dropdown-bridge" aria-hidden="true" />
                        <div className="nav-dropdown" role="menu">
                          {dd.items.map((it, j) =>
                            it.type === 'separator' ? (
                              <div key={`sep-${j}`} className="nav-dropdown-sep" />
                            ) : (
                              <a
                                key={it.label}
                                href={it.href}
                                role="menuitem"
                                className={`nav-dropdown-item ${it.cta ? 'is-cta' : ''}`}
                              >
                                <span>{it.label}</span>
                              </a>
                            )
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>

            <button type="button" className="login-btn">Iniciar sesión</button>

            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú"
              className="hamburger"
            >
              <span />
              <span />
            </button>
          </div>
        </nav>
      </div>

      {mobileOpen && (
        <div className="mobile-menu">
          <button onClick={() => setMobileOpen(false)} aria-label="Cerrar menú" className="mobile-menu-close">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <div className="mobile-menu-links">
            {[...links, 'Iniciar sesión'].map((label, i) => (
              <a
                key={label}
                href="#"
                onClick={() => setMobileOpen(false)}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
