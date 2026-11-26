import { useState } from 'react'
import HerramientaFase from '../components/HerramientaFase'
import { decir, Hoja, Sube, Titulo3D } from '../components/ui'
import { Fase, FASES } from '../data/estructura'
import { mesProyecto } from '../lib/fechas'
import { useDatos, xpLuzmila } from '../store'

const ESTADOS = ['En pausa', 'Viva', 'Aún no empieza', 'Hecha']

export default function Mapa() {
  const s = useDatos()
  const [abierta, setAbierta] = useState<Fase | null>(null)
  const mes = mesProyecto()
  const xp = xpLuzmila(s).partes

  const estado = (f: Fase) => s.fasesEstado[f.id] || (f.id <= 4 ? 'En pausa' : 'Aún no empieza')
  const registros = (id: number) => (id === 1 ? Object.keys(s.checkins).length : id === 2 ? s.distorsiones.length : id === 3 ? s.expediente.filter((e) => !e.historial).length : id === 4 ? s.metas.length : id === 5 ? s.alterEgo.length : id === 7 ? s.disfrute.length : (s.fasesReg || []).filter((r: any) => r.fase === id).length)
  const clase = (f: Fase) => { const e = estado(f); return e === 'Viva' || e === 'Hecha' ? 'viva' : e === 'En pausa' ? 'pausa' : 'cerrada' }
  const depsOk = (f: Fase) => f.deps.every((d) => ['Viva', 'Hecha', 'En pausa'].includes(estado(FASES.find((x) => x.id === d)!)))
  const cerrada = (f: Fase) => f.optIn && !s.fasesAbiertas.includes(f.id)

  const vivas = FASES.filter((f) => estado(f) === 'Viva').length
  const pausa = FASES.filter((f) => estado(f) === 'En pausa').length
  const planHoy = FASES.filter((f) => f.mesN <= mes).length

  return (
    <div className="pagina">
      <header className="cabeza">
        <span className="eyebrow">19 fases · horizonte de 12 meses</span>
        <Titulo3D texto="MAPA" />
        <p className="serif" style={{ fontSize: 'clamp(22px, 3vw, 32px)', maxWidth: 720 }}>Un camino con desvíos, no una línea recta. Las fechas son de inicio, nunca de cierre: si una fase necesita más tiempo, las siguientes esperan.</p>
      </header>

      <div className="bento">
        <Sube className="c4"><div className="card color pila"><span className="eyebrow">Plan vs. realidad</span><div className="num" style={{ fontSize: 72 }}>mes {mes}</div><p className="chico">Según el calendario ya habrían <b>arrancado {planHoy}</b> fases. En la práctica: <b>{vivas} vivas</b> y <b>{pausa} en pausa</b>. Es información, no un reproche.</p></div></Sube>
        <Sube className="c8" d={0.06}><div className="card pila"><span className="eyebrow">Cómo leerlo</span>
          <div className="fila"><span className="pill" style={{ background: 'var(--lima)' }}>● Viva</span><span className="pill" style={{ background: 'var(--mostaza)' }}>● En pausa</span><span className="pill">● Aún no empieza</span><span className="pill borde">🔐 Solo si tú la abres</span></div>
          <p className="chico suave">Tú decides el estado de cada fase: la plataforma no lo adivina. Los ids saltan de 17 a 21 porque así está en tu Mapa Maestro (no existen 18, 19 ni 20). Las fases 9 en adelante todavía no tienen pasos ni entregables: se definen contigo cuando llegue su turno.</p>
          <p className="porque">Pivotar una fase solo tras 3 semanas o más de intentos ajustados. Antes de eso se ajusta un detalle, no se abandona.</p></div></Sube>
      </div>

      <div className="ruta" style={{ marginTop: 28 }}>
        {FASES.map((f, i) => (
          <Sube key={f.id} d={Math.min(i, 6) * 0.03}>
            <button className={`fase ${clase(f)}`} onClick={() => setAbierta(f)} aria-label={`Fase ${f.id}: ${f.nombre}. ${estado(f)}`}>
              <span className="nodo" aria-hidden="true">{cerrada(f) ? '🔐' : f.emoji}</span>
              <span className="card pila-s" style={{ padding: '16px 18px', maxWidth: 620 }}>
                <span className="entre"><span className="eyebrow">Fase {f.id} · {f.mes}</span><span className="pill" style={{ background: clase(f) === 'viva' ? 'var(--lima)' : clase(f) === 'pausa' ? 'var(--mostaza)' : 'var(--crema-2)' }}>{estado(f)}</span></span>
                <span className="h3">{f.nombre}</span>
                <span className="chico suave">{f.objetivo}</span>
                <span className="fila chico">{f.sinPuntos && <span className="pill borde">sin puntos</span>}{registros(f.id) > 0 && <span className="pill borde">{registros(f.id)} registros</span>}{f.id <= 4 && <span className="pill borde">{xp[f.id - 1].xp} XP</span>}{!depsOk(f) && <span className="pill borde">espera a: fase {f.deps.join(' y ')}</span>}</span>
              </span>
            </button>
          </Sube>
        ))}
      </div>

      <Hoja abierta={!!abierta} cerrar={() => setAbierta(null)} titulo={abierta ? `${abierta.emoji} ${abierta.nombre}` : ''}>
        {abierta && (cerrada(abierta) ? (
          <div className="pila">
            <p>Esta fase toca temas delicados. <b>Solo se abre si tú quieres</b>, cuando quieras, y se puede volver a cerrar. No da puntos, no tiene retos ni rachas.</p>
            <p className="porque">Aquí lo más sano es ir acompañada: una psicóloga o psicólogo especializado puede dar lo que una app no puede. La plataforma solo te guarda el espacio.</p>
            <div className="fila"><button className="btn" onClick={() => { s.poner('fasesAbiertas', [...s.fasesAbiertas, abierta.id]); decir('Abierta. A tu ritmo, sin apuro 🤍') }}>Abrirla</button><button className="btn linea" onClick={() => setAbierta(null)}>Ahora no</button></div>
          </div>
        ) : (
          <div className="pila">
            <p>{abierta.objetivo}</p>
            <div className="dos"><div className="item"><span className="eyebrow">Mes previsto</span><b>{abierta.mes}</b></div><div className="item"><span className="eyebrow">Depende de</span><b>{abierta.depende}</b></div></div>
            <div className="pila-s"><span className="eyebrow">Entregables</span>
              {abierta.entregables.length ? <div className="lista">{abierta.entregables.map((e) => <div key={e} className="item blanco chico">◦ {e}</div>)}</div> : <div className="vacio chico">Por definir contigo. Hoy solo existe su propósito.</div>}
            </div>
            {abierta.nota && <p className="porque">{abierta.nota}</p>}
            <div className="pila-s"><span className="eyebrow">🧰 Herramienta de esta fase</span><HerramientaFase fase={abierta.id} /></div>
            <div className="pila-s"><span className="eyebrow">Estado (lo decides tú)</span>
              <div className="fila">{ESTADOS.map((e) => <button key={e} className="pill" aria-pressed={estado(abierta) === e} onClick={() => s.poner('fasesEstado', { ...s.fasesEstado, [abierta.id]: e })}>{e}</button>)}</div>
            </div>
            {abierta.optIn && <button className="btn linea s" onClick={() => { s.poner('fasesAbiertas', s.fasesAbiertas.filter((x) => x !== abierta.id)); setAbierta(null) }}>Volver a cerrarla 🔐</button>}
          </div>
        ))}
      </Hoja>
    </div>
  )
}
