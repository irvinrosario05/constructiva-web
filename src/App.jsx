import { useState, useEffect, useRef } from 'react'
import Lenis from 'lenis'
import AnnouncementBar from './components/AnnouncementBar'
import NavBar from './components/NavBar'
import HeroSection from './components/HeroSection'
import SchoolsSection from './components/SchoolsSection'
import MarketingSections from './components/MarketingSections'
import LoginPage from './pages/LoginPage'
import EmpresasPage from './pages/EmpresasPage'
import CalendarPage from './pages/CalendarPage'

export default function App() {
  const [announcementOpen, setAnnouncementOpen] = useState(true)
  const [collapsed, setCollapsed] = useState(false)
  const [page, setPage] = useState('home')
  const sectionRef = useRef(null)
  const lenisRef = useRef(null)

  const handleClose = () => {
    setAnnouncementOpen(false)
    setTimeout(() => setCollapsed(true), 220)
  }

  const goToLogin = () => {
    window.scrollTo(0, 0)
    setPage('login')
  }

  const goToEmpresas = () => {
    window.scrollTo(0, 0)
    setPage('empresas')
  }

  const goHome = () => {
    window.scrollTo(0, 0)
    setPage('home')
  }

  const goToCalendar = () => {
    window.scrollTo(0, 0)
    setPage('calendar')
  }

  useEffect(() => {
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return
    if (page !== 'home') {
      lenisRef.current?.destroy()
      lenisRef.current = null
      return
    }
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    })
    lenisRef.current = lenis
    let rafId
    const raf = (time) => { lenis.raf(time); rafId = requestAnimationFrame(raf) }
    rafId = requestAnimationFrame(raf)
    return () => { cancelAnimationFrame(rafId); lenis.destroy(); lenisRef.current = null }
  }, [page])

  if (page === 'login')    return <LoginPage    onBack={goHome} />
  if (page === 'empresas') return <EmpresasPage onBack={goHome} />
  if (page === 'calendar') return <CalendarPage onBack={goHome} onLogin={goToLogin} onEmpresas={goToEmpresas} />

  const topOffset = announcementOpen && !collapsed ? 'calc(38px + 16px)' : '16px'

  return (
    <div className="page">
      <AnnouncementBar open={announcementOpen} onClose={handleClose} />
      <NavBar topOffset={topOffset} onLogin={goToLogin} onEmpresas={goToEmpresas} onCalendar={goToCalendar} onHome={goHome} />
      <section ref={sectionRef} className="hero-section" style={{ height: '400vh' }}>
        <HeroSection sectionRef={sectionRef} />
      </section>
      <SchoolsSection />
      <MarketingSections />
    </div>
  )
}
