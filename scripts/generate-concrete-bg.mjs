#!/usr/bin/env node
// Generates public/schools/concrete-pov.svg
// POV: camera submerged inside a concrete pour
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const OUT   = join(__dir, '../public/schools/concrete-pov.svg')
const W = 1920, H = 1080

// Seeded deterministic RNG (Mulberry32)
let _s = 0xC0FFEE42
const rand = () => {
  _s |= 0; _s = _s + 0x6D2B79F5 | 0
  let z = Math.imul(_s ^ (_s >>> 15), 1 | _s)
  z = z ^ (z + Math.imul(z ^ (z >>> 7), 61 | z))
  return ((z ^ (z >>> 14)) >>> 0) / 4294967296
}
const ri  = (a, b) => a + Math.floor(rand() * (b - a + 1))
const rf  = (a, b) => a + rand() * (b - a)
const f2  = v => v.toFixed(2)
const f1  = v => v.toFixed(1)

// Irregular polygon around (cx, cy), radius in [rMin, rMax]
const polyPts = (cx, cy, sides, rMin, rMax) =>
  Array.from({ length: sides }, (_, i) => {
    const a = (i / sides) * Math.PI * 2 + rf(-0.5, 0.5)
    const r = rf(rMin, rMax)
    return `${f1(cx + Math.cos(a) * r)},${f1(cy + Math.sin(a) * r)}`
  }).join(' ')

// Wavy horizontal band path (simulates concrete viscous flow)
const wavePath = (y0, amp, wl) => {
  let d = `M 0,${f1(y0)}`
  for (let x = 0; x <= W + 20; x += 16) {
    const y = y0
      + Math.sin((x / wl)        * Math.PI * 2) * amp
      + Math.sin((x / (wl * 0.6))* Math.PI * 2) * amp * 0.28
      + Math.sin((x / (wl * 1.7))* Math.PI * 2) * amp * 0.14
    d += ` L ${f1(x)},${f1(y)}`
  }
  return d
}

// ── DEFS ─────────────────────────────────────────────────────────────────────
const defs = `<defs>

  <!-- Concrete macrotexture via fractal noise -->
  <filter id="ftex" x="-2%" y="-2%" width="104%" height="104%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.017 0.021" numOctaves="8" seed="42" result="n"/>
    <feColorMatrix type="saturate" values="0" in="n" result="gn"/>
    <feBlend in="SourceGraphic" in2="gn" mode="overlay"/>
  </filter>

  <!-- Fine surface grain -->
  <filter id="fgrain" x="-2%" y="-2%" width="104%" height="104%" color-interpolation-filters="sRGB">
    <feTurbulence type="turbulence" baseFrequency="0.68" numOctaves="2" seed="77" result="grain"/>
    <feColorMatrix type="saturate" values="0" in="grain" result="gg"/>
    <feBlend in="SourceGraphic" in2="gg" mode="soft-light"/>
  </filter>

  <!-- Liquid refraction distortion (applied to foreground aggregate) -->
  <filter id="frefract">
    <feTurbulence type="fractalNoise" baseFrequency="0.008 0.006" numOctaves="3" seed="17" result="disp"/>
    <feDisplacementMap in="SourceGraphic" in2="disp" scale="26"
                       xChannelSelector="R" yChannelSelector="G"/>
  </filter>

  <!-- Depth-of-field blur for background aggregate -->
  <filter id="fdof">
    <feGaussianBlur stdDeviation="3.2"/>
  </filter>

  <!-- Haze blur for slurry flow bands -->
  <filter id="fhaze">
    <feGaussianBlur stdDeviation="28"/>
  </filter>

  <!-- Soft blur for bubble highlights -->
  <filter id="fbub">
    <feGaussianBlur stdDeviation="1.4"/>
  </filter>

  <!-- ── Gradients ── -->

  <!-- Depth: light enters from top (pour opening), fades to dark at base -->
  <linearGradient id="gDepth" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%"   stop-color="#CCBFAa"/>
    <stop offset="22%"  stop-color="#B0A898"/>
    <stop offset="50%"  stop-color="#948C84"/>
    <stop offset="78%"  stop-color="#7A7470"/>
    <stop offset="100%" stop-color="#545050"/>
  </linearGradient>

  <!-- Main light cone from pour opening at top-center -->
  <radialGradient id="gPourLight" cx="50%" cy="-2%" r="72%"
                  gradientTransform="translate(0,0) scale(1,0.78)">
    <stop offset="0%"   stop-color="#EDE4CC" stop-opacity="0.82"/>
    <stop offset="32%"  stop-color="#D8CEB4" stop-opacity="0.40"/>
    <stop offset="64%"  stop-color="#B8B0A0" stop-opacity="0.14"/>
    <stop offset="100%" stop-color="#A0988A" stop-opacity="0"/>
  </radialGradient>

  <!-- Secondary ambient scatter — upper left -->
  <radialGradient id="gScatter" cx="16%" cy="10%" r="52%">
    <stop offset="0%"   stop-color="#DDD4BC" stop-opacity="0.32"/>
    <stop offset="100%" stop-color="#DDD4BC" stop-opacity="0"/>
  </radialGradient>

  <!-- Warm caustic glow mid-depth — gives concrete that "wet" milky feel -->
  <radialGradient id="gCaustic" cx="62%" cy="52%" r="45%">
    <stop offset="0%"   stop-color="#C8BC9E" stop-opacity="0.18"/>
    <stop offset="100%" stop-color="#C8BC9E" stop-opacity="0"/>
  </radialGradient>

  <!-- Dark absorption vignette -->
  <radialGradient id="gVig" cx="50%" cy="46%" r="66%">
    <stop offset="0%"   stop-color="#060605" stop-opacity="0"/>
    <stop offset="52%"  stop-color="#060605" stop-opacity="0.14"/>
    <stop offset="80%"  stop-color="#060605" stop-opacity="0.55"/>
    <stop offset="100%" stop-color="#060605" stop-opacity="0.88"/>
  </radialGradient>

  <!-- Brand teal — subtle mold lining ambient -->
  <radialGradient id="gTeal" cx="50%" cy="95%" r="58%">
    <stop offset="0%"   stop-color="#1E8078" stop-opacity="0.13"/>
    <stop offset="100%" stop-color="#1E8078" stop-opacity="0"/>
  </radialGradient>

  <!-- Bubble interior gradient -->
  <radialGradient id="gBubFill" cx="36%" cy="30%" r="65%">
    <stop offset="0%"   stop-color="#ECE4CC" stop-opacity="0.55"/>
    <stop offset="65%"  stop-color="#D0C8B4" stop-opacity="0.18"/>
    <stop offset="100%" stop-color="#B8B0A0" stop-opacity="0.04"/>
  </radialGradient>
</defs>`

// ── ELEMENTS ──────────────────────────────────────────────────────────────────
let el = ''

// ── 1. BACKGROUND AGGREGATE — blurred, DOF effect ────────────────────────────
el += `<g filter="url(#fdof)" opacity="0.68">\n`
for (let i = 0; i < 18; i++) {
  const cx = rf(0, W), cy = rf(0, H)
  const sides = ri(4, 7)
  const rMin = rf(10, 20), rMax = rMin * rf(1.2, 1.8)
  const b = ri(40, 78)
  el += `  <polygon points="${polyPts(cx, cy, sides, rMin, rMax)}"
    fill="rgb(${b},${b - 4},${b - 6})" opacity="${f2(rf(0.28, 0.60))}"/>\n`
}
el += `</g>\n`

// ── 2. SLURRY FLOW BANDS — viscosity lines ────────────────────────────────────
const BANDS = [
  { y: H * 0.18, amp: 24, wl: 620, op: 0.060, col: '178,168,152' },
  { y: H * 0.36, amp: 40, wl: 460, op: 0.065, col: '165,155,140' },
  { y: H * 0.55, amp: 34, wl: 500, op: 0.055, col: '152,142,128' },
  { y: H * 0.70, amp: 46, wl: 400, op: 0.048, col: '140,132,118' },
  { y: H * 0.86, amp: 28, wl: 560, op: 0.042, col: '128,120,108' },
]
for (const { y, amp, wl, op, col } of BANDS) {
  el += `<path d="${wavePath(y, amp, wl)}"
    fill="none" stroke="rgb(${col})" stroke-width="32"
    opacity="${op}" filter="url(#fhaze)"/>\n`
}

// ── 3. FOREGROUND AGGREGATE — liquid refraction, stone types ─────────────────
el += `<g filter="url(#frefract)">\n`
for (let i = 0; i < 11; i++) {
  const cx = rf(40, W - 40), cy = rf(40, H - 40)
  const sides = ri(5, 9)
  const rMin = rf(48, 90), rMax = rMin * rf(1.10, 1.55)
  // Stone variety: dark granite / limestone / river gravel / sandy stone
  const variety = ri(0, 3)
  let fb, b
  if (variety === 0) { b = ri(28, 55);  fb = `${b},${b-5},${b-8}` }   // dark granite
  else if (variety === 1) { b = ri(55, 88);  fb = `${b+16},${b+12},${b+8}` } // limestone
  else if (variety === 2) { b = ri(40, 70);  fb = `${b+8},${b+5},${b+2}` }  // river gravel
  else { b = ri(60, 90);  fb = `${b+18},${b+12},${b+5}` }             // sandy

  const op = f2(rf(0.50, 0.82))
  el += `  <polygon points="${polyPts(cx, cy, sides, rMin, rMax)}"
    fill="rgb(${fb})" opacity="${op}"/>\n`

  // Edge highlight so chunks pop against dark bg
  if (rand() > 0.38) {
    const hl = Math.min(255, b + 55)
    el += `  <polygon points="${polyPts(cx, cy, sides, rMin, rMax)}"
    fill="none" stroke="rgb(${hl},${hl - 5},${hl - 9})"
    stroke-width="0.9" opacity="${f2(rf(0.14, 0.32))}"/>\n`
  }
}
el += `</g>\n`

// ── 4. MEDIUM AGGREGATE — mid-range, no filter ───────────────────────────────
for (let i = 0; i < 30; i++) {
  const cx = rf(0, W), cy = rf(0, H)
  const sides = ri(4, 7)
  const rMin = rf(12, 26), rMax = rMin * rf(1.1, 1.7)
  const b = ri(38, 90)
  el += `<polygon points="${polyPts(cx, cy, sides, rMin, rMax)}"
  fill="rgb(${b},${b-4},${b-6})" opacity="${f2(rf(0.32, 0.65))}"/>\n`
}

// ── 5. FINE GRIT & SAND ──────────────────────────────────────────────────────
for (let i = 0; i < 62; i++) {
  const cx = rf(0, W), cy = rf(0, H)
  const r = rf(1.8, 7.5)
  const sides = ri(3, 5)
  const b = ri(50, 112)
  el += `<polygon points="${polyPts(cx, cy, sides, r * 0.55, r)}"
  fill="rgb(${b},${b-3},${b-5})" opacity="${f2(rf(0.30, 0.62))}"/>\n`
}

// ── 6. AIR BUBBLES ───────────────────────────────────────────────────────────
for (let i = 0; i < 32; i++) {
  const cx = rf(20, W - 20), cy = rf(20, H - 20)
  const r  = rf(3.5, 44)
  const op = rf(0.18, 0.48)
  const sw = Math.max(0.6, r * 0.028)

  // Outer ring
  el += `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}"
  fill="none" stroke="rgb(182,172,156)" stroke-width="${f2(sw)}"
  opacity="${f2(op * 0.90)}"/>\n`

  // Semi-transparent fill
  el += `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r * 0.88)}"
  fill="url(#gBubFill)" opacity="${f2(op * 0.55)}"/>\n`

  // Specular highlight — upper-left
  const hx = cx - r * 0.26, hy = cy - r * 0.30
  const hRx = r * 0.30, hRy = r * 0.19
  el += `<ellipse cx="${f1(hx)}" cy="${f1(hy)}" rx="${f1(hRx)}" ry="${f1(hRy)}"
  fill="rgb(242,234,218)" opacity="${f2(op * 0.72)}" filter="url(#fbub)"/>\n`

  // Bottom shadow (bubble is denser at bottom in viscous concrete)
  const sx = cx, sy = cy + r * 0.30
  el += `<ellipse cx="${f1(sx)}" cy="${f1(sy)}" rx="${f1(r * 0.50)}" ry="${f1(r * 0.15)}"
  fill="rgb(82,78,74)" opacity="${f2(op * 0.28)}" filter="url(#fbub)"/>\n`
}

// ── SVG ASSEMBLY ──────────────────────────────────────────────────────────────
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 ${W} ${H}"
     preserveAspectRatio="xMidYMid slice"
     width="${W}" height="${H}">
${defs}

  <!-- 1 · Base depth gradient -->
  <rect width="${W}" height="${H}" fill="url(#gDepth)"/>

  <!-- 2 · Concrete macrotexture (fractal noise overlay) -->
  <rect width="${W}" height="${H}" fill="#9C9488" filter="url(#ftex)" opacity="0.80"/>

  <!-- 3 · Fine surface grain -->
  <rect width="${W}" height="${H}" fill="#8A8278" filter="url(#fgrain)" opacity="0.22"/>

  <!-- 4 · Scene: aggregate, slurry, grit, bubbles -->
${el}

  <!-- 5 · Pour light cone from opening above -->
  <rect width="${W}" height="${H}" fill="url(#gPourLight)"/>

  <!-- 6 · Scatter bounce ambient -->
  <rect width="${W}" height="${H}" fill="url(#gScatter)"/>

  <!-- 7 · Warm caustic mid-depth glow -->
  <rect width="${W}" height="${H}" fill="url(#gCaustic)"/>

  <!-- 8 · Brand teal mold ambient -->
  <rect width="${W}" height="${H}" fill="url(#gTeal)"/>

  <!-- 9 · Absorption vignette -->
  <rect width="${W}" height="${H}" fill="url(#gVig)"/>
</svg>`

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, svg, 'utf-8')
console.log(`✓  ${OUT}  (${(svg.length / 1024).toFixed(1)} KB)`)
