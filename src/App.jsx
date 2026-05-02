import { useState, useEffect, useRef } from 'react'
import Lenis from 'lenis'
import AnnouncementBar from './components/AnnouncementBar'
import NavBar from './components/NavBar'
import HeroSection from './components/HeroSection'
import SchoolsSection from './components/SchoolsSection'
import MarketingSections from './components/MarketingSections'

export default function App() {
  const [announcementOpen, setAnnouncementOpen] = useState(true)
  const [collapsed, setCollapsed] = useState(false)
  const sectionRef = useRef(null)

  const handleClose = () => {
    setAnnouncementOpen(false)
    setTimeout(() => setCollapsed(true), 220)
  }

  useEffect(() => {
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    })
    let rafId
    const raf = (time) => { lenis.raf(time); rafId = requestAnimationFrame(raf) }
    rafId = requestAnimationFrame(raf)
    return () => { cancelAnimationFrame(rafId); lenis.destroy() }
  }, [])

  const topOffset = announcementOpen && !collapsed ? 'calc(38px + 16px)' : '16px'

  return (
    <div className="page">
      <AnnouncementBar open={announcementOpen} onClose={handleClose} />
      <NavBar topOffset={topOffset} />
      <section ref={sectionRef} className="hero-section" style={{ height: '400vh' }}>
        <HeroSection sectionRef={sectionRef} />
      </section>
      <SchoolsSection />
      <MarketingSections />
    </div>
  )
}
