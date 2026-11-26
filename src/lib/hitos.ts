import { nivelDe, racha, useDatos, xpLuzmila, xpZorro, ciclo, anclaSemanas, puntosDia } from '../store'
import { tendencia } from './cerebro'

type Datos = ReturnType<typeof useDatos.getState>
export type Hito = { id: string; emoji: string; texto: string; cumple: (s: Datos) => boolean }

const perfecto = (s: Datos) => s.quizzes.some((q: any) => q.total > 0 && q.aciertos === q.total)
export const HITOS: Hito[] = [
  { id: 'tres-de-tres', emoji: '🌟', texto: 'Tres de tres en un día. Así se ve el sistema funcionando, sin esfuerzo heroico.', cumple: (s) => Object.values(s.checkins).some((c: any) => puntosDia(c) === 3) },
  { id: 'racha-3', emoji: '🔥', texto: 'Tres días vivos seguidos. No es suerte: es práctica.', cumple: (s) => racha(s) >= 3 },
  { id: 'racha-7', emoji: '🔥', texto: '¡Una semana viva! Tu yo del 19 de agosto estaría aplaudiendo.', cumple: (s) => racha(s) >= 7 },
  { id: 'racha-14', emoji: '🏅', texto: 'Dos semanas sosteniéndote. Eso ya es identidad, no solo hábito.', cumple: (s) => racha(s) >= 14 },
  { id: 'retomo', emoji: '🛟', texto: 'Volver también es ganar: ya tienes un “retomar +3”. Vale más que no fallar nunca.', cumple: (s) => s.retomas.length >= 1 },
  { id: 'nivel-1', emoji: '✈️', texto: '¡Subiste a Modo Avión Activado!', cumple: (s) => nivelDe(xpLuzmila(s).total).i >= 1 },
  { id: 'nivel-2', emoji: '🕵️', texto: '¡Detective del Expediente! Ya hay evidencia real acumulada.', cumple: (s) => nivelDe(xpLuzmila(s).total).i >= 2 },
  { id: 'nivel-3', emoji: '🎭', texto: '¡Alter Ego desbloqueado! Tu voz está saliendo más seguido.', cumple: (s) => nivelDe(xpLuzmila(s).total).i >= 3 },
  { id: 'nivel-4', emoji: '👑', texto: '¡Luzmila Nivel Imperio! El sistema ya es un hábito.', cumple: (s) => nivelDe(xpLuzmila(s).total).i >= 4 },
  { id: 'exp-5', emoji: '🕵️', texto: 'Cinco evidencias nuevas en tu Expediente. Los hechos le ganan a la sensación.', cumple: (s) => s.expediente.filter((e) => !e.historial).length >= 5 },
  { id: 'cazadora-5', emoji: '🧑‍⚖️', texto: 'Cinco distorsiones cazadas. Ya las reconoces antes de que te convenzan.', cumple: (s) => s.distorsiones.length >= 5 + 5 },
  { id: 'quiz-perfecto', emoji: '🎯', texto: 'Quiz perfecto. Eso se llama entender, no memorizar.', cumple: perfecto },
  { id: 'quizzes-5', emoji: '🧠', texto: 'Cinco quizzes hechos. Estás nutriéndote en serio.', cumple: (s) => s.quizzes.length >= 5 },
  { id: 'eval-1', emoji: '✍️', texto: 'Tu primera evaluación guardada. Desde aquí se ve cuánto mejoras.', cumple: (s) => (s.evaluaciones || []).length >= 1 },
  { id: 'eval-sube', emoji: '📈', texto: 'Tus evaluaciones de escritura están subiendo. Se nota el trabajo.', cumple: (s) => (s.evaluaciones || []).length >= 4 && tendencia(s.evaluaciones).delta >= 8 },
  { id: 'zorro-1', emoji: '🦊', texto: 'Primer momento Zorro de la plataforma. Reírte de la situación, nunca de ti.', cumple: (s) => xpZorro(s).total >= 1 },
  { id: 'zorro-nivel2', emoji: '🦊', texto: '¡Zorro nivel 2!', cumple: (s) => xpZorro(s).nivel >= 2 },
  { id: 'fecha-1', emoji: '📌', texto: 'Cumpliste una fecha límite. Tu mejor talento: cumplir cuando hay fecha. Aquí lo aprovechamos.', cumple: (s) => (s.fechas || []).some((f: any) => f.hecha) },
  { id: 'fecha-5', emoji: '🏆', texto: 'Cinco fechas límite cerradas. Eres de las que cumplen.', cumple: (s) => (s.fechas || []).filter((f: any) => f.hecha).length >= 5 },
  { id: 'ancla-1', emoji: '⚓', texto: 'Una semana con tu práctica ancla.', cumple: (s) => (anclaSemanas(s)?.semanas || 0) >= 1 },
  { id: 'ancla-4', emoji: '⚓', texto: 'Cuatro semanas con tu práctica ancla: vas por la mitad del camino a las 8.', cumple: (s) => (anclaSemanas(s)?.semanas || 0) >= 4 },
  { id: 'ancla-8', emoji: '👑', texto: '¡OCHO semanas con tu práctica ancla! Tu primera meta de éxito, cumplida.', cumple: (s) => (anclaSemanas(s)?.semanas || 0) >= 8 },
  { id: 'alter-1', emoji: '🎭', texto: 'Activaste tu Alter Ego por primera vez. +2.', cumple: (s) => s.alterEgo.length >= 1 },
  { id: 'cuerpo-4', emoji: '🥋', texto: 'Cuatro sesiones de Cuerpo en Movimiento: primer cinturón.', cumple: (s) => (s.fasesReg || []).filter((r: any) => r.fase === 6 && r.seccion === 'sesion').length >= 4 },
  { id: 'puente-1', emoji: '🌉', texto: 'Puente reconstruido: diste el primer paso con un vínculo. Cuenta el intento, responda o no.', cumple: (s) => (s.fasesReg || []).some((r: any) => r.fase === 8 && r.seccion === 'vinculo' && r.estado && r.estado !== 'Pendiente') },
  { id: 'ciclo-baja', emoji: '🔄', texto: 'Tus caídas se están acortando. Ese era tu criterio de éxito número 1.', cumple: (s) => ciclo(s).tendencia === 'baja' },
]

export const pendientes = (s: Datos) => HITOS.filter((h) => !s.hitos.includes(h.id) && h.cumple(s))
