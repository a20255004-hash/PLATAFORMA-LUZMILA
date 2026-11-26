import { useMemo } from 'react'
import { Sube, Titulo3D, Vacio } from '../components/ui'
import { bonita, diaProyecto, esISO } from '../lib/fechas'
import { fotosGuardadas, nivelDe, puntosDia, useDatos, xpLuzmila } from '../store'

type Ev = { e: string; t: string }
export default function Camino() {
  const s = useDatos()
  const fotos = useMemo(fotosGuardadas, [s.cargado])
  const xp = xpLuzmila(s), niv = nivelDe(xp.total)

  const grupos = useMemo(() => {
    const m = new Map<string, Ev[]>()
    const add = (f: string, e: string, t: string) => { if (!esISO(f)) return; m.set(f, [...(m.get(f) || []), { e, t }]) }
    Object.entries(s.checkins).forEach(([f, c]) => { if (puntosDia(c) === 3) add(f, '🌟', 'Tres de tres') })
    s.retomas.forEach((f) => add(f, '🛟', 'Volviste: +3'))
    s.culta.sesiones.forEach((x: any) => add(x.fecha, '🎓', `${String(x.tema).replace(/\(.*?\)/g, '').trim().slice(0, 44)} · ${x.nota}/20`))
    ;(s.quizzes || []).forEach((x: any) => add(x.fecha, '🎯', `Quiz ${x.aciertos}/${x.total}`))
    s.zorro.bitacora.forEach((x: any) => add(x.fecha, '🦊', String(x.hice).slice(0, 48)))
    s.expediente.filter((x) => !x.historial && !x.sensible).forEach((x: any) => add(x.fecha, '🕵️', String(x.entrada).slice(0, 52)))
    ;(s.evaluaciones || []).forEach((x: any) => add(x.fecha, '✍️', `Evaluación ${x.puntaje}/100`))
    s.alterEgo.forEach((x: any) => add(x.fecha, '🎭', 'Activaste tu alter ego'))
    ;(s.fasesReg || []).filter((r: any) => r.fase === 6 && r.seccion === 'sesion').forEach((r: any) => add(r.fecha, '🥋', 'Sesión de Cuerpo en Movimiento'))
    ;(s.fasesReg || []).filter((r: any) => r.fase === 8 && r.estado && r.estado !== 'Pendiente').forEach((r: any) => add(r.fecha, '🌉', 'Un puente con un vínculo'))
    return [...m.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1)).slice(0, 36)
  }, [s])

  return (
    <div className="pagina">
      <header className="cabeza">
        <span className="eyebrow">Día {diaProyecto()} de tu proyecto · {grupos.length} paradas con algo hecho</span>
        <Titulo3D texto="CAMINO" />
        <p className="serif" style={{ fontSize: 'clamp(22px, 3vw, 32px)', maxWidth: 720 }}>Un camino con desvíos, no una línea recta. Cada parada es algo que hiciste: los huecos son parte del trayecto.</p>
      </header>

      <div className="camino">
        <Sube><div className="parada hoy"><span className="nodo-c" aria-hidden="true">{niv.actual.emoji}</span><div className="card color pila-s"><span className="eyebrow">Estás aquí</span><b className="h3">{niv.actual.nombre}</b><span className="chico">{xp.total} XP{niv.siguiente ? ` · te faltan ${niv.faltan} para ${niv.siguiente.emoji} ${niv.siguiente.nombre}` : ''}</span></div></div></Sube>

        {grupos.length === 0 && <Vacio>Todavía no hay paradas. Tu primer check-in de tres, una sesión o una evidencia aparecen aquí como un nodo del camino.</Vacio>}

        {grupos.map(([f, evs], i) => (
          <Sube key={f} d={Math.min(i, 5) * 0.03}>
            <div className={`parada ${i % 2 ? 'der' : 'izq'}`}>
              <span className="nodo-c" aria-hidden="true">{evs[0].e}</span>
              <div className="card pila-s"><span className="eyebrow">{bonita(f)}</span>{evs.slice(0, 4).map((x, k) => <span key={k} className="chico">{x.e} {x.t}</span>)}{evs.length > 4 && <span className="chico suave">y {evs.length - 4} más</span>}</div>
              {i % 4 === 3 && fotos[(i >> 2) % fotos.length] && <img className="foto-camino" src={fotos[(i >> 2) % fotos.length]} alt="" />}
            </div>
          </Sube>
        ))}

        <Sube><div className="parada"><span className="nodo-c" aria-hidden="true">🌱</span><div className="card pila-s"><span className="eyebrow">{bonita(s.perfil.inicio)}</span><b className="h3">Empezaste el Proyecto Luzmila</b><span className="chico">“Ser mejor persona en todos los ámbitos”. Todo lo de arriba salió de ese primer paso.</span></div></div></Sube>
      </div>
    </div>
  )
}
