// Herramientas por fase, armadas con lo que dice tu Mapa Maestro y tu dossier. Cada fase tiene solo lo que su propio diseño pide
// (nada de métricas donde la fase pide libertad: Cuerpo sin peso ni calorías, Ocio sin puntaje, Familia y Pareja sin puntos ni retos).
export type Campo = { k: string; label: string; tipo?: 'texto' | 'largo' | 'select' | 'numero' | 'fecha'; opciones?: string[]; ayuda?: string }
export type Seccion = {
  id: string; titulo: string; desc?: string; boton?: string
  campos: Campo[]
  unico?: boolean // una sola ficha editable (perfil, tesis…)
  max?: number
  xp?: number // XP por registro (solo donde la fase lo define)
  destino?: 'alterEgo' | 'disfrute' // arreglos que ya existen en la plataforma
  resumen: (r: any) => string
  estado?: { k: string; opciones: string[] } // estado editable por registro
}
export type Herramienta = {
  intro: string; aviso?: string; profesional?: boolean
  secciones: Seccion[]
  checklist?: { id: string; titulo: string; items: { id: string; texto: string }[] }
  fijos?: { titulo: string; items: string[] } // listas de ayuda (guiones, ideas)
  linea?: { texto: string; ruta: string } // atajo a una página existente
}
const T = (k: string, label: string, ayuda?: string): Campo => ({ k, label, ayuda })
const L = (k: string, label: string, ayuda?: string): Campo => ({ k, label, tipo: 'largo', ayuda })
const SEL = (k: string, label: string, opciones: string[]): Campo => ({ k, label, tipo: 'select', opciones })
const F = (k: string, label: string): Campo => ({ k, label, tipo: 'fecha' })
const N = (k: string, label: string): Campo => ({ k, label, tipo: 'numero' })

export const HERRAMIENTAS: Record<number, Herramienta> = {
  1: { intro: 'Tus rituales viven en Hoy: 10 segundos al día.', linea: { texto: 'Ir al check-in de Hoy', ruta: 'hoy' }, secciones: [] },
  2: { intro: 'La Cazadora de distorsiones y tus chips mentales viven en Expediente.', linea: { texto: 'Ir a la Cazadora', ruta: 'expediente' }, secciones: [] },
  3: { intro: 'Tu Expediente, la búsqueda SOS y la medición de autoconcepto viven en su página.', linea: { texto: 'Ir al Expediente', ruta: 'expediente' }, secciones: [] },
  4: { intro: 'Tus metas (máximo 3 activas, Eisenhower) y tus 22 metas de 2026 viven en Logros.', linea: { texto: 'Ir a Metas', ruta: 'logros' }, secciones: [] },
  5: {
    intro: 'Hipervigilancia social aprendida → exposición gradual, nunca empezando por lo más temido. Tu alter ego es la versión que te acompaña cuando el nervio está presente.',
    secciones: [
      { id: 'perfil', titulo: '🎭 Mi alter ego', desc: 'Nómbralo con humor y define 3 rasgos que quieres sacar a pasear.', unico: true, campos: [T('nombre', 'Su nombre'), T('rasgos', 'Tres rasgos', 'Ej. cálida, directa, curiosa'), T('frase', 'Su frase de entrada')], resumen: (r) => `${r.nombre || 'Sin nombre'} · ${r.rasgos || ''}` },
      { id: 'activar', titulo: 'Activé mi alter ego', desc: '+2 XP cada vez. Cuenta aunque no haya salido perfecto.', boton: 'Anotar activación', destino: 'alterEgo', campos: [T('situacion', 'Dónde'), L('hice', 'Qué hice con el nervio presente'), T('salio', 'Cómo salió (una frase)')], resumen: (r) => `${r.situacion || ''}: ${String(r.hice || '').slice(0, 70)}` },
      { id: 'firma', titulo: '✨ Mi firma de personalidad auténtica', desc: 'Muecas, frases tipo “qué divina”, jergas tuyas: lo que ya eres y puedes dejar salir.', campos: [T('elemento', 'Elemento (mueca, frase, jerga)'), T('cuando', 'Cuándo lo uso')], resumen: (r) => `${r.elemento}${r.cuando ? ' · ' + r.cuando : ''}` },
    ],
    checklist: { id: 'f5', titulo: 'Escalera de exposición gradual (una por semana)', items: [{ id: 's1', texto: 'Semana 1 · definir mis 3 rasgos y nombrar al alter ego' }, { id: 's2', texto: 'Semana 2 · un saludo extra a alguien de bajo riesgo' }, { id: 's3', texto: 'Semana 3 · salir del baño sin esperar, aunque no saludemos' }, { id: 's4', texto: 'Semana 4 · proponer un plan pequeño' }] },
    fijos: { titulo: 'Guiones cortos para poner límites (poner un límite no te hace “dura”)', items: ['“Prefiero que no.” (y nada más)', '“Eso no me incomoda ni me gusta; lo dejo hasta aquí.”', '“Necesito pensarlo, te respondo mañana.”', '“Gracias por la invitación, esta vez no puedo.”', '“Me importa esta conversación, pero así no. Cuando podamos hablar tranquilas, sí.”', '“No tengo que explicarte mi decisión.”'] },
  },
  6: {
    intro: 'Un deporte elegido por menor fricción, 2 veces por semana, sesiones cortas. Esta fase está separada a propósito de cualquier meta de peso o imagen corporal.',
    aviso: 'Aquí no hay peso, calorías ni medidas. Tampoco se usa para compensar comida ni culpa.',
    secciones: [
      { id: 'deporte', titulo: '🥋 Mi deporte', unico: true, campos: [SEL('deporte', 'Elijo UNO por ahora', ['Muay thai', 'Natación', 'Tenis de mesa', 'Otro']), T('dias', 'Mis 2 días de la semana'), T('lugar', 'Dónde / con quién')], resumen: (r) => `${r.deporte || '—'} · ${r.dias || ''}` },
      { id: 'sesion', titulo: 'Sesiones', desc: '+2 XP por sesión. Cada 4 sesiones, un cinturón.', boton: 'Anotar sesión', xp: 2, campos: [F('fecha', 'Fecha'), T('que', 'Qué hice'), T('como', 'Cómo me sentí (una palabra)')], resumen: (r) => `${r.fecha || ''} · ${r.que || ''}` },
    ],
    fijos: { titulo: 'Cinturones (cada 4 sesiones)', items: ['4 · Cinturón blanco', '8 · Amarillo', '12 · Naranja', '16 · Verde', '20 · Azul', '24 · Negro'] },
  },
  7: {
    intro: 'Un momento semanal fijo sin métrica, sin meta ni fecha. El teatro de 2024 fue de lo poco que describiste con alegría pura.',
    aviso: 'Zona libre de evaluación: no hay puntos, rachas ni promedios aquí. Solo anotas que disfrutaste.',
    secciones: [{ id: 'momento', titulo: '🎨 Momentos de disfrute', boton: 'Guardar momento', destino: 'disfrute', campos: [F('fecha', 'Fecha'), T('que', 'Qué fue'), T('con', 'Con quién o dónde (opcional)')], resumen: (r) => `${r.fecha || ''} · ${r.que || ''}` }],
    fijos: { titulo: 'Ideas (ninguna obligatoria)', items: ['Teatro o improvisación', 'Dibujar o diario de arte', 'Una película de tu lista', 'Un lugar bello por visitar', 'Música y baile sin motivo'] },
  },
  8: {
    intro: 'Vínculos que quedan “en pausa” tras un roce mínimo y no se reparan. El paso es ligero, sin gran conversación. Cuenta el intento, responda o no.',
    secciones: [{ id: 'vinculo', titulo: '🤝 Vínculos en pausa', boton: 'Añadir vínculo', estado: { k: 'estado', opciones: ['Pendiente', 'Intenté escribir', 'Reconectamos'] }, campos: [T('persona', 'Persona (apodo)'), T('paso', 'Mensaje ligero que le enviaría', 'Ej. “vi esto y me acordé de ti”'), T('temia', 'Qué temía que pasara')], resumen: (r) => `${r.persona || ''} · ${r.paso || ''}` }],
    fijos: { titulo: 'Mensajes ligeros (sin “gran conversación”)', items: ['“Vi esto y me acordé de ti 🙂”', '“¿Cómo vas con lo de…? Me quedé pensando en eso.”', '“Hace rato que no hablamos, te extraño. ¿Un café esta semana?”'] },
    aviso: 'Cuando alguien responda (o no), anota en el Expediente qué pasó realmente versus lo que temías. La insignia “Puente reconstruido” se gana con el intento.',
  },
  9: {
    intro: 'Patrones con tu familia de origen. Es un espacio privado, sin puntos, sin retos y sin prisa. Se abre solo cuando tú quieres y se puede cerrar.',
    profesional: true, aviso: 'Aquí lo más sano es ir acompañada: una psicóloga o psicólogo especializado puede dar lo que una app no puede. La plataforma solo guarda el espacio y nunca te lo muestra de vuelta por sorpresa.',
    secciones: [{ id: 'nota', titulo: '🏠 Notas privadas', boton: 'Guardar nota', campos: [F('fecha', 'Fecha'), L('texto', 'Lo que quiero dejar escrito')], resumen: (r) => `${r.fecha || ''} · ${String(r.texto || '').slice(0, 80)}` }],
  },
  10: {
    intro: 'Primero el trabajo interno. Fase prevista para los meses 9–10, después de Familia de Origen. Sin puntos y sin retos.',
    profesional: true,
    secciones: [{ id: 'nota', titulo: '💞 Notas privadas', boton: 'Guardar nota', campos: [F('fecha', 'Fecha'), L('texto', 'Lo que quiero dejar escrito')], resumen: (r) => `${r.fecha || ''} · ${String(r.texto || '').slice(0, 80)}` }],
  },
  11: {
    intro: 'Visión y valores de la familia que quieras construir (meses 11–12).',
    secciones: [{ id: 'vision', titulo: '👪 Mi visión', boton: 'Añadir', campos: [SEL('tipo', 'Es un…', ['Valor', 'Imagen de mi día a día', 'Cosa que quiero distinta']), L('texto', 'Lo que escribo')], resumen: (r) => `${r.tipo || ''} · ${String(r.texto || '').slice(0, 80)}` }],
  },
  12: {
    intro: 'Un camino entre opciones: Administración, PNP, diplomacia, consultoría (y las que quieras). Compara con criterios, no con ansiedad.',
    secciones: [{ id: 'opcion', titulo: '💼 Mis opciones', boton: 'Añadir opción', campos: [T('opcion', 'Opción'), L('atrae', 'Qué me atrae'), L('requisitos', 'Qué pide (estudios, exámenes, tiempos)'), T('paso', 'Un paso pequeño para explorarla'), SEL('interes', 'Interés (1–5)', ['1', '2', '3', '4', '5'])], resumen: (r) => `${r.opcion || ''} · interés ${r.interes || '—'} · ${r.paso || ''}` }],
    linea: { texto: 'Tu práctica y tu tesis tienen su espacio en la Fase 16', ruta: 'mapa' },
  },
  13: {
    intro: 'Retomar tu Excel de gastos con una estructura que lo sostenga: presupuesto por compra, muy concreto. Es solo tuyo y vive en tu dispositivo.',
    aviso: 'Sin comparaciones con nadie. Si un mes no registraste, no pasa nada: se retoma.',
    secciones: [
      { id: 'gasto', titulo: '💰 Cada compra', boton: 'Anotar compra', campos: [F('fecha', 'Fecha'), T('que', 'Qué'), N('monto', 'Monto (S/)'), SEL('cat', 'Categoría', ['Comida', 'Pasajes', 'Estudios', 'Cuidado personal', 'Familia', 'Ahorro', 'Otro'])], resumen: (r) => `${r.fecha || ''} · ${r.que || ''} · S/ ${r.monto || 0}` },
      { id: 'hito', titulo: '🏠 Meta de independencia: hitos', desc: 'Pasos concretos hacia ser independiente (habitación, ahorro, ingresos).', boton: 'Añadir hito', estado: { k: 'estado', opciones: ['Por hacer', 'En marcha', 'Logrado'] }, campos: [T('hito', 'Hito'), F('fecha', 'Fecha tentativa')], resumen: (r) => `${r.hito || ''}${r.fecha ? ' · ' + r.fecha : ''}` },
    ],
  },
  14: {
    intro: 'Tu fe es personal: cree en Dios y en su amor, sin iglesia ni doctrina. Este espacio es opcional, sin puntos, con lenguaje amplio e inclusivo.',
    aviso: 'Nada de contenido religioso institucional. Tú decides qué va aquí.',
    secciones: [{ id: 'gratitud', titulo: '🙏 Gratitud', boton: 'Anotar gratitud', campos: [F('fecha', 'Fecha'), L('texto', 'Hoy agradezco…')], resumen: (r) => `${r.fecha || ''} · ${String(r.texto || '').slice(0, 80)}` }],
  },
  15: {
    intro: 'Tu propia forma de entender el sentido, integrando otras culturas. Culta y Zorro ya te aportan material (álbum de cosmovisiones).',
    linea: { texto: 'Ver mi álbum de cosmovisiones (Zorro)', ruta: 'zorro' },
    secciones: [{ id: 'idea', titulo: '🌌 Ideas que me resuenan', boton: 'Añadir idea', campos: [T('fuente', 'De dónde viene (cultura, autor, vivencia)'), L('idea', 'La idea'), L('uso', 'Cómo la vivo o la uso')], resumen: (r) => `${r.fuente || ''} · ${String(r.idea || '').slice(0, 80)}` }],
  },
  16: {
    intro: 'Tu proyecto grande, al final: tesis, “imperio”, libro. Aquí también viven tus metas de 2026 de tesis (avanzar más del 30 % y elegir el tema) y el informe de prácticas.',
    secciones: [
      { id: 'tesis', titulo: '📚 Mi tesis', desc: 'Trabajo de investigación para Bachiller (socialización y compromiso organizacional).', unico: true, campos: [T('tema', 'Tema o pregunta'), N('avance', 'Avance (%)'), T('proxima', 'Próxima acción pequeña'), F('fecha', 'Fecha para esa acción')], resumen: (r) => `${r.tema || 'Sin tema aún'} · ${r.avance || 0}%` },
      { id: 'avance', titulo: 'Avances de tesis', boton: 'Anotar avance', campos: [F('fecha', 'Fecha'), T('que', 'Qué avancé')], resumen: (r) => `${r.fecha || ''} · ${r.que || ''}` },
      { id: 'grande', titulo: '🏛️ Proyectos grandes', desc: 'Libro, cortometraje, imperio, legado…', boton: 'Añadir proyecto', estado: { k: 'estado', opciones: ['Idea', 'En marcha', 'Hecho'] }, campos: [T('nombre', 'Proyecto'), T('paso', 'Siguiente paso')], resumen: (r) => `${r.nombre || ''} · ${r.paso || ''}` },
    ],
  },
  17: {
    intro: 'Tu código explícito: los valores que no negocias. Debía escribirse en el mes 1; hoy puedes hacerlo sin apuro, uno por uno.',
    secciones: [{ id: 'principio', titulo: '📜 Mi código', desc: 'Hasta 7 principios.', max: 7, boton: 'Añadir principio', campos: [T('nombre', 'Principio'), SEL('ambito', 'Ámbito', ['De vida', 'Laboral']), L('significa', 'Qué significa para mí'), L('prueba', 'Una vez que lo cumplí (o lo que no negocio)')], resumen: (r) => `${r.nombre || ''} · ${r.ambito || ''}` }],
  },
  21: {
    intro: 'Ya ayudas mucho: aquí solo se le da forma, de manera intencional y sostenida.',
    secciones: [
      { id: 'intencion', titulo: '🤲 Mi intención de servicio', unico: true, campos: [T('causa', 'A quién o qué quiero ayudar'), T('como', 'Cómo (una forma realista)')], resumen: (r) => `${r.causa || ''} · ${r.como || ''}` },
      { id: 'accion', titulo: 'Acciones de servicio', boton: 'Anotar acción', campos: [F('fecha', 'Fecha'), T('que', 'Qué hice')], resumen: (r) => `${r.fecha || ''} · ${r.que || ''}` },
    ],
  },
  22: {
    intro: 'Cómo te presentas al mundo, coherente con tu voz, tus principios y tu propósito. Tu meta de 2026: abrirte más en redes con historias alineadas a ti.',
    aviso: 'Sin compararte con nadie y sin métricas de likes: aquí importa que seas coherente.',
    secciones: [
      { id: 'marca', titulo: '✨ Mi marca en una ficha', unico: true, campos: [L('bio', 'Mi bio en 2 líneas'), T('valores', 'Mis 3 valores'), T('mensaje', 'Mensaje clave'), T('publico', 'A quién le hablo')], resumen: (r) => `${String(r.bio || '').slice(0, 70)}` },
      { id: 'idea', titulo: 'Ideas de publicación', boton: 'Guardar idea', estado: { k: 'estado', opciones: ['Idea', 'Lista', 'Publicada'] }, campos: [T('idea', 'Idea'), SEL('formato', 'Formato', ['Historia', 'Foto', 'Video corto', 'Texto']), F('fecha', 'Fecha tentativa')], resumen: (r) => `${r.idea || ''} · ${r.formato || ''}` },
    ],
  },
}

// Tus 22 metas de 2026 (Notion · Objetivos 2026) y la fase con la que se conectan.
export const METAS_2026: { n: number; texto: string; fase: string }[] = [
  { n: 1, texto: 'Poner a Dios en primer lugar', fase: 'Fase 14' }, { n: 2, texto: 'Comer de forma saludable', fase: 'Fase 1' }, { n: 3, texto: 'Deporte, baile y/o ejercicio', fase: 'Fase 6' },
  { n: 4, texto: 'Sacar la licencia de conducir', fase: 'Sin fase aún' }, { n: 5, texto: 'Mejorar relaciones familiares y de amistad', fase: 'Fases 8 y 9' }, { n: 6, texto: 'Realizar prácticas pre-profesionales', fase: 'Fase 12' },
  { n: 7, texto: 'Avanzar la tesis más del 30 %', fase: 'Fase 16' }, { n: 8, texto: 'Nota igual o mayor a 16', fase: 'Culta' }, { n: 9, texto: 'Ser más higiénica (bañarse, lavar ropa)', fase: 'Fase 1' },
  { n: 10, texto: 'Cursos de especialización en Administración', fase: 'Culta' }, { n: 11, texto: 'Organizar apuntes, sílabos y documentos', fase: 'Culta' }, { n: 12, texto: 'Aprender portugués e inglés', fase: 'Sin fase aún' },
  { n: 13, texto: 'Elegir el tema de tesis y empezar', fase: 'Fase 16' }, { n: 14, texto: 'Trabajar tu manera de expresarte ante un público', fase: 'Voz y Fase 5' }, { n: 15, texto: 'Fortalecer confianza y seguridad', fase: 'Fase 5' },
  { n: 16, texto: 'Fortalecer tu CV', fase: 'Fase 12' }, { n: 17, texto: 'Asistir a un Congreso de Administración', fase: 'Fase 12' }, { n: 18, texto: 'Conocer más personas / red de contactos', fase: 'Fase 12' },
  { n: 19, texto: 'Abrirte más en redes (historias alineadas a tu propósito)', fase: 'Fase 22' }, { n: 20, texto: 'Gestionar el dinero eficientemente', fase: 'Fase 13' }, { n: 21, texto: 'Establecer tu proyecto de vida temporal', fase: 'Fases 16 y 17' },
  { n: 22, texto: 'Crear legado en la Escuela de Administración', fase: 'Fases 21 y 22' },
]
