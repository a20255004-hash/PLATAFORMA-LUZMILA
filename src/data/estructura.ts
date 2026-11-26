// Estructura real del proyecto (sin datos personales: esos viven en tu archivo privado).

export const INICIO = '2026-08-19' // día 1 del Proyecto Luzmila
export const ANCLA_ALTERNANCIA = '2026-08-29' // Culta = 29 ago, Zorro = 30 ago, y así día por medio

export const MUNDOS = {
  hoy: { id: 'hoy', nombre: 'Hoy', emoji: '🏠', color: 'var(--lima)', frase: 'Tu panel, corazón' },
  coach: { id: 'coach', nombre: 'Coach', emoji: '🧠', color: 'var(--lila)', frase: 'Escribe y te evalúo' },
  agenda: { id: 'agenda', nombre: 'Agenda', emoji: '⏰', color: 'var(--mostaza)', frase: 'Recordatorios y fechas límite' },
  puente: { id: 'puente', nombre: 'Claude', emoji: '🌉', color: 'var(--celeste)', frase: 'Puente con tu chat de Claude' },
  retos: { id: 'retos', nombre: 'Retos', emoji: '🎮', color: 'var(--mostaza)', frase: 'Aquí se juega de verdad' },
  mapa: { id: 'mapa', nombre: 'Mapa', emoji: '🗺️', color: 'var(--mostaza)', frase: '19 fases, camino con desvíos' },
  culta: { id: 'culta', nombre: 'Culta', emoji: '🎓', color: 'var(--lila)', frase: 'Culta y alturada' },
  zorro: { id: 'zorro', nombre: 'Zorro', emoji: '🦊', color: 'var(--mandarina)', frase: 'El humor como músculo' },
  voz: { id: 'voz', nombre: 'Voz', emoji: '🗣️', color: 'var(--celeste)', frase: 'Vocabulario y argumentación' },
  calendario: { id: 'calendario', nombre: 'Calendario', emoji: '📅', color: 'var(--menta)', frase: 'Qué toca y cuándo' },
  bitacora: { id: 'bitacora', nombre: 'Bitácora', emoji: '📓', color: 'var(--durazno)', frase: 'Tu voz, en tú' },
  expediente: { id: 'expediente', nombre: 'Expediente', emoji: '🕵️', color: 'var(--rosa)', frase: 'Esto también cuenta' },
  patrones: { id: 'patrones', nombre: 'Patrones', emoji: '🔍', color: 'var(--celeste)', frase: 'Lo que dicen tus datos' },
  logros: { id: 'logros', nombre: 'Logros', emoji: '🏆', color: 'var(--mostaza)', frase: 'Niveles, insignias, misiones' },
  ajustes: { id: 'ajustes', nombre: 'Datos', emoji: '⚙️', color: 'var(--crema-2)', frase: 'Guardar, importar, módulos' },
} as const
export type MundoId = keyof typeof MUNDOS
export const ORDEN: MundoId[] = ['hoy', 'agenda', 'coach', 'puente', 'retos', 'mapa', 'culta', 'zorro', 'voz', 'calendario', 'bitacora', 'expediente', 'patrones', 'logros', 'ajustes']

export const NIVELES = [
  { min: 0, emoji: '🐛', nombre: 'Larva Cansada', frase: 'Todo inicio cuenta, aunque no lo sientas todavía.' },
  { min: 10, emoji: '✈️', nombre: 'Modo Avión Activado', frase: 'El ritual de cierre ya empieza a ser tuyo.' },
  { min: 30, emoji: '🕵️‍♀️', nombre: 'Detective del Expediente', frase: 'Ya tienes evidencia real acumulada.' },
  { min: 60, emoji: '🎭', nombre: 'Alter Ego Desbloqueado', frase: 'Tu voz empieza a salir más seguido.' },
  { min: 100, emoji: '👑', nombre: 'Luzmila Nivel Imperio', frase: 'El sistema ya es un hábito, no un esfuerzo.' },
]

export const NIVELES_CULTA = [
  { min: 0, nombre: 'Larva Cansada de Clase' },
  { min: 20, nombre: 'Aprendiz con Café Frío' },
  { min: 45, nombre: 'Cazadora de Vacíos' },
  { min: 75, nombre: 'Estratega en Formación' },
  { min: 110, nombre: 'Culta en Construcción' },
  { min: 150, nombre: 'Voz con Criterio' },
  { min: 200, nombre: 'Luzmila Nivel Imperio' },
]

export const DISTORSIONES = [
  { id: 'La Jueza Extrema', emoji: '🧑‍⚖️' },
  { id: 'La de Blanco y Negro', emoji: '⚫⚪' },
  { id: 'La Restadora', emoji: '➖' },
  { id: 'La Adivina', emoji: '🔮' },
  { id: 'Otra', emoji: '🌀' },
]

export const DIMENSIONES = ['Académico/Profesional', 'Social', 'Física', 'Emocional', 'Espiritual', 'Otra']
export const TIPOS_EVIDENCIA = ['Logro personal', 'Reconocimiento externo', 'Acto de valentía', 'Acto de servicio', 'Otro']

export const BLOQUES_CULTA = {
  B1: { nombre: 'Administración', emoji: '🟣', color: 'var(--lila)' },
  B2: { nombre: 'Cultura General', emoji: '🟢', color: 'var(--menta)' },
  B3: { nombre: 'Criterio y Expresión', emoji: '🟠', color: 'var(--mandarina)' },
} as const

export const RUBRICA = [
  'Explicar con tus palabras',
  'Opción múltiple',
  'Contraste o secuencia',
  'Caso aplicado',
  'Opción múltiple',
  'Trampa: encuentra el error',
  'Aplicación (al área pedida)',
  'Concepto / definición precisa',
  'Pensamiento crítico: dos direcciones',
  'Conexión con lo aprendido',
]

export const PILARES_ZORRO = [
  { id: 'Cierre + Apertura', emoji: '🔄', accion: 'Repasar la semana con humor y fijar la intención de la nueva', xp: 1 },
  { id: 'Observacion', nombre: 'Observación', emoji: '🔭', accion: 'Notar 1 cosa graciosa del día, sin forzar', xp: 1 },
  { id: 'Ingenio verbal', emoji: '🎭', accion: 'Mini juego de palabras o improvisación corta', xp: 1 },
  { id: 'Anecdota', nombre: 'Anécdota', emoji: '📖', accion: 'Historia corta: calma, tensión, remate', xp: 2 },
  { id: 'Cosmovision', nombre: 'Cosmovisión', emoji: '🌍', accion: 'Una curiosidad o filosofía de otra cultura', xp: 1 },
  { id: 'Reto social', emoji: '🗣️', accion: 'Aplicar algo con una persona real', xp: 3 },
]
export const XP_ZORRO = [
  { accion: 'Momento Zorro capturado', xp: 1 },
  { accion: 'Dato cultural que te sorprendió de verdad', xp: 1 },
  { accion: 'Anécdota bien contada (con remate)', xp: 2 },
  { accion: 'Reto social cumplido', xp: 3 },
  { accion: 'Retomar después de fallar', xp: 3 },
]

export const PILARES_VOZ = [
  { n: 1, emoji: '🧩', nombre: 'Recuperación bajo tiempo', como: '90 s en voz alta por categoría. Si te trabas, describe forma, función o sonido.', base: 'Burke — déficit de transmisión' },
  { n: 2, emoji: '🗣️', nombre: 'Fluidez · shadowing', como: 'Repite en voz alta con ~0.5 s de retraso, 10 min, sin pausar si te trabas.', base: 'Arguelles' },
  { n: 3, emoji: '📚', nombre: 'Vocabulario activo', como: '1 palabra al día de tus lecturas, en 3 frases tuyas. Repasos días 2, 7 y 21.', base: 'Craik & Lockhart; Ebbinghaus' },
  { n: 4, emoji: '🧠', nombre: 'Conectar ideas', como: 'Une 2 frases con un conector distinto cada vez.', base: 'Saddler & Graham' },
  { n: 5, emoji: '⚖️', nombre: 'Argumentación', como: 'Toulmin: afirmación, evidencia y garantía. Luego defiende la postura contraria.', base: 'Toulmin; Paul-Elder' },
  { n: 6, emoji: '🪞', nombre: 'Cierre metacognitivo', como: 'Notar sin evaluar. El análisis va después, no durante.', base: 'Wells' },
]
export const SEMANA_VOZ = ['Dom · repaso espaciado + cierre', 'Lun · P3 + P1', 'Mar · P1 + P4', 'Mié · P2', 'Jue · P5', 'Vie · P6', 'Sáb · P5 extendido (steelmanning)']
export const CONECTORES = ['aunque', 'porque', 'a pesar de que', 'ya que', 'sin embargo', 'de modo que', 'dado que', 'mientras que']
export const CATEGORIAS_P1 = ['Cosas de una biblioteca', 'Verbos de movimiento', 'Emociones', 'Palabras para "lograr"', 'Objetos de oficina', 'Sinónimos de "bonito"', 'Cosas de una cocina', 'Palabras para "valiente"', 'Profesiones', 'Términos de administración']

export type Fase = { id: number; nombre: string; emoji: string; objetivo: string; mes: string; mesN: number; depende: string; deps: number[]; entregables: string[]; nota?: string; optIn?: boolean; sinPuntos?: boolean }
export const FASES: Fase[] = [
  { id: 1, nombre: 'Energía y Autocuidado', emoji: '🔋', objetivo: 'Sueño, alimentación e higiene como base.', mes: 'Mes 1', mesN: 1, depende: 'Nada — es la raíz', deps: [], entregables: ['Ritual de mañana (Modo Poderosa)', 'Comida ancla', 'Ritual de noche: celular fuera (Modo Avión)'] },
  { id: 2, nombre: 'Mentalidad', emoji: '🧭', objetivo: 'Reentrenar cómo interpretas lo que te pasa.', mes: 'Mes 1', mesN: 1, depende: 'Nada', deps: [], entregables: ['Cazadora de distorsiones', 'Chips mentales por situación'] },
  { id: 3, nombre: 'El Expediente', emoji: '🕵️', objetivo: 'Acumular evidencia real de quién eres.', mes: 'Mes 1', mesN: 1, depende: 'Fase 2 activa', deps: [2], entregables: ['Entradas de evidencia', 'Medición de autoconcepto cada 2 meses'] },
  { id: 4, nombre: 'Metas y Foco', emoji: '🎯', objetivo: 'Filtrar la dispersión y secuenciar.', mes: 'Mes 1', mesN: 1, depende: 'Fase 3 mínimamente activa', deps: [3], entregables: ['Máximo 2–3 metas activas', 'Plan si-entonces por meta', 'Matriz Eisenhower'] },
  { id: 5, nombre: 'Personalidad y Alter Ego', emoji: '🎭', objetivo: 'Confianza, voz, hablar más. Incluye tu Firma de Personalidad Auténtica.', mes: 'Mes 2', mesN: 2, depende: 'Fase 2 con rodaje', deps: [2], entregables: ['S1: 3 rasgos de tu alter ego + nombre con humor', 'S2: un saludo extra por semana', 'S3: salir sin esperar, aunque no saludes', 'S4: proponer un plan pequeño', 'Insignia: Racha de valentía (4 semanas)'], nota: 'Exposición gradual: nunca empezar por lo más temido.' },
  { id: 6, nombre: 'Cuerpo en Movimiento', emoji: '🥋', objetivo: 'Energía física: muay thai, natación o tenis de mesa.', mes: 'Mes 2', mesN: 2, depende: 'Fase 1 estable', deps: [1], entregables: ['Elegir 1 deporte por menor fricción', '2 veces por semana, sesiones cortas', 'Revisar a las 3 semanas', 'Cinturones: cada 4 sesiones consistentes'], nota: 'Sin peso, calorías ni medidas. Nunca para compensar.' },
  { id: 7, nombre: 'Ocio y Creatividad', emoji: '🎨', objetivo: 'Espacio sin productividad: teatro, arte, disfrute.', mes: 'Mes 3', mesN: 3, depende: 'Nada estricto', deps: [], entregables: ['1 momento semanal fijo de disfrute', 'Registro de momentos — sin puntaje'], sinPuntos: true, nota: 'Zona libre de evaluación.' },
  { id: 8, nombre: 'Amistad y Vida Social', emoji: '🤝', objetivo: 'Profundidad relacional; reparar vínculos en pausa.', mes: 'Mes 3', mesN: 3, depende: 'Fase 5 con rodaje', deps: [5], entregables: ['Identificar 1 vínculo en pausa', 'Mensaje ligero: "vi esto y me acordé de ti"', 'Registrar qué pasó vs. qué temías', 'Insignia: Puente reconstruido (cuenta el intento)'] },
  { id: 9, nombre: 'Familia de Origen', emoji: '🏠', objetivo: 'Mirar los patrones familiares, a tu ritmo.', mes: 'Mes 4', mesN: 4, depende: 'Fases 2 + 5 estables', deps: [2, 5], entregables: [], optIn: true, sinPuntos: true, nota: 'Solo se abre si tú quieres. Sin puntos ni retos. Mejor con apoyo profesional en paralelo.' },
  { id: 10, nombre: 'Pareja', emoji: '💞', objetivo: 'Trabajo interno primero.', mes: 'Mes 9-10', mesN: 9, depende: 'Fase 9 trabajada', deps: [9], entregables: [], optIn: true, sinPuntos: true, nota: 'Solo se abre si tú quieres.' },
  { id: 11, nombre: 'Familia Propia Futura', emoji: '👪', objetivo: 'Visión y valores de la familia que quieras construir.', mes: 'Mes 11-12', mesN: 11, depende: 'Fase 10 en curso', deps: [10], entregables: [] },
  { id: 12, nombre: 'Desarrollo Profesional', emoji: '💼', objetivo: 'Tu camino entre opciones profesionales.', mes: 'Mes 5-6', mesN: 5, depende: 'Fase 4 madura', deps: [4], entregables: [] },
  { id: 13, nombre: 'Finanzas', emoji: '💰', objetivo: 'Retomar el registro de gastos con una estructura que lo sostenga.', mes: 'Mes 4', mesN: 4, depende: 'Fase 4 entrenada', deps: [4], entregables: [] },
  { id: 14, nombre: 'Espiritualidad', emoji: '🙏', objetivo: 'Tu fe, a tu manera: personal, sin intermediarios.', mes: 'Mes 5-6', mesN: 5, depende: 'Nada — ya existe', deps: [], entregables: [], sinPuntos: true, nota: 'Opcional y sin puntos. Tú decides su contenido.' },
  { id: 15, nombre: 'Cosmovisión y Filosofía de Vida', emoji: '🌌', objetivo: 'Tu propia forma de entender el sentido.', mes: 'Mes 7-8', mesN: 7, depende: 'Acumulado de 1–9', deps: [], entregables: [], nota: 'Culta y Zorro ya te van dando material.' },
  { id: 16, nombre: 'Legado y Propósito', emoji: '🏛️', objetivo: 'Tesis, "imperio", libro: tu proyecto grande, al final.', mes: 'Mes 11-12', mesN: 11, depende: 'Todo lo anterior', deps: [], entregables: [] },
  { id: 17, nombre: 'Principios de Vida y Laborales', emoji: '📜', objetivo: 'Tu código explícito: los valores que no negocias.', mes: 'Mes 1 (sem 3-4)', mesN: 1, depende: 'Nada', deps: [], entregables: ['Un documento con tus principios'] },
  { id: 21, nombre: 'Filantropía y Servicio', emoji: '🤲', objetivo: 'Darle forma a la ayuda que ya das.', mes: 'Mes 7-8', mesN: 7, depende: 'Fase 14 con recorrido', deps: [14], entregables: [] },
  { id: 22, nombre: 'Marca Personal', emoji: '✨', objetivo: 'Cómo te presentas al mundo, coherente con tu voz.', mes: 'Mes 7-8', mesN: 7, depende: 'Fases 17 + 12', deps: [17, 12], entregables: [] },
]

export const INSIGNIAS = [
  { id: 'volvi', emoji: '🛟', nombre: 'Volví', como: 'Retomar después de 2+ días en cero.' },
  { id: 'avion', emoji: '✈️', nombre: 'Modo Avión', como: '5 noches con el celular fuera del cuarto.' },
  { id: 'cazadora', emoji: '🧑‍⚖️', nombre: 'Cazadora', como: '10 distorsiones capturadas.' },
  { id: 'detective', emoji: '🕵️', nombre: 'Detective', como: '10 evidencias nuevas en el Expediente.' },
  { id: 'culta10', emoji: '🎓', nombre: '10 sesiones Culta', como: 'Registrar 10 sesiones.' },
  { id: 'vuelta', emoji: '🦊', nombre: 'Vuelta completa', como: 'Los 6 pilares del Zorro registrados.' },
  { id: 'remate', emoji: '🎤', nombre: 'Remate seco', como: '3 anécdotas con remate.' },
  { id: 'garantia', emoji: '⚖️', nombre: 'Con garantía', como: '5 argumentos Toulmin completos.' },
  { id: 'valentia', emoji: '🔥', nombre: 'Racha de valentía', como: 'Fase 5: 4 semanas activando el alter ego.' },
  { id: 'puente', emoji: '🌉', nombre: 'Puente reconstruido', como: 'Fase 8: un vínculo reactivado (cuenta el intento).' },
]

export const FRASES_HOY = [
  'Un día no es un patrón. Mañana sigue.',
  'Zombie no decide. Decide Luzmila.',
  'Esto también cuenta. Va al Expediente.',
  'Me comparo con mi propio ayer.',
  'El nervio puede venir conmigo.',
  'Camino con desvíos, no línea recta.',
]
