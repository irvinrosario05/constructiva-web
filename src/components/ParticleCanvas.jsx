import { useRef, useEffect } from 'react'

const COUNT = 160
const CONNECT_DIST = 130
const BASE_SPEED = 0.10

function buildParticles(w, h) {
  return Array.from({ length: COUNT }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * BASE_SPEED,
    vy: (Math.random() - 0.5) * BASE_SPEED - 0.02, // subtle upward drift
    phase: Math.random() * Math.PI * 2,
    phaseSpeed: 0.003 + Math.random() * 0.005,
    amp: 0.25 + Math.random() * 0.55,
    size: 0.3 + Math.random() * 0.85,
    baseOpacity: 0.20 + Math.random() * 0.50,
  }))
}

export default function ParticleCanvas({ progressRef }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let running = true
    let particles = []

    const W = () => canvas.offsetWidth
    const H = () => canvas.offsetHeight

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const w = W(), h = H()
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.scale(dpr, dpr)
      particles = buildParticles(w, h)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const animate = () => {
      if (!running) return
      const w = W(), h = H()
      // fade in during first 20% of scroll progress, then stay full
      const rawP = progressRef?.current ?? 0
      const globalAlpha = Math.min(1, rawP / 0.18)

      ctx.clearRect(0, 0, w, h)

      particles.forEach(pt => {
        pt.phase += pt.phaseSpeed
        pt.x += pt.vx + Math.sin(pt.phase) * pt.amp * 0.045
        pt.y += pt.vy + Math.cos(pt.phase * 0.75) * pt.amp * 0.03
        if (pt.x < -25) pt.x = w + 25
        if (pt.x > w + 25) pt.x = -25
        if (pt.y < -25) pt.y = h + 25
        if (pt.y > h + 25) pt.y = -25
      })

      // connections
      ctx.lineWidth = 0.35
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = dx * dx + dy * dy
          if (dist < CONNECT_DIST * CONNECT_DIST) {
            const alpha = (1 - Math.sqrt(dist) / CONNECT_DIST) * 0.13 * globalAlpha
            ctx.strokeStyle = `rgba(215,208,195,${alpha})`
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      // dots
      particles.forEach(pt => {
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(228,222,210,${pt.baseOpacity * globalAlpha * 0.75})`
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      running = false
      ro.disconnect()
    }
  }, [progressRef])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    />
  )
}
