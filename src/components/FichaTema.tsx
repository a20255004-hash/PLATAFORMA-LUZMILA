import { useState } from 'react'
import { irA } from '../App'
import { useCoach, useQuiz } from '../lib/coachEstado'
import { enlacesFicha, fichaDe, linkWikipedia, nucleo, ultimoQuiz } from '../lib/recursos'
import { BLOQUES_CULTA } from '../data/estructura'
import { useDatos } from '../store'

type B = 'B1' | 'B2' | 'B3'
const cache = new Map<string, any>()

/** Tarjeta de estudio de un tema: resumen, enlaces concretos, extracto de Wikipedia y acciones (quiz, evaluar). */
export default function FichaTema({ tema, bloque, onRegistrar, titulo = true }: { tema: string; bloque: B; onRegistrar?: () => void; titulo?: boolean }) {
  const quizzes = useDatos((s) => s.quizzes)
  const abrirQuiz = useQuiz((x) => x.abrir)
  const abrirCoach = useCoach((x) => x.abrir)
  const f = fichaDe(tema)
  const enlaces = enlacesFicha(tema, bloque)
  const wiki = linkWikipedia(tema)
  const [ext, setExt] = useState<any>(null)
  const [cargando, setCargando] = useState(false)
  const uq = ultimoQuiz(quizzes, tema)

  const traer = async () => {
    if (!wiki) return
    if (cache.has(wiki)) return setExt(cache.get(wiki))
    setCargando(true)
    try {
      const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 8000)
      let r = await fetch(`https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wiki.replaceAll(' ', '_'))}?redirect=true`, { signal: ctl.signal })
      if (!r.ok) { // si el título exacto no existe, buscamos el artículo más cercano
        const b = await (await fetch(`https://es.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(wiki)}&limit=1&format=json&origin=*`, { signal: ctl.signal })).json()
        const t = b?.[1]?.[0]; if (!t) throw new Error('sin resultado')
        r = await fetch(`https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(t.replaceAll(' ', '_'))}?redirect=true`, { signal: ctl.signal })
      }
      clearTimeout(to)
      const j = await r.json()
      const v = { titulo: j.title, texto: j.extract, url: j.content_urls?.desktop?.page }
      cache.set(wiki, v); setExt(v)
    } catch { setExt({ error: true }) }
    setCargando(false)
  }

  return (
    <div className="ficha pila">
      {titulo && <h3 className="h3">{nucleo(tema)}</h3>}
      {f ? <div className="resumen-box"><span className="eyebrow">Resumen en 30 segundos</span><p>{f.resumen}</p></div>
        : <p className="chico suave">Este tema no está en el temario base, así que no tengo un resumen escrito; te dejo búsquedas dirigidas.</p>}
      <div className="pila-s"><span className="eyebrow">Dónde leerlo</span>
        <div className="enlaces">{enlaces.map((e) => <a key={e.etiqueta} className="enlace" href={e.url} target="_blank" rel="noreferrer noopener" title={e.para}>{e.emoji} {e.etiqueta}</a>)}</div></div>
      {wiki && <div className="pila-s">
        {!ext && <div><button className="pill borde" onClick={traer} disabled={cargando}>{cargando ? 'Buscando…' : '📖 Ver un extracto real de Wikipedia aquí'}</button></div>}
        {ext && !ext.error && <div className="resumen-box"><span className="eyebrow">Wikipedia · {ext.titulo}</span><p>{ext.texto}</p>{ext.url && <a className="enlace" href={ext.url} target="_blank" rel="noreferrer noopener">Abrir artículo completo ↗</a>}</div>}
        {ext?.error && <p className="chico suave">No pude traer el extracto (¿sin internet?). Los enlaces de arriba sí funcionan cuando tengas conexión.</p>}
      </div>}
      <div className="fila">
        {f && <button className="btn" onClick={() => abrirQuiz(tema, bloque)}>🎯 Quiz del tema{uq ? ` · último ${uq.aciertos}/${uq.total}` : ''}</button>}
        <button className="btn claro" onClick={() => { abrirCoach('explicar', tema); irA('coach') }}>🧠 Explicarlo y que me evalúe</button>
        {onRegistrar && <button className="btn linea s" onClick={onRegistrar}>+ Registrar sesión</button>}
        <span className="pill borde" title={BLOQUES_CULTA[bloque].nombre}>{BLOQUES_CULTA[bloque].emoji} {bloque}</span>
      </div>
      <p className="porque">El resumen es mío (para repasar rápido) y el extracto de Wikipedia es real y se trae en vivo. Los enlaces abren búsquedas o artículos: tú verificas y eliges la fuente. Para citar en APA, pídele a Claude la referencia.</p>
    </div>
  )
}
