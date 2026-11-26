import { useMemo, useState } from 'react'
import { Campo, decir, DeDonde, Sube, Tilt, Titulo3D } from '../components/ui'
import { mascotaDice } from '../components/Mascota'
import { aplicar, describir, INSTRUCCION_UNICA, leerBloques, pedidoCulta, pedidoLibre, pedidoReingreso, pedidoSemana, pedidoZorro } from '../lib/puente'
import { useDatos } from '../store'

const copiar = (t: string, ok = 'Copiado: pégalo en tu chat de Claude 📋') => { navigator.clipboard?.writeText(t).then(() => decir(ok), () => decir('No pude copiar solo: selecciona el texto y cópialo.')) }

export default function Puente() {
  const s = useDatos()
  const [tab, setTab] = useState<'pedir' | 'traer' | 'config'>('pedir')
  const [pega, setPega] = useState('')
  const [libre, setLibre] = useState({ tipo: 'explicación de un tema', texto: '' })
  const lectura = useMemo(() => (pega.trim() ? leerBloques(pega) : null), [pega])

  const pedidos = [
    { k: 'semana', e: '🗓️', t: 'Revisión de mi semana', d: 'Mis números de 7 días (sin nada sensible) para que Claude te dé una lectura honesta y el plan siguiente.', f: () => pedidoSemana(s) },
    { k: 'culta', e: '🎓', t: 'Sesión de Culta de hoy', d: 'Con el tema que sugiere la plataforma y el formato de 10 ítems /20.', f: () => pedidoCulta(s) },
    { k: 'zorro', e: '🦊', t: 'Sesión del Zorro de hoy', d: 'El pilar que sigue en la rueda, con feedback de remate.', f: () => pedidoZorro(s) },
    { k: 're', e: '🚪', t: 'Estoy volviendo (Reingreso)', d: 'Para que Claude aplique tu protocolo sin culpa y te diga qué retomar.', f: () => pedidoReingreso(s) },
  ]

  const guardar = () => {
    if (!lectura?.items.length) return
    const r = aplicar(lectura.items)
    setPega('')
    decir(<>Guardado desde Claude: <b>{r.ok}</b> elemento{r.ok === 1 ? '' : 's'}{r.salto.length ? ` (${r.salto.length} saltado${r.salto.length === 1 ? '' : 's'})` : ''}</>, r.ok > 0)
    if (r.ok) mascotaDice(`¡Registré ${r.ok} cosa${r.ok === 1 ? '' : 's'} de tu sesión con Claude! Sin copiar a mano 🎉`, 'fiesta')
  }

  return (
    <div className="pagina">
      <header className="cabeza">
        <span className="eyebrow">Tu chat de Claude ↔ esta plataforma</span>
        <Titulo3D texto="CLAUDE" />
        <p className="serif" style={{ fontSize: 'clamp(22px, 3vw, 32px)', maxWidth: 720 }}>La revisión profunda la hace Claude en tu chat del proyecto. Aquí se prepara el pedido y se trae el resultado, en dos toques.</p>
      </header>

      <div className="tabs" role="tablist" style={{ marginBottom: 18 }}>
        {([['pedir', '📤 Pedirle a Claude'], ['traer', '📥 Traer su resultado'], ['config', '🧭 Configurar mi chat (una vez)']] as const).map(([k, t]) => <button key={k} role="tab" aria-selected={tab === k} aria-pressed={tab === k} className="pill" onClick={() => setTab(k)}>{t}</button>)}
      </div>

      {tab === 'pedir' && (
        <div className="bento">
          {pedidos.map((p, i) => (
            <Sube key={p.k} className="c6" d={i * 0.04}><div className="card pila" style={{ height: '100%' }}>
              <div className="h3">{p.e} {p.t}</div><p className="chico suave">{p.d}</p>
              <details><summary className="chico" style={{ cursor: 'pointer' }}>Ver el texto que se copia</summary><pre className="vista-pedido">{p.f()}</pre></details>
              <div><button className="btn" onClick={() => copiar(p.f())}>📋 Copiar para Claude</button></div>
            </div></Sube>
          ))}
          <Sube className="c12"><div className="card pila">
            <div className="h3">✍️ Revisar un texto mío a fondo</div>
            <div className="dos"><Campo label="Qué es"><select value={libre.tipo} onChange={(e) => setLibre({ ...libre, tipo: e.target.value })}>{['explicación de un tema', 'argumento', 'anécdota con remate', 'texto libre', 'respuesta de entrevista'].map((x) => <option key={x}>{x}</option>)}</select></Campo></div>
            <textarea className="entrada" style={{ fontSize: 16, fontWeight: 500, minHeight: 130 }} value={libre.texto} onChange={(e) => setLibre({ ...libre, texto: e.target.value })} placeholder="Pega o escribe tu texto…" aria-label="Texto a revisar" />
            <div><button className="btn" disabled={libre.texto.trim().length < 10} onClick={() => copiar(pedidoLibre(libre.tipo, libre.texto.trim()))}>📋 Copiar para Claude</button></div>
          </div></Sube>
          <Sube className="c12"><p className="porque">¿Por qué no se conecta sola? Para hablar con Claude desde una página pública haría falta una clave secreta, y cualquiera que abriera la página podría usarla. Copiar y pegar es lo seguro, y tu chat del proyecto ya conoce todo tu contexto. Lo que sí hace la plataforma por su cuenta (Coach, quiz, plan) corre en tu dispositivo y mide la forma, no la verdad.</p></Sube>
        </div>
      )}

      {tab === 'traer' && (
        <div className="bento">
          <Sube className="c7"><div className="card pila" style={{ height: '100%' }}>
            <span className="eyebrow">Pega aquí la respuesta de Claude</span>
            <textarea className="entrada" style={{ fontSize: 15, fontWeight: 500, minHeight: 220, fontFamily: 'ui-monospace, monospace' }} value={pega} onChange={(e) => setPega(e.target.value)} placeholder={'Pega la respuesta completa (o solo el bloque ```luzmila).'} aria-label="Respuesta de Claude" />
            {lectura && <div className="pila-s">
              {lectura.items.length > 0 && <><span className="eyebrow">Voy a guardar ({lectura.items.length})</span>{lectura.items.map((i, k) => <div key={k} className="item chico">{describir(i)}</div>)}</>}
              {lectura.errores.map((e) => <p key={e} className="chico" style={{ background: 'var(--mostaza)', padding: '8px 12px', borderRadius: 12 }}>⚠️ {e}</p>)}
            </div>}
            <div className="fila"><button className="btn" disabled={!lectura?.items.length} onClick={guardar}>💾 Guardar en mi plataforma</button><button className="pill borde" onClick={() => setPega('')}>Limpiar</button></div>
          </div></Sube>
          <Sube className="c5" d={0.05}><Tilt className="color pila" style={{ height: '100%', ['--mundo' as any]: 'var(--celeste)' }}>
            <span className="eyebrow">Cómo funciona</span>
            <p className="chico">1. Haces tu sesión en el chat de Claude.</p>
            <p className="chico">2. Claude termina con un bloque <code>luzmila</code>.</p>
            <p className="chico">3. Pegas todo aquí, ves la vista previa y guardas.</p>
            <p className="porque">Nunca se guarda nada sin que tú lo veas antes. Si falta la nota, no se inventa: se salta.</p>
            <DeDonde titulo="¿Qué se puede traer?">Sesiones de Culta (con los 10 ítems), registros del Zorro, palabras y argumentos de Voz, evidencias del Expediente, distorsiones cazadas y fechas límite.</DeDonde>
          </Tilt></Sube>
        </div>
      )}

      {tab === 'config' && (
        <div className="bento">
          <Sube className="c12"><div className="card pila">
            <span className="eyebrow">Hazlo una sola vez</span>
            <p>Copia este mensaje y pégalo en tu chat de Claude del proyecto. Desde ahí, cada sesión terminará con el bloque listo para esta plataforma.</p>
            <pre className="vista-pedido" style={{ maxHeight: 280 }}>{INSTRUCCION_UNICA}</pre>
            <div><button className="btn" onClick={() => copiar(INSTRUCCION_UNICA, 'Instrucción copiada: pégala una vez en tu chat de Claude 📋')}>📋 Copiar instrucción</button></div>
          </div></Sube>
        </div>
      )}
    </div>
  )
}
