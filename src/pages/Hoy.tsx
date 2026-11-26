import { lazy, Suspense, useMemo, useState } from 'react'
import { irA } from '../App'
import { jugar } from '../components/Juegos'
import { JUEGOS } from '../data/juegos'
import { LETRAS } from '../data/letras'
import { planDeHoy } from '../lib/cerebro'
import { mascotaDice } from '../components/Mascota'
import { TarjetaAncla } from '../components/Seguimiento'
import { bonita } from '../lib/fechas'
import { proximasFechas } from '../store'
import FichaTema from '../components/FichaTema'
import { useCoach, useCultaTab } from '../lib/coachEstado'
import { Anillo, Barra, Cuenta, decir, DeDonde, Sello, sinMovimiento, Sube, Tilt, Titulo3D } from '../components/ui'
import { BLOQUES_CULTA, FRASES_HOY, MUNDOS } from '../data/estructura'
import { bloqueCulta, diaProyecto, hoyISO, larga, mesProyecto, queToca, semanaCulta, sumar } from '../lib/fechas'
import { cumplimiento7, diasEnCero, dominioVoz, fotosGuardadas, nivelDe, puntosDia, racha, repasosPendientes, siguientePilar, useDatos, vivo, xpCulta, xpLuzmila, xpZorro } from '../store'

const Hero3D = lazy(() => import('../components/Hero3D'))

export const leerArchivo = (file: File, importar: (j: any) => void) => {
  const r = new FileReader()
  r.onload = () => { try { importar(JSON.parse(String(r.result))); decir(<>Listo, <b>todo tu proyecto</b> ya vive aquí 💛</>, true) } catch { decir('Ese archivo no se pudo leer. ¿Es el .json de respaldo?') } }
  r.readAsText(file)
}

const saludo = () => { const h = new Date().getHours(); return h < 6 ? 'Es tardecito' : h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches' }

export default function Hoy() {
  const s = useDatos()
  const hoy = hoyISO()
  const fotos = useMemo(fotosGuardadas, [s.cargado])
  const xp = xpLuzmila(s)
  const niv = nivelDe(xp.total)
  const c = s.checkins[hoy] || {}
  const toca = queToca(hoy)
  const culta = xpCulta(s), zorro = xpZorro(s), voz = dominioVoz(s)
  const pilar = siguientePilar(s)
  const enCero = diasEnCero(s)
  const c7 = cumplimiento7(s)
  const rach = racha(s)
  const noche = new Date().getHours() >= 21
  const [simple, setSimple] = useState(true)

  const evidencias = s.expediente.filter((e) => !e.sensible)
  const semilla = Number(hoy.replaceAll('-', ''))
  const evid = evidencias.length ? evidencias[semilla % evidencias.length] : null
  const chip = s.chips.length ? s.chips[(semilla * 7) % s.chips.length] : null
  const reto = JUEGOS[semilla % JUEGOS.length]
  const plan = useMemo(() => planDeHoy(s), [s.checkins, s.culta.sesiones, s.voz, s.ajustes.reingreso, s.evaluaciones, s.zorro.bitacora, hoy])
  const abrirCoach = useCoach((x) => x.abrir)
  const hacer = (p: any) => { if (p.ir.tipo === 'juego') jugar(p.ir.juego); else if (p.ir.tipo === 'coach') { abrirCoach(p.ir.modo, p.ir.tema || ''); irA('coach') } else irA(p.ir.ruta) }
  const repasos = repasosPendientes(s.culta.sesiones).length + repasosPendientes(s.voz.palabras).length

  const marcar = (k: 'manana' | 'comida' | 'noche') => {
    const era = !!c[k]
    const { retomo } = s.checkin(hoy, { [k]: !era })
    if (retomo) mascotaDice('¡Volviste! Y volver vale +3: más que no fallar nunca 🛟', 'fiesta')
    else if (!era && puntosDia({ ...c, [k]: true }) === 3) mascotaDice('¡Tres de tres hoy! Así se ve un día vivo 🌟', 'fiesta')
    else if (!era) mascotaDice(k === 'noche' ? 'Celular afuera, descanso adentro. Buenas noches, corazón ✈️' : k === 'comida' ? 'Comida ancla, hecha. Así se sostiene el día 🍽️' : '¡Modo Poderosa activado! Buen comienzo 🌅', 'feliz')
    if (retomo) decir(<>Volviste. <b>+3 por retomar</b> — vale más que no fallar nunca 🛟</>, true)
    else if (!era) decir(<><b>+1</b> · {k === 'noche' ? 'Zombie no decide. Decide Luzmila.' : k === 'comida' ? 'Comida ancla, hecha.' : 'Modo Poderosa, activado.'}</>, puntosDia({ ...c, [k]: true }) === 3)
  }

  return (
    <div className={`pagina ${s.ajustes.minimo ? 'hoy-min' : ''}`}>
      <section className="hero">
        {sinMovimiento() ? <div className="hero-plano"><Titulo3D texto={s.perfil.nombre} nombre /></div> : <Suspense fallback={<div className="hero-plano"><Titulo3D texto={s.perfil.nombre} nombre /></div>}><Hero3D fotos={fotos} nombre={s.perfil.nombre} letra={(s.ajustes as any).letraNombre || 'montserrat'} /></Suspense>}
        <div className="hero-txt">
          <div className="entre" style={{ alignItems: 'start' }}>
            <div className="pila-s">
              <span className="eyebrow">Proyecto Luzmila · día {diaProyecto()} · mes {mesProyecto()}</span>
              <p className="serif" style={{ fontSize: 'clamp(24px, 4vw, 40px)' }}>{saludo()}, corazón.</p>
            </div>
            <span className="pill tinta" style={{ textTransform: 'capitalize' }}>{larga(hoy)}</span>
          </div>
          <div className="fila" style={{ justifyContent: 'space-between', alignItems: 'end' }}>
            <div className="card vidrio" style={{ padding: '14px 18px', borderRadius: 22 }}>
              <span className="eyebrow">Nivel</span>
              <div className="h3">{niv.actual.emoji} {niv.actual.nombre}</div>
              <div className="chico suave"><Cuenta n={xp.total} /> XP{niv.siguiente && <> · faltan {niv.faltan} para {niv.siguiente.emoji}</>}</div>
            </div>
            <div className="fila"><button className="pill" style={{ background: 'rgba(255,255,255,.85)' }} aria-label="Cambiar la letra de tu nombre" onClick={() => { const i = LETRAS.findIndex((l) => l.id === ((s.ajustes as any).letraNombre || 'montserrat')); s.poner('ajustes.letraNombre', LETRAS[(i + 1) % LETRAS.length].id) }}>Aa · cambiar letra</button><span className="pill borde chico" style={{ background: 'rgba(255,255,255,.7)' }}>↔ arrastra tu nombre</span></div>
          </div>
        </div>
      </section>

      {!s.cargado && (
        <Sube className="card color pila" style={{ marginTop: 18, ['--mundo' as any]: 'var(--mostaza)' }}>
          <h2 className="h2">Primero, trae tu archivo personal 🗝️</h2>
          <p>Tus registros y tu Expediente no están publicados en internet: viven en un archivo privado (<b>luzmila-datos.json</b>). Cárgalo una vez y se queda guardado en este dispositivo.</p>
          <div className="fila">
            <label className="btn" style={{ cursor: 'pointer' }}>Cargar mi archivo<input type="file" accept="application/json,.json" className="sr" onChange={(e) => e.target.files?.[0] && leerArchivo(e.target.files[0], s.importar)} /></label>
            <button className="btn linea" onClick={() => s.poner('cargado', true)}>Empezar en blanco</button>
          </div>
          <p className="porque" style={{ borderColor: 'var(--tinta)' }}>¿Por qué así? Porque lo tuyo es tuyo: nadie más puede verlo, ni siquiera quien abra esta página.</p>
        </Sube>
      )}

      {s.cargado && s.ajustes.reingreso && (
        <Sube className="card tinta pila" style={{ marginTop: 18 }}>
          <div className="fila"><span className="pill" style={{ background: 'var(--lima)' }}>🚪 Modo Reingreso</span><span className="chico suave">semana 1</span></div>
          <h2 className="display" style={{ fontSize: 'clamp(34px, 6vw, 68px)' }}>Volviste. Eso ya cuenta.</h2>
          <p style={{ maxWidth: 680 }}>No se empieza de cero ni se suma todo de golpe. Tus <b style={{ color: 'var(--titulo)' }}>{xp.total} XP</b> siguen aquí: los puntos nunca se restan. Esta semana solo va la <b>Fase 1 en versión simple</b>; lo demás espera sin culpa.</p>
          <div className="fila">
            {['📵 Celular fuera del cuarto', '🍽️ Una comida ancla', '🌅 Una acción de mañana', '⏱️ Check-in de 10 segundos'].map((t) => <span key={t} className="pill" style={{ background: 'rgba(255,255,255,.9)' }}>{t}</span>)}
          </div>
          <p className="porque" style={{ borderColor: 'var(--lima)', color: 'var(--tinta-2)' }}>¿Por qué tan poquito? Tu propio protocolo: tras semanas sin tocar, se retoman 1–2 fases durante una semana. Querer sumar todo a la vez es justo lo que lo hizo caer.</p>
          <div><button className="btn claro s" onClick={() => { s.poner('ajustes.reingreso', false); decir('Modo Reingreso cerrado. Vamos con calma 🌱') }}>Ya pasé mi semana 1 → ver todo</button></div>
        </Sube>
      )}

      <div className="cinta extra" aria-hidden="true"><div>{[...FRASES_HOY, ...FRASES_HOY].map((t, i) => <span key={i}>{t} <i>✦</i></span>)}</div></div>

      <div className="bento" style={{ marginTop: 18 }}>
        {s.cargado && <Sube className="c12">
          <Tilt className="tinta pila" style={{ ['--mundo' as any]: 'var(--lima)' }}>
            <div className="entre"><span className="eyebrow">🧠 Tu plan de hoy · armado con tus datos</span><button className="pill" onClick={() => irA('coach')}>Abrir Coach →</button></div>
            <div className="plan">{plan.pasos.map((p, i) => (
              <button key={p.id} className="paso" onClick={() => hacer(p)}>
                <span className="n">{i + 1}</span><span className="e" aria-hidden="true">{p.emoji}</span>
                <span className="pila-s"><b>{p.titulo}</b><span className="chico">{p.detalle}</span><span className="chico por">Por qué: {p.por}</span></span>
              </button>
            ))}</div>
            {plan.tema && <FichaTema tema={plan.tema.tema} bloque={plan.tema.bloque as any} titulo={false} />}
            {plan.tema && <div><button className="pill" onClick={() => { useCultaTab.getState().poner('ruleta'); irA('culta') }}>🎡 No me late este tema: girar la ruleta</button></div>}
          </Tilt>
        </Sube>}
        {s.cargado && <Sube className="c7"><div className="card pila" style={{ height: '100%' }}>
          <div className="entre"><span className="eyebrow">📌 Próximas fechas</span><button className="pill" onClick={() => irA('agenda')}>Agenda →</button></div>
          {proximasFechas(s).slice(0, 3).length ? proximasFechas(s).slice(0, 3).map((x) => <div key={x.id} className="item chico" style={{ background: x.faltan <= 1 ? 'var(--mostaza)' : undefined }}><b>{x.titulo}</b><span className="suave">{bonita(x.fecha)} · {x.faltan < 0 ? `pasó hace ${-x.faltan} d · ¿la cerraste?` : x.faltan === 0 ? 'es hoy' : x.faltan === 1 ? 'mañana' : `en ${x.faltan} días`}</span></div>) : <p className="chico suave">Sin fechas. Agrega la próxima entrega o examen en la Agenda: tú cumples cuando hay fecha.</p>}
        </div></Sube>}
        {s.cargado && <Sube className="c5" d={0.06}><TarjetaAncla compacta /></Sube>}
        <Sube className="c12 extra">
          <Tilt className="color entre" style={{ ['--mundo' as any]: reto.color, flexWrap: 'wrap' }}>
            <div className="fila" style={{ gap: 16, flexWrap: 'nowrap' }}><span className="flota" style={{ fontSize: 54 }} aria-hidden="true">{reto.emoji}</span><div className="pila-s"><span className="eyebrow">Reto de hoy · {reto.seg ? reto.seg + ' segundos' : 'sin reloj'}</span><h2 className="h2">{reto.nombre}</h2><span className="chico">{reto.desc}</span></div></div>
            <div className="fila"><button className="btn" onClick={() => jugar(reto.id)}>▶ Jugar ahora</button><button className="btn claro s" onClick={() => irA('retos')}>Ver los {JUEGOS.length} retos</button></div>
          </Tilt>
        </Sube>
        <Sube className="c7">
          <Tilt className="color pila" style={{ ['--mundo' as any]: 'var(--lima)' }}>
            <div className="entre">
              <div><span className="eyebrow">Check-in · 10 segundos</span><h2 className="h2">¿Cómo va hoy?</h2></div>
              <button className="pill borde" aria-pressed={simple} onClick={() => setSimple(!simple)} title="Versión simple: una sola cosa por ritual">{simple ? '🌱 versión simple' : '💪 versión completa'}</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <button className="tog" aria-pressed={!!c.manana} onClick={() => marcar('manana')}><span className="e" aria-hidden="true">🌅</span><b>Mañana</b><span className="chico">{simple ? 'un vaso de agua' : 'agua + skincare + cama'}</span></button>
              <button className="tog" aria-pressed={!!c.comida} onClick={() => marcar('comida')}><span className="e" aria-hidden="true">🍽️</span><b>Comida ancla</b><span className="chico">almuerzo sentada</span></button>
              <button className="tog" aria-pressed={!!c.noche} onClick={() => marcar('noche')}><span className="e" aria-hidden="true">✈️</span><b>Modo Avión</b><span className="chico">celular fuera del cuarto</span></button>
            </div>
            <div className="entre">
              <button className="pill" aria-pressed={!!c.supervivencia} onClick={() => { s.checkin(hoy, { supervivencia: !c.supervivencia }); if (!c.supervivencia) decir('Anotado: hoy fue modo supervivencia. No cuenta como día en cero 🫶') }}>🛟 Hoy fue modo supervivencia</button>
              <span className="chico"><b>{puntosDia(c)}</b>/3 hoy · racha <b>{rach}</b> {rach === 1 ? 'día' : 'días'}</span>
            </div>
            {noche && <p className="porque" style={{ borderColor: 'var(--tinta)', color: 'var(--tinta)' }}>Ya es de noche: nada exigente a esta hora. Último capítulo, celular afuera, y mañana seguimos.</p>}
            {enCero !== null && enCero >= 2 && !vivo(c) && <p className="porque" style={{ borderColor: 'var(--tinta)', color: 'var(--tinta)' }}>{enCero > 14 ? 'Hace un tiempo que no registras' : `Llevas ${enCero} días sin registrar`}. No pasa nada: para esto existe el protocolo. Marca una sola cosa hoy y ganas <b>+3 por retomar</b>.</p>}
            <DeDonde titulo="¿Cómo se cuenta la racha?">Regla de las 48 h: un día en cero no rompe nada; la racha se pausa recién con 2 seguidos. Cumplimiento de los últimos 7 días: {c7.puntos} de {c7.de} puntos posibles = {c7.pct}%.</DeDonde>
          </Tilt>
        </Sube>

        <Sube className="c5 extra" d={0.08}>
          <Tilt className="pila" style={{ height: '100%' }}>
            <span className="eyebrow">Luzmila Level Up</span>
            <div className="fila" style={{ gap: 18 }}>
              <Anillo valor={niv.progreso} tam={148} color="var(--ciruela)"><div><div className="num" style={{ fontSize: 46 }}><Cuenta n={xp.total} /></div><div className="eyebrow">XP</div></div></Anillo>
              <div className="pila-s crece">
                <div className="h3">{niv.actual.emoji} {niv.actual.nombre}</div>
                <p className="serif" style={{ fontSize: 20 }}>“{niv.actual.frase}”</p>
                {niv.siguiente && <p className="chico suave">Faltan <b>{niv.faltan}</b> para {niv.siguiente.emoji} {niv.siguiente.nombre}</p>}
              </div>
            </div>
            <DeDonde><table className="t"><tbody>{xp.partes.map((p) => <tr key={p.nombre}><td>{p.nombre}</td><td className="mono">{p.xp}</td></tr>)}<tr><th>Total</th><th className="mono">{xp.total}</th></tr></tbody></table><p style={{ marginTop: 6 }}>Los puntos ganados nunca se restan.</p></DeDonde>
          </Tilt>
        </Sube>

        <Sube className="c5 extra">
          <Tilt className="color pila" style={{ height: '100%', ['--mundo' as any]: toca === 'zorro' ? 'var(--mandarina)' : 'var(--lila)' }}>
            <span className="eyebrow">Hoy toca</span>
            {s.ajustes.reingreso ? (
              <><h2 className="display" style={{ fontSize: 'clamp(40px, 6vw, 64px)' }}>Solo lo mínimo 🌱</h2><p>En la alternancia hoy caería <b>{toca === 'zorro' ? '🦊 Zorro' : '🎓 Culta'}</b>, pero en Reingreso es opcional: solo si te provoca.</p></>
            ) : toca === 'zorro' ? (
              <><h2 className="display" style={{ fontSize: 'clamp(44px, 7vw, 76px)' }}>🦊 Zorro</h2><p>Pilar sugerido: <b>{pilar.emoji} {(pilar as any).nombre || pilar.id}</b> — {pilar.accion}. 5–10 min.</p></>
            ) : (
              <><h2 className="display" style={{ fontSize: 'clamp(44px, 7vw, 76px)' }}>🎓 Culta</h2><p>Semana {semanaCulta()}: toca <b>{BLOQUES_CULTA[bloqueCulta()].emoji} {BLOQUES_CULTA[bloqueCulta()].nombre}</b>, y cierras con un micro-ejercicio de Bloque 3. El tema lo eliges tú (o “sorpréndeme”).</p></>
            )}
            <div className="fila"><button className="btn" onClick={() => irA(toca === 'zorro' ? 'zorro' : 'culta')}>Ir a {toca === 'zorro' ? 'Zorro' : 'Culta'} →</button><button className="btn linea s" onClick={() => irA('calendario')}>Ver calendario</button></div>
            <DeDonde titulo="¿Cómo sé qué toca?">Culta y Zorro alternan día por medio desde el sábado 29 de agosto (Culta) y el domingo 30 (Zorro). Mañana toca {queToca(sumar(hoy, 1)) === 'zorro' ? 'Zorro' : 'Culta'}.</DeDonde>
          </Tilt>
        </Sube>

        <Sube className="c7 extra" d={0.08}>
          <Tilt className="color pila" style={{ height: '100%', ['--mundo' as any]: 'var(--rosa)' }}>
            <div className="entre"><span className="eyebrow">Esto también cuenta</span><button className="btn claro s" onClick={() => irA('expediente')}>Abrir Expediente</button></div>
            {evid ? (
              <><p className="serif" style={{ fontSize: 'clamp(24px, 3.6vw, 38px)' }}>“{evid.entrada}”</p>
                <div className="fila"><span className="pill tinta">{evid.tipo}</span><span className="pill" style={{ background: 'rgba(255,255,255,.6)' }}>{evid.fecha.length > 12 ? evid.fecha : evid.fecha}</span></div>
                {evid.contradice && <p className="chico">Contradice la idea de: <b>“{evid.contradice}”</b></p>}</>
            ) : <p className="serif" style={{ fontSize: 28 }}>Aquí aparecerá cada día una prueba real de quién eres.</p>}
          </Tilt>
        </Sube>

        {[
          { m: 'culta', xp: culta.total, t: culta.actual.nombre, sub: culta.siguiente ? `faltan ${culta.faltan} XP` : 'nivel máximo', p: culta.progreso, extra: `${s.culta.sesiones.length} sesiones` },
          { m: 'zorro', xp: zorro.total, t: zorro.nombre || `Nivel ${zorro.nivel}`, sub: `faltan ${zorro.faltan} XP`, p: zorro.progreso, extra: `${s.zorro.bitacora.length} registros` },
          { m: 'voz', xp: voz.dominadas, t: `Nivel ${voz.nivel} · por dominio`, sub: 'palabras dominadas', p: voz.progreso, extra: `${s.voz.semanasCompletas} semanas completas` },
        ].filter((x) => (s.modulos as any)[x.m] !== false).map((x, i) => (
          <Sube className="c4 extra" d={i * 0.07} key={x.m}>
            <Tilt as="button" className="pila" style={{ width: '100%', textAlign: 'left', height: '100%' }} onClick={() => irA(x.m as any)}>
              <div className="entre"><span className="pill mundo" style={{ ['--mundo' as any]: (MUNDOS as any)[x.m].color }}>{(MUNDOS as any)[x.m].emoji} {(MUNDOS as any)[x.m].nombre}</span><span className="chico suave">{x.extra}</span></div>
              <div className="fila" style={{ alignItems: 'end' }}><span className="num" style={{ fontSize: 64 }}><Cuenta n={x.xp} /></span><span className="chico suave" style={{ paddingBottom: 8 }}>{x.m === 'voz' ? x.sub : 'XP'}</span></div>
              <div style={{ ['--mundo' as any]: (MUNDOS as any)[x.m].color }}><Barra v={x.p} mundo /></div>
              <div className="entre"><b className="chico">{x.t}</b><span className="chico suave">{x.m === 'voz' ? '' : x.sub}</span></div>
            </Tilt>
          </Sube>
        ))}

        <Sube className="c7 extra">
          <Tilt className="pila" style={{ height: '100%' }}>
            <span className="eyebrow">Chip de bolsillo</span>
            {chip ? <><p className="display" style={{ fontSize: 'clamp(28px, 4.4vw, 48px)' }}>“{chip.chip}”</p><p className="chico suave">Para cuando: {chip.situacion}</p><p className="porque">{chip.porque}</p></> : <p className="display" style={{ fontSize: 40 }}>“{FRASES_HOY[semilla % FRASES_HOY.length]}”</p>}
            <div className="fila"><button className="btn mundo s" style={{ ['--mundo' as any]: 'var(--rosa)' }} onClick={() => irA('expediente')}>🛟 SOS: ¿qué me digo ahora?</button>{repasos > 0 && !s.ajustes.reingreso && <button className="pill" onClick={() => irA('culta')}>🔁 {repasos} repaso{repasos > 1 ? 's' : ''} listo{repasos > 1 ? 's' : ''}</button>}</div>
          </Tilt>
        </Sube>

        <Sube className="c5 extra" d={0.08}>
          <Tilt className="color pila" style={{ height: '100%', ['--mundo' as any]: 'var(--celeste)' }}>
            <span className="eyebrow">Tu rincón</span>
            <div className="fila" style={{ gap: 4 }}>
              <Sello texto="hecha a tu medida · con calma y con risa · " foto={fotos[3]} emoji="🌸" tam={124} />
              <Sello texto="culta y alturada · camino con desvíos · " foto={fotos[1]} emoji="🦊" tam={124} />
            </div>
            <div className="fila">{(s.perfil.rincon.length ? s.perfil.rincon : ['tu espacio']).map((r: string) => <span key={r} className="pill" style={{ background: 'rgba(255,255,255,.65)' }}>{r}</span>)}</div>
            <p className="serif" style={{ fontSize: 22 }}>Te comparas con tu propio ayer, no con un ideal sin cuerpo.</p>
          </Tilt>
        </Sube>
      </div>
    </div>
  )
}
