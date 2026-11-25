import { useState } from 'react'
import { Campo, decir, Sube, Titulo3D } from '../components/ui'
import { LETRAS, letraDe } from '../data/letras'
import { hoyISO } from '../lib/fechas'
import { exportar, useDatos } from '../store'
import { leerArchivo } from './Hoy'

export default function Ajustes() {
  const s = useDatos()
  const [mod, setMod] = useState({ nombre: '', emoji: '🌱', nota: '' })
  const bajar = () => {
    const blob = new Blob([JSON.stringify(exportar(s))], { type: 'application/json' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `luzmila-respaldo-${hoyISO()}.json`; a.click(); URL.revokeObjectURL(a.href)
    decir('Respaldo descargado. Guárdalo donde solo tú lo veas 🗝️')
  }
  const peso = (() => { try { return Math.round((JSON.stringify(exportar(s)).length / 1024)) } catch { return 0 } })()
  const cuenta = [['check-ins', Object.keys(s.checkins).length], ['evidencias', s.expediente.length], ['sesiones Culta', s.culta.sesiones.length], ['registros Zorro', s.zorro.bitacora.length], ['entradas de bitácora', s.bitacora.length], ['chips', s.chips.length]]

  return (
    <div className="pagina">
      <header className="cabeza">
        <span className="eyebrow">Tu información es tuya</span>
        <Titulo3D texto="DATOS" />
        <p className="serif" style={{ fontSize: 'clamp(22px, 3vw, 32px)', maxWidth: 720 }}>Todo se guarda en este dispositivo. Nada sale a internet, nadie más lo ve.</p>
      </header>

      <div className="bento">
        <Sube className="c7"><div className="card color pila"><h2 className="h2">Respaldo y traslado</h2>
          <p className="chico">Como todo vive aquí, el celular y la laptop no se sincronizan solos. Para pasar tu progreso: descarga el respaldo en uno y cárgalo en el otro. Conviene bajarlo cada domingo.</p>
          <div className="fila"><button className="btn" onClick={bajar}>⬇ Descargar respaldo</button><label className="btn claro" style={{ cursor: 'pointer' }}>⬆ Cargar archivo<input type="file" accept="application/json,.json" className="sr" onChange={(e) => { const a = e.target.files?.[0]; if (a && (!s.cargado || confirm('Esto reemplaza lo que hay en este dispositivo por el archivo. ¿Seguimos?'))) leerArchivo(a, s.importar); e.target.value = '' }} /></label></div>
          <div className="fila">{cuenta.map(([t, n]) => <span key={t} className="pill" style={{ background: 'rgba(255,255,255,.65)' }}><b className="mono">{n}</b> {t}</span>)}<span className="pill borde">{peso} KB</span></div>
        </div></Sube>

        <Sube className="c5" d={0.05}><div className="card pila" style={{ height: '100%' }}><h2 className="h2">Preferencias</h2>
          <Campo label="¿Cómo te llamo?"><input value={s.perfil.nombre} onChange={(e) => s.poner('perfil.nombre', e.target.value.slice(0, 12) || 'Luzmila')} /></Campo>
          <Campo label="Tu rincón (separado por comas)"><input value={s.perfil.rincon.join(', ')} onChange={(e) => s.poner('perfil.rincon', e.target.value.split(',').map((x) => x.trim()).filter(Boolean))} /></Campo>
          <div className="pila-s"><span className="eyebrow">Letra de tu nombre</span><div className="letras">{LETRAS.map((l) => <button key={l.id} style={{ fontFamily: l.css, fontWeight: l.peso }} aria-pressed={((s.ajustes as any).letraNombre || 'montserrat') === l.id} onClick={() => s.poner('ajustes.letraNombre', l.id)}>Luzmila</button>)}</div></div>
          <div className="pila-s"><span className="eyebrow">Letra de los títulos</span><div className="letras">{LETRAS.map((l) => <button key={l.id} style={{ fontFamily: l.css, fontWeight: l.peso, textTransform: 'uppercase', fontSize: 16 }} aria-pressed={((s.ajustes as any).letraTitulos || 'condensada') === l.id} onClick={() => s.poner('ajustes.letraTitulos', l.id)}>{letraDe(l.id).nombre}</button>)}</div></div>
          <div className="fila"><button className="pill" aria-pressed={s.ajustes.reingreso} onClick={() => s.poner('ajustes.reingreso', !s.ajustes.reingreso)}>🚪 Modo Reingreso {s.ajustes.reingreso ? 'activo' : 'apagado'}</button></div>
          <p className="chico suave">Las animaciones y el 3D se reducen solos si tu dispositivo tiene activado “reducir movimiento”.</p>
        </div></Sube>

        <Sube className="c7"><div className="card pila"><h2 className="h2">Módulos</h2><p className="chico suave">La plataforma crece por módulos. Apaga los que no uses ahora (no se borra nada) y anota los que quieras sumar.</p>
          <div className="fila">{([['culta', '🎓 Culta'], ['zorro', '🦊 Zorro'], ['voz', '🗣️ Voz']] as const).map(([k, t]) => <button key={k} className="pill" aria-pressed={(s.modulos as any)[k] !== false} onClick={() => s.poner('modulos.' + k, (s.modulos as any)[k] === false)}>{t} · {(s.modulos as any)[k] !== false ? 'visible' : 'oculto'}</button>)}</div>
          <div className="pila-s"><span className="eyebrow">Ideas de módulos nuevos</span>
            {s.modulos.extra.map((m: any) => <div key={m.id} className="item entre"><span><b>{m.emoji} {m.nombre}</b><br /><span className="chico suave">{m.nota}</span></span><button className="pill borde" onClick={() => s.quitar('modulos.extra', m.id)}>✕</button></div>)}
            <div className="dos"><Campo label="Nombre"><input value={mod.nombre} placeholder="Ej. Idiomas, Finanzas, Marca personal" onChange={(e) => setMod({ ...mod, nombre: e.target.value })} /></Campo><Campo label="Emoji"><input value={mod.emoji} onChange={(e) => setMod({ ...mod, emoji: e.target.value.slice(0, 4) })} /></Campo></div>
            <Campo label="¿Qué registraría?"><input value={mod.nota} onChange={(e) => setMod({ ...mod, nota: e.target.value })} /></Campo>
            <div><button className="btn s" disabled={!mod.nombre.trim()} onClick={() => { s.agregar('modulos.extra', mod); setMod({ nombre: '', emoji: '🌱', nota: '' }); decir('Idea anotada. Se construye cuando toque, no antes 🌱') }}>Anotar idea</button></div>
          </div>
          <p className="porque">Cada módulo es un archivo aparte que se conecta al menú y a los datos: se puede agregar uno sin rehacer el resto.</p></div></Sube>

        <Sube className="c5" d={0.05}><div className="card pila" style={{ height: '100%' }}><h2 className="h2">Empezar de cero</h2><p className="chico suave">Borra todo lo de este dispositivo. Descarga un respaldo antes: esto no se puede deshacer.</p>
          <div><button className="btn linea" onClick={() => { if (confirm('¿Borrar todos los datos de este dispositivo?') && confirm('¿Segura? No se puede deshacer.')) { s.borrarTodo(); decir('Listo, en blanco.') } }}>Borrar mis datos de aquí</button></div></div></Sube>
      </div>
    </div>
  )
}
