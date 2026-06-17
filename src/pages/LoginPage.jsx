import { useState } from 'react'

const BASE = import.meta.env.BASE_URL

const IconPerson = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
)
const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M1 6l7 4.5L15 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
)
const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="3" y="7" width="10" height="7" rx="2" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
)
const IconEyeOn = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
)
const IconEyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
)

function EyeBtn({ show, toggle }) {
  return (
    <button type="button" className="login-eye" onClick={toggle} aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
      {show ? <IconEyeOff /> : <IconEyeOn />}
    </button>
  )
}

function ErrorAlert({ msg }) {
  if (!msg) return null
  return (
    <div className="login-error" role="alert">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M7 4v3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        <circle cx="7" cy="10" r="0.6" fill="currentColor"/>
      </svg>
      {msg}
    </div>
  )
}

export default function LoginPage({ onBack }) {
  const [view, setView] = useState('login')

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const [reg, setReg]               = useState({ nombre: '', apellido: '', email: '', password: '', confirm: '' })
  const [showRegPw, setShowRegPw]   = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [regLoading, setRegLoading] = useState(false)
  const [regError, setRegError]     = useState('')

  const setR = key => e => setReg(prev => ({ ...prev, [key]: e.target.value }))

  const handleLogin = async e => {
    e.preventDefault(); setError('')
    if (!email || !password) { setError('Por favor, completa todos los campos.'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false); setError('Credenciales incorrectas. Intenta de nuevo.')
  }

  const handleRegister = async e => {
    e.preventDefault(); setRegError('')
    if (!reg.nombre || !reg.apellido || !reg.email || !reg.password || !reg.confirm) {
      setRegError('Por favor, completa todos los campos.'); return
    }
    if (reg.password !== reg.confirm) { setRegError('Las contraseñas no coinciden.'); return }
    setRegLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setRegLoading(false); setRegError('No se pudo crear la cuenta. Intenta de nuevo.')
  }

  const switchTo = next => e => { e.preventDefault(); setView(next); setError(''); setRegError('') }

  return (
    <div className="login-page">
      <div className="login-bg-glow" aria-hidden="true" />

      <button className="login-back-btn" onClick={onBack} aria-label="Volver al inicio">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Volver
      </button>

      <div className="login-card-wrap">
        <div className="login-card">

          <div className="login-logo-row">
            <a href="#" onClick={e => { e.preventDefault(); onBack() }} className="login-logo" aria-label="Constructiva — inicio">
              <img
                src={`${BASE}logos/Logo_aqua.png`}
                alt="Constructiva"
                className="logo-img"
                onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'inline' }}
              />
              <span className="logo-fallback" style={{ display: 'none' }}>
                constructiva<span style={{ color: 'var(--aqua)' }}>.</span>
              </span>
            </a>
          </div>

          {view === 'login' ? (
            <>
              <h1 className="login-title">Accede a tu cuenta</h1>

              <form className="login-form" onSubmit={handleLogin} noValidate>
                <div className="login-field">
                  <label htmlFor="login-email" className="login-label">Email</label>
                  <div className="login-input-wrap">
                    <span className="login-input-icon"><IconMail /></span>
                    <input id="login-email" type="email" className="login-input has-icon"
                      placeholder="correo@ejemplo.com" value={email}
                      onChange={e => setEmail(e.target.value)} autoComplete="email" autoFocus />
                  </div>
                </div>

                <div className="login-field">
                  <div className="login-label-row">
                    <label htmlFor="login-pw" className="login-label">Contraseña</label>
                    <a href="#" className="login-forgot">¿Olvidaste tu contraseña?</a>
                  </div>
                  <div className="login-input-wrap">
                    <span className="login-input-icon"><IconLock /></span>
                    <input id="login-pw" type={showPw ? 'text' : 'password'} className="login-input has-icon has-eye"
                      placeholder="••••••••" value={password}
                      onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
                    <EyeBtn show={showPw} toggle={() => setShowPw(v => !v)} />
                  </div>
                </div>

                <ErrorAlert msg={error} />

                <button type="submit" className="login-submit" disabled={loading}>
                  {loading ? <span className="login-spinner" aria-hidden="true" /> : 'Iniciar Sesión'}
                </button>
              </form>

              <div className="login-divider"><span>o continuar con</span></div>
              <button type="button" className="login-social-btn login-google-btn">
                <GoogleIcon /> Continuar con Google
              </button>

              <p className="login-register">
                ¿No tienes cuenta?{' '}
                <a href="#" className="login-register-link" onClick={switchTo('register')}>Crear cuenta</a>
              </p>
            </>
          ) : (
            <>
              <h1 className="login-title">Crea tu cuenta</h1>

              <form className="login-form" onSubmit={handleRegister} noValidate>
                <div className="login-field">
                  <label htmlFor="reg-nombre" className="login-label">Nombre</label>
                  <div className="login-input-wrap">
                    <span className="login-input-icon"><IconPerson /></span>
                    <input id="reg-nombre" type="text" className="login-input has-icon"
                      placeholder="Tu nombre" value={reg.nombre} onChange={setR('nombre')} autoComplete="given-name" autoFocus />
                  </div>
                </div>

                <div className="login-field">
                  <label htmlFor="reg-apellido" className="login-label">Apellido</label>
                  <div className="login-input-wrap">
                    <span className="login-input-icon"><IconPerson /></span>
                    <input id="reg-apellido" type="text" className="login-input has-icon"
                      placeholder="Tu apellido" value={reg.apellido} onChange={setR('apellido')} autoComplete="family-name" />
                  </div>
                </div>

                <div className="login-field">
                  <label htmlFor="reg-email" className="login-label">Email</label>
                  <div className="login-input-wrap">
                    <span className="login-input-icon"><IconMail /></span>
                    <input id="reg-email" type="email" className="login-input has-icon"
                      placeholder="correo@ejemplo.com" value={reg.email} onChange={setR('email')} autoComplete="email" />
                  </div>
                </div>

                <div className="login-field">
                  <label htmlFor="reg-pw" className="login-label">Contraseña</label>
                  <div className="login-input-wrap">
                    <span className="login-input-icon"><IconLock /></span>
                    <input id="reg-pw" type={showRegPw ? 'text' : 'password'} className="login-input has-icon has-eye"
                      placeholder="••••••••" value={reg.password} onChange={setR('password')} autoComplete="new-password" />
                    <EyeBtn show={showRegPw} toggle={() => setShowRegPw(v => !v)} />
                  </div>
                </div>

                <div className="login-field">
                  <label htmlFor="reg-confirm" className="login-label">Confirmar contraseña</label>
                  <div className="login-input-wrap">
                    <span className="login-input-icon"><IconLock /></span>
                    <input id="reg-confirm" type={showConfirm ? 'text' : 'password'} className="login-input has-icon has-eye"
                      placeholder="••••••••" value={reg.confirm} onChange={setR('confirm')} autoComplete="new-password" />
                    <EyeBtn show={showConfirm} toggle={() => setShowConfirm(v => !v)} />
                  </div>
                </div>

                <ErrorAlert msg={regError} />

                <button type="submit" className="login-submit" disabled={regLoading}>
                  {regLoading ? <span className="login-spinner" aria-hidden="true" /> : 'Crear cuenta'}
                </button>
              </form>

              <div className="login-divider"><span>o registrarte con</span></div>
              <button type="button" className="login-social-btn login-google-btn">
                <GoogleIcon /> Registrarse con Google
              </button>

              <p className="login-register">
                ¿Ya tienes cuenta?{' '}
                <a href="#" className="login-register-link" onClick={switchTo('login')}>Iniciar sesión</a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
