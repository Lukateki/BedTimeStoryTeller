import React, { useEffect, useRef } from 'react'

// Sparkle particle that fades out
function Sparkle({ x, y, size, color, delay }) {
  return (
    <circle
      cx={x} cy={y} r={size}
      fill={color}
      style={{
        animation: `sparkle-fade 0.8s ease-out ${delay}s both`,
        transformOrigin: `${x}px ${y}px`,
      }}
    />
  )
}

export default function WizardWand() {
  const sparklesRef = useRef([])
  const frameRef    = useRef(null)
  const tRef        = useRef(0)
  const svgRef      = useRef(null)
  const [sparkles, setSparkles] = React.useState([])
  const idRef = useRef(0)

  // The wand tip traces a figure-8 / lemniscate path
  const getTipPos = (t) => {
    const cx = 100, cy = 80
    const rx = 55, ry = 38
    // Lemniscate-ish: two overlapping ellipses with phase offset
    const x = cx + rx * Math.sin(t)
    const y = cy + ry * Math.sin(t * 2) * 0.5
    return { x, y }
  }

  // Wand angle follows the direction of motion
  const getWandAngle = (t) => {
    const dt = 0.05
    const p1 = getTipPos(t)
    const p2 = getTipPos(t + dt)
    return Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI)
  }

  useEffect(() => {
    const SPARKLE_COLORS = ['#ffe066', '#fff4a0', '#ffd700', '#c8f0ff', '#e0c8ff', '#ffffff']
    let last = 0

    const animate = (ts) => {
      tRef.current += 0.022
      const t = tRef.current

      // Spawn sparkles every ~60ms
      if (ts - last > 60) {
        last = ts
        const { x, y } = getTipPos(t)
        const newSparkles = Array.from({ length: 3 }, () => ({
          id:    idRef.current++,
          x:     x + (Math.random() - 0.5) * 14,
          y:     y + (Math.random() - 0.5) * 14,
          size:  1 + Math.random() * 2.5,
          color: SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)],
          delay: 0,
          born:  ts,
        }))

        setSparkles(prev => {
          const pruned = prev.filter(s => ts - s.born < 900)
          return [...pruned, ...newSparkles].slice(-60)
        })
      }

      // Update wand element directly for perf
      if (svgRef.current) {
        const tip   = getTipPos(t)
        const angle = getWandAngle(t)
        const wand  = svgRef.current.querySelector('#wand-group')
        if (wand) {
          wand.setAttribute('transform',
            `translate(${tip.x}, ${tip.y}) rotate(${angle + 45})`)
        }
        const glow = svgRef.current.querySelector('#tip-glow')
        if (glow) {
          glow.setAttribute('cx', tip.x)
          glow.setAttribute('cy', tip.y)
        }
        const glowSmall = svgRef.current.querySelector('#tip-glow-small')
        if (glowSmall) {
          glowSmall.setAttribute('cx', tip.x)
          glowSmall.setAttribute('cy', tip.y)
        }
      }

      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [])

  return (
    <svg
      ref={svgRef}
      width="200" height="160"
      viewBox="0 0 200 160"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}
    >
      <defs>
        <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#ffe066" stopOpacity="0.9" />
          <stop offset="60%"  stopColor="#ffd700" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ffd700" stopOpacity="0"   />
        </radialGradient>
        <style>{`
          @keyframes sparkle-fade {
            0%   { opacity: 1; transform: scale(1); }
            100% { opacity: 0; transform: scale(0.2); }
          }
        `}</style>
      </defs>

      {/* Sparkle trail */}
      {sparkles.map(s => (
        <Sparkle key={s.id} {...s} />
      ))}

      {/* Tip glow orb */}
      <circle id="tip-glow"       cx="100" cy="80" r="12" fill="url(#glowGrad)" opacity="0.6" />
      <circle id="tip-glow-small" cx="100" cy="80" r="5"  fill="#fffbe0"        opacity="0.9" />

      {/* Wand body — positioned/rotated via JS */}
      <g id="wand-group" transform="translate(100,80) rotate(45)">
        {/* Shaft */}
        <rect x="-2" y="0" width="4" height="30"
          rx="2"
          fill="url(#wandGrad)"
        />
        {/* Handle wrap lines */}
        <rect x="-2.5" y="20" width="5" height="2" rx="1" fill="rgba(255,200,80,0.5)" />
        <rect x="-2.5" y="24" width="5" height="2" rx="1" fill="rgba(255,200,80,0.5)" />
        {/* Tip cap */}
        <rect x="-3" y="-3" width="6" height="6" rx="1" fill="#c8a020" />
        <defs>
          <linearGradient id="wandGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#4a2c0a" />
            <stop offset="50%"  stopColor="#6b3d10" />
            <stop offset="100%" stopColor="#3a1f06" />
          </linearGradient>
        </defs>
      </g>
    </svg>
  )
}
