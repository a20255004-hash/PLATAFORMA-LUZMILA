import { useRef, useState } from 'react'
import { Sube, Titulo3D, decir, Tilt } from '../components/ui'
import { mascotaDice } from '../components/Mascota'
import { guardarTablero, leerTablero, useDatos } from '../store'

// Lo que escribiste tú en Notion (Proyecto de Vida, feb 2024; Objetivos 2026). Solo se muestra lo tuyo, tal cual.
const SUENOS = [
  { id: 'eq', e: '⚖️', t: 'Lograr el equilibrio en mi ser', c: 'var(--menta)' },
  { id: 'marca', e: '✨', t: 'Crear mi marca personal', c: 'var(--rosa)' },
  { id: 'indep', e: '🏠', t: 'Ser independiente', c: 'var(--mostaza)' },
  { id: 'libro', e: '📖', t: 'Escribir un libro', c: 'var(--lila)' },
  { id: 'corto', e: '🎬', t: 'Un cortometraje sobre mi vida, mis reflexiones y aprendizajes', c: 'var(--celeste)' },
  { id: 'auto', e: '🚗', t: 'Auto y moto propios', c: 'var(--durazno)' },
  { id: 'dipl', e: '🌍', t: 'Ser diplomática', c: 'var(--celeste)' },
  { id: 'refo', e: '🏛️', t: 'Reformar el sistema penitenciario y judicial', c: 'var(--lila)' },
  { id: 'poli', e: '🛡️', t: 'Ser policía', c: 'var(--menta)' },
  { id: 'empr', e: '🚀', t: 'Ser una gran empresaria exitosa', c: 'var(--mostaza)' },
  { id: 'coach', e: '🎤', t: 'Ser coach: empoderamiento, salud mental, marca personal, oratoria y mentalidad', c: 'var(--rosa)' },
]
const FRASES = ['Soy una persona segura de mí misma', 'Soy una persona fuerte', 'Soy capaz de ver con claridad mi propósito y accionar para lograrlo', 'Recuerda que tienes un gran potencial, que no hay límites y que vas a lograr todo cuanto quieras']

const reducir = (f: File, max = 520): Promise<string> => new Promise((ok, no) => {
  const r = new FileReader()
  r.onload = () => { const img = new Image(); img.onload = () => { const k = Math.min(1, max / Math.max(img.width, img.height)); const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height); ok(c.toDataURL('image/jpeg', 0.72)) }; img.onerror = no; img.src = String(r.result) }
  r.onerror = no; r.readAsDataURL(f)
})

export default function Tablero() {
  const s = useDatos()
  const [fotos, setFotos] = useState<any[]>(leerTablero)
  const ref = useRef<HTMLInputElement>(null)
  const oculto = (id: string) => !!s.fasesChecks['tab:' + id]
  const ocultar = (id: string) => s.poner('fasesChecks', { ...s.fasesChecks, ['tab:' + id]: !oculto(id) })

  const subir = async (lista: FileList | null) => {
    if (!lista?.length) return
    const nuevas: any[] = []
    for (const f of Array.from(lista).slice(0, 6)) { try { nuevas.push({ id: Math.random().toString(36).slice(2, 8), src: await reducir(f), texto: '' }) } catch { /* se salta */ } }
    const todo = [...nuevas, ...fotos]
    if (!guardarTablero(todo)) return decir('No hay más espacio en este dispositivo. Quita alguna imagen vieja 🙂')
    setFotos(todo); decir('Imagen agregada a tu tablero 🖼️', true); mascotaDice('¡Qué lindo se ve tu tablero! Lo que ves, lo vas acercando 🖼️', 'fiesta')
  }
  const editar = (id: string, texto: string) => { const t = fotos.map((f) => (f.id === id ? { ...f, texto } : f)); setFotos(t); guardarTablero(t) }
  const quitar = (id: string) => { const t = fotos.filter((f) => f.id !== id); setFotos(t); guardarTablero(t) }
  const visibles = SUENOS.filter((x) => !oculto(x.id))

  return (
    <div className="pagina">
      <header className="cabeza">
        <span className="eyebrow">Lo que quieres ser, a la vista</span>
        <Titulo3D texto="TABLERO" />
        <p className="serif" style={{ fontSize: 'clamp(22px, 3vw, 32px)', maxWidth: 720 }}>Tus sueños, tal como los escribiste en tu Proyecto de Vida, con tus fotos e imágenes al lado. Para mirarlo cuando dudes.</p>
        <div className="fila"><button className="btn" onClick={() => ref.current?.click()}>🖼️ Agregar imágenes</button><input ref={ref} type="file" accept="image/*" multiple className="sr" onChange={(e) => { subir(e.target.files); e.target.value = '' }} /><span className="chico suave">Se guardan solo en este dispositivo (se reducen para ocupar poco).</span></div>
      </header>

      <div className="tablero">
        {FRASES.map((f, i) => <Sube key={f} d={i * 0.04}><div className="tarjeta-frase" style={{ background: ['var(--lila)', 'var(--menta)', 'var(--celeste)', 'var(--mostaza)'][i] }}><span className="eyebrow">{i < 3 ? 'Tu afirmación' : 'Lo que te dejaste escrito'}</span><p className="display" style={{ fontSize: i === 3 ? 24 : 28 }}>“{f}”</p></div></Sube>)}
        {fotos.map((f, i) => (
          <Sube key={f.id} d={i * 0.03}><figure className="polaroid" style={{ ['--giro' as any]: `${(i % 5) - 2}deg` }}>
            <img src={f.src} alt={f.texto || 'Imagen de tu tablero'} loading="lazy" />
            <input value={f.texto} placeholder="Escribe algo…" aria-label="Pie de foto" onChange={(e) => editar(f.id, e.target.value)} />
            <button className="quitar" aria-label="Quitar imagen" onClick={() => quitar(f.id)}>✕</button>
          </figure></Sube>
        ))}
        {visibles.map((x, i) => (
          <Sube key={x.id} d={i * 0.03}><Tilt className="sueno" style={{ background: x.c, ['--giro' as any]: `${(i % 4) - 1.5}deg` }}>
            <span className="emoji-grande" aria-hidden="true">{x.e}</span><b>{x.t}</b>
            <button className="quitar" aria-label="Ocultar este sueño" onClick={() => ocultar(x.id)}>✕</button>
          </Tilt></Sube>
        ))}
      </div>
      <p className="porque" style={{ marginTop: 20 }}>Estas tarjetas salen de lo que tú escribiste en Notion (Proyecto de Vida y Objetivos 2026). Si alguna ya no te representa, ocúltala: este tablero es tuyo y cambia contigo. </p>
      {SUENOS.some((x) => oculto(x.id)) && <button className="pill" onClick={() => s.poner('fasesChecks', Object.fromEntries(Object.entries(s.fasesChecks).filter(([k]) => !k.startsWith('tab:'))))}>Mostrar las tarjetas ocultas ({SUENOS.filter((x) => oculto(x.id)).length})</button>}
    </div>
  )
}
