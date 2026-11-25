import { useEffect, useMemo, useState } from 'react'
import { Hoja, decir } from './ui'
import { irA } from '../App'
import { useCoach, useQuiz } from '../lib/coachEstado'
import { armarQuiz, fichaDe, nucleo, ultimoQuiz } from '../lib/recursos'
import { hoyISO } from '../lib/fechas'
import { useDatos } from '../store'

/** Quiz de 4 preguntas por tema (2 escritas + 2 «completa la idea» que cambian cada vez). Se monta una vez en App. */
export default function QuizModal() {
  const { tema, k, abierto, cerrar } = useQuiz()
  const s = useDatos()
  const abrirCoach = useCoach((x) => x.abrir)
  const preguntas = useMemo(() => (tema ? armarQuiz(tema) : []), [tema, k])
  const [i, setI] = useState(0)
  const [resp, setResp] = useState<number | null>(null)
  const [aciertos, setAciertos] = useState(0)
  const [fallos, setFallos] = useState<number[]>([])
  const [guardado, setGuardado] = useState(false)
  useEffect(() => { setI(0); setResp(null); setAciertos(0); setFallos([]); setGuardado(false) }, [k])
  const fin = preguntas.length > 0 && i >= preguntas.length
  const previo = ultimoQuiz(s.quizzes, tema)
  const p = preguntas[i]
  const f = tema ? fichaDe(tema) : null

  const elegir = (n: number) => {
    if (resp !== null) return
    setResp(n)
    if (n === p.correcta) setAciertos((a) => a + 1); else setFallos((x) => [...x, i])
  }
  const siguiente = () => {
    const sig = i + 1
    setResp(null); setI(sig)
    if (sig >= preguntas.length && !guardado) {
      const ok = aciertos
      s.agregar('quizzes', { fecha: hoyISO(), tema, aciertos: ok, total: preguntas.length })
      s.agregar('juegos', { juego: 'quiz', fecha: hoyISO(), puntaje: ok, detalle: nucleo(tema) })
      setGuardado(true)
      decir(<>Quiz terminado: <b>{ok}/{preguntas.length}</b>{ok === preguntas.length ? ' · ¡perfecto!' : ''}</>, ok === preguntas.length)
    }
  }

  return (
    <Hoja abierta={abierto} cerrar={cerrar} titulo="Quiz del tema">
      {!preguntas.length && <p className="chico suave">Este tema aún no tiene preguntas.</p>}
      {p && !fin && (
        <div className="pila">
          <div className="entre"><span className="eyebrow">{nucleo(tema)}</span><span className="chico suave">{i + 1} / {preguntas.length}</span></div>
          <div className="barra"><span style={{ width: `${(i / preguntas.length) * 100}%`, display: 'block', height: '100%', background: 'var(--tinta)', borderRadius: 99, transition: 'width .4s' }} /></div>
          <h3 className="h3" style={{ fontSize: 22, lineHeight: 1.25 }}>{p.q}</h3>
          <div className="pila-s">{p.opciones.map((o, n) => (
            <button key={o + n} className="opcion" disabled={resp !== null} data-estado={resp === null ? '' : n === p.correcta ? 'ok' : n === resp ? 'mal' : 'neutro'} onClick={() => elegir(n)}>{o}</button>
          ))}</div>
          {resp !== null && <div className="pila-s">
            <p className="chico"><b>{resp === p.correcta ? '¡Correcto! ✔' : 'Casi. La respuesta es: ' + p.opciones[p.correcta]}</b></p>
            {resp !== p.correcta && f && <p className="porque">Repaso: {f.resumen}</p>}
            <div><button className="btn" onClick={siguiente}>{i + 1 >= preguntas.length ? 'Ver resultado' : 'Siguiente →'}</button></div>
          </div>}
        </div>
      )}
      {fin && (
        <div className="pila" style={{ textAlign: 'center' }}>
          <div className="num" style={{ fontSize: 88 }}>{aciertos}<span style={{ fontSize: 32 }}>/{preguntas.length}</span></div>
          <p className="h3">{aciertos === preguntas.length ? 'Tema dominado 🎯' : aciertos >= preguntas.length / 2 ? 'Vas bien, afina lo que falló' : 'Todavía no lo tienes: es normal, repásalo y vuelve'}</p>
          {previo && previo.fecha !== hoyISO() && <p className="chico suave">Tu quiz anterior de este tema: {previo.aciertos}/{previo.total}.</p>}
          {aciertos < preguntas.length && f && <div className="resumen-box" style={{ textAlign: 'left' }}><span className="eyebrow">Repasa esto</span><p>{f.resumen}</p></div>}
          <div className="fila" style={{ justifyContent: 'center' }}>
            <button className="btn" onClick={() => useQuiz.getState().abrir(tema, useQuiz.getState().bloque)}>🔁 Otro quiz (preguntas distintas)</button>
            <button className="btn linea" onClick={() => { cerrar(); abrirCoach('explicar', tema); irA('coach') }}>🧠 Explicarlo y evaluar</button>
          </div>
          <p className="porque">El quiz no suma al XP de Culta (ese solo cuenta sesiones registradas); queda como tu práctica y se ve en el temario.</p>
        </div>
      )}
    </Hoja>
  )
}
