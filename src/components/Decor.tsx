import { motion, useScroll, useSpring, useTransform } from 'motion/react'
import { sinMovimiento } from './ui'

/** Capa de fondo: manchas verdes que flotan, círculos y ramas en línea que se mueven con el scroll. */
export default function Decor() {
  const { scrollY } = useScroll()
  const y1 = useSpring(useTransform(scrollY, [0, 3000], [0, -380]), { stiffness: 60, damping: 20 })
  const y2 = useSpring(useTransform(scrollY, [0, 3000], [0, 260]), { stiffness: 60, damping: 20 })
  const y3 = useSpring(useTransform(scrollY, [0, 3000], [0, -150]), { stiffness: 60, damping: 20 })
  const quieto = sinMovimiento()
  const st = (y: any) => (quieto ? {} : { y })
  const trazo = { fill: 'none', stroke: '#12302a', strokeWidth: 1.6, strokeOpacity: 0.22, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <div className="decor" aria-hidden="true">
      <div className="mancha m1" /><div className="mancha m2" /><div className="mancha m3" />

      <motion.svg style={{ right: -120, top: 80, ...st(y1) }} width="520" height="520" viewBox="0 0 520 520">
        <g className="g-giro">
          {[250, 205, 160, 115, 70].map((r) => <circle key={r} cx="260" cy="260" r={r} {...trazo} strokeDasharray={r % 10 === 0 ? '4 10' : undefined} />)}
          <circle cx="260" cy="10" r="9" fill="#4fd08f" /><circle cx="505" cy="260" r="6" fill="#ffd25e" /><circle cx="110" cy="440" r="7" fill="#ffb3d1" />
        </g>
      </motion.svg>

      <motion.svg style={{ left: -90, top: '46%', ...st(y2) }} width="380" height="520" viewBox="0 0 380 520">
        <path d="M60 520C70 400 120 300 190 220S300 90 320 0" {...trazo} />
        {[[88, 420, -30], [112, 350, 28], [140, 300, -34], [176, 244, 26], [214, 196, -36], [250, 148, 24], [286, 90, -30]].map(([x, yy, a], i) => (
          <g key={i} transform={`translate(${x} ${yy}) rotate(${a})`}><path d="M0 0C20-34 56-38 74-22 56 4 22 14 0 0Z" {...trazo} fill="#4fd08f" fillOpacity="0.18" /><path d="M4 0C26-12 46-18 70-20" {...trazo} strokeOpacity="0.14" /></g>
        ))}
      </motion.svg>

      <motion.svg style={{ left: '8%', top: 120, ...st(y3) }} width="180" height="180" viewBox="0 0 180 180">
        {Array.from({ length: 7 }).map((_, i) => Array.from({ length: 7 }).map((__, j) => <circle key={i + '-' + j} cx={12 + i * 26} cy={12 + j * 26} r="2.2" fill="#12302a" fillOpacity="0.2" />))}
      </motion.svg>

      <motion.svg style={{ right: '16%', bottom: 60, ...st(y3) }} width="200" height="120" viewBox="0 0 200 120">
        <path d="M4 100c20-60 40 40 60-10s40-70 60-10 40 50 72-30" {...trazo} strokeWidth={2.2} />
        <path d="M4 70c20-60 40 40 60-10s40-70 60-10 40 50 72-30" {...trazo} strokeOpacity="0.12" />
      </motion.svg>

      {[[12, 22, 18], [30, 78, 14], [58, 12, 20], [72, 64, 12], [88, 38, 16], [44, 90, 12]].map(([l, t, z], i) => (
        <svg key={i} className="brillo" style={{ left: l + '%', top: t + '%', animationDelay: i * 0.7 + 's' }} width={z * 2} height={z * 2} viewBox="0 0 40 40">
          <path d="M20 2C21 14 26 19 38 20 26 21 21 26 20 38 19 26 14 21 2 20 14 19 19 14 20 2Z" fill="#fff" fillOpacity="0.9" />
        </svg>
      ))}
    </div>
  )
}
