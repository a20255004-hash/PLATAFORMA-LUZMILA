import { useMemo, useState } from 'react'
import { Campo, decir, Sube, Titulo3D, Vacio } from '../components/ui'
import { hoyISO, larga } from '../lib/fechas'
import { useDatos } from '../store'

const ANIMOS = [['🌧️', 'pesado'], ['😶', 'plano'], ['🌤️', 'tranqui'], ['😄', 'bonito'], ['🔥', 'chulísimo']] as const
const TIPOS = ['Diario', 'Reflexión', 'Gratitud', 'Disfrute (sin puntos)', 'Cierre de semana']
const GUIAS: Record<string, string[]> = {
  Diario: ['¿Qué pasó hoy, tal cual?', '¿Qué comiste rico?', '¿Qué fue lo mejorcito del día?'],
  Reflexión: ['¿Qué me dije cuando algo salió mal?', '¿Qué le diría a una amiga en lo mismo?', '¿Qué fue responsabilidad mía y qué no?'],
  Gratitud: ['Gracias por…', 'Algo pequeño que hoy sí estuvo'],
  'Disfrute (sin puntos)': ['¿Qué hice solo porque sí?', '¿Cómo se sintió en el cuerpo?'],
  'Cierre de semana': ['Lo que sí hice esta semana', 'Lo que suelto sin culpa', 'Una sola cosa para la que viene'],
}

export default function Bitacora() {
  const s = useDatos()
  const [f, setF] = useState<any>({ fecha: hoyISO(), tipo: 'Diario', animo: 2, titulo: '', texto: '' })
  const [filtro, setFiltro] = useState('Todo')
  const [q, setQ] = useState('')
  const lista = useMemo(() => [...s.bitacora].sort((a, b) => (a.fecha < b.fecha ? 1 : -1)).filter((x) => (filtro === 'Todo' || x.tipo === filtro) && (!q || (x.texto + x.titulo).toLowerCase().includes(q.toLowerCase()))), [s.bitacora, filtro, q])

  const guardar = () => {
    if (!f.texto.trim()) return decir('Aunque sea una línea 🙂')
    s.agregar('bitacora', { ...f, texto: f.texto.trim() })
    if (f.tipo.startsWith('Disfrute')) s.agregar('disfrute', { fecha: f.fecha, texto: f.texto.trim().slice(0, 120) })
    setF({ fecha: hoyISO(), tipo: f.tipo, animo: 2, titulo: '', texto: '' })
    decir('Guardado, corazón. Solo tú lo ves 📓')
  }
  const aExpediente = (x: any) => { s.agregar('expediente', { fecha: x.fecha, entrada: x.titulo || String(x.texto).slice(0, 140), dimension: 'Emocional', tipo: 'Logro personal', contradice: '', impacto: 3, fuente: 'Bitácora' }); decir(<>Esto también cuenta: <b>+1</b> al Expediente 🕵️</>, true) }

  return (
    <div className="pagina">
      <header className="cabeza">
        <span className="eyebrow">Privada · vive solo en este dispositivo</span>
        <Titulo3D texto="BITÁCORA" chico />
        <p className="serif" style={{ fontSize: 'clamp(22px, 3vw, 32px)', maxWidth: 720 }}>“Hoy te levantaste…” Escríbete en tú, como siempre lo hiciste. Larga o cortita: las dos valen.</p>
      </header>

      <div className="bento">
        <Sube className="c7"><div className="card color pila">
          <div className="fila">{TIPOS.map((t) => <button key={t} className="pill" aria-pressed={f.tipo === t} onClick={() => setF({ ...f, tipo: t })}>{t}</button>)}</div>
          <div className="dos"><Campo label="Fecha"><input type="date" value={f.fecha} max={hoyISO()} onChange={(e) => setF({ ...f, fecha: e.target.value })} /></Campo><Campo label="Título (opcional)"><input value={f.titulo} placeholder="Un día…" onChange={(e) => setF({ ...f, titulo: e.target.value })} /></Campo></div>
          <div className="pila-s"><span className="campo">¿Cómo estuvo el día?</span><div className="fila" role="radiogroup" aria-label="Ánimo">{ANIMOS.map(([e, n], i) => <button key={n} role="radio" aria-checked={f.animo === i} aria-pressed={f.animo === i} className="pill" onClick={() => setF({ ...f, animo: i })}>{e} {n}</button>)}</div></div>
          <Campo label="Escribe"><textarea style={{ minHeight: 190 }} value={f.texto} placeholder={GUIAS[f.tipo][0]} onChange={(e) => setF({ ...f, texto: e.target.value })} /></Campo>
          <div className="fila">{GUIAS[f.tipo].map((g) => <button key={g} className="pill borde chico" onClick={() => setF({ ...f, texto: (f.texto ? f.texto + '\n\n' : '') + g + ' ' })}>+ {g}</button>)}</div>
          <div className="entre"><span className="chico">{f.texto.trim() ? f.texto.trim().split(/\s+/).length : 0} palabras</span><button className="btn" onClick={guardar}>Guardar</button></div>
          {f.tipo.startsWith('Disfrute') && <p className="porque" style={{ borderColor: 'var(--tinta)', color: 'var(--tinta)' }}>Zona libre de evaluación: los momentos de disfrute no dan puntos a propósito. No tienen que “servir” para nada.</p>}
        </div></Sube>

        <div className="c5 pila">
          <div className="card pila-s"><Campo label="Buscar en tu bitácora"><input value={q} placeholder="una palabra, un nombre…" onChange={(e) => setQ(e.target.value)} /></Campo><div className="fila">{['Todo', ...TIPOS].map((t) => <button key={t} className="pill" aria-pressed={filtro === t} onClick={() => setFiltro(t)}>{t.split(' (')[0]}</button>)}</div><span className="chico suave">{s.bitacora.length} entradas en total</span></div>
          {lista.length ? lista.map((x) => <Sube key={x.id}><div className="card pila-s" style={{ padding: 18 }}>
            <div className="entre"><span className="chico suave" style={{ textTransform: 'capitalize' }}>{ANIMOS[x.animo]?.[0]} {larga(x.fecha)}</span><span className="pill">{x.tipo.split(' (')[0]}</span></div>
            {x.titulo && <div className="h3">{x.titulo}</div>}<p style={{ whiteSpace: 'pre-line' }}>{x.texto}</p>
            <div className="fila"><button className="pill borde" onClick={() => aExpediente(x)}>🕵️ Esto va al Expediente</button><button className="pill borde" onClick={() => confirm('¿Borrar esta entrada?') && s.quitar('bitacora', x.id)}>Borrar</button></div>
          </div></Sube>) : <Vacio>{s.bitacora.length ? 'Nada con ese filtro.' : 'Tu primera entrada puede ser de una sola línea.'}</Vacio>}
        </div>
      </div>
    </div>
  )
}
