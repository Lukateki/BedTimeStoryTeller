import React, { useMemo } from 'react'

export default function Particles() {
  const particles = useMemo(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left:     `${5 + Math.random() * 90}%`,
      size:     `${2 + Math.random() * 3}px`,
      duration: `${8 + Math.random() * 12}s`,
      delay:    `${Math.random() * 8}s`,
      opacity:  0.3 + Math.random() * 0.5,
    })), []
  )

  return (
    <div className="particles">
      {particles.map(p => (
        <div key={p.id} className="particle" style={{
          left: p.left,
          width: p.size, height: p.size,
          animationDuration: p.duration,
          animationDelay: p.delay,
          opacity: p.opacity,
        }} />
      ))}
    </div>
  )
}
