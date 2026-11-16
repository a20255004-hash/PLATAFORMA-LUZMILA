// Banco de retos jugables. Todo el contenido es de práctica: no son datos tuyos.

export type JuegoId = 'palabras' | 'conectores' | 'garantia' | 'definicion' | 'giro' | 'remate' | 'conexion' | 'dosdir' | 'manzanitas' | 'cazadora' | 'cartas'
export const JUEGOS: { id: JuegoId; mundo: 'voz' | 'zorro' | 'culta' | 'mente'; emoji: string; nombre: string; desc: string; seg: number; color: string; entrena: string }[] = [
  { id: 'palabras', mundo: 'voz', emoji: '🧩', nombre: 'Lluvia de palabras', desc: 'Una categoría, 90 segundos, escribe todas las que te salgan.', seg: 90, color: 'var(--celeste)', entrena: 'Encontrar la palabra bajo tiempo' },
  { id: 'conectores', mundo: 'voz', emoji: '🔗', nombre: 'Une las ideas', desc: 'Dos frases y un conector: conviértelas en una sola.', seg: 60, color: 'var(--celeste)', entrena: 'Conectores, sobre todo causales' },
  { id: 'garantia', mundo: 'voz', emoji: '⚖️', nombre: 'La pieza que falta', desc: 'Te doy afirmación y evidencia. Tú escribes la garantía.', seg: 120, color: 'var(--celeste)', entrena: 'La garantía de Toulmin' },
  { id: 'definicion', mundo: 'zorro', emoji: '🤧', nombre: 'Definiciones locas', desc: 'Una palabra normal, una definición ridícula. Corta.', seg: 45, color: 'var(--mandarina)', entrena: 'Ingenio verbal' },
  { id: 'giro', mundo: 'zorro', emoji: '🥪', nombre: 'Frase con giro', desc: 'Una situación cotidiana convertida en una frase con gracia.', seg: 60, color: 'var(--mandarina)', entrena: 'Observación 2.0' },
  { id: 'remate', mundo: 'zorro', emoji: '🎤', nombre: 'Remate seco', desc: 'Ya están la calma y la tensión. Falta tu remate.', seg: 60, color: 'var(--mandarina)', entrena: 'Rakugo: el remate corto' },
  { id: 'cartas', mundo: 'zorro', emoji: '🌍', nombre: 'Cartas de cosmovisión', desc: 'Voltea una carta y llévate una idea de otra cultura.', seg: 0, color: 'var(--mandarina)', entrena: 'Curiosidad cultural' },
  { id: 'conexion', mundo: 'culta', emoji: '🧵', nombre: 'Hilo entre temas', desc: 'Dos temas que ya viste: encuentra qué los une.', seg: 90, color: 'var(--lila)', entrena: 'Ítem 10: conexión con lo aprendido' },
  { id: 'dosdir', mundo: 'culta', emoji: '↔️', nombre: 'En dos direcciones', desc: 'Un tema, un argumento a favor y uno en contra.', seg: 120, color: 'var(--lila)', entrena: 'Ítem 9: pensamiento crítico' },
  { id: 'manzanitas', mundo: 'culta', emoji: '🍎', nombre: 'Con manzanitas', desc: 'Explica un tema en 40 palabras, para alguien de 12 años.', seg: 75, color: 'var(--lila)', entrena: 'Explicar con tus palabras' },
  { id: 'cazadora', mundo: 'mente', emoji: '🧑‍⚖️', nombre: '¿Quién habla?', desc: 'Un pensamiento tramposo: adivina qué personaje lo dijo.', seg: 0, color: 'var(--rosa)', entrena: 'Reconocer distorsiones' },
]

export const PARES = [
  ['Estudié toda la tarde.', 'No terminé el capítulo.'], ['Llovió toda la noche.', 'Las calles amanecieron mojadas.'], ['El equipo tenía poco presupuesto.', 'Lanzó el producto a tiempo.'],
  ['Dormí mal.', 'Me costó concentrarme en clase.'], ['El precio subió.', 'Las ventas bajaron.'], ['Mi hermana prefiere el té.', 'Yo prefiero el café.'],
  ['No había señal.', 'No pude enviar el trabajo.'], ['La reunión fue larga.', 'Se tomaron buenas decisiones.'], ['Practicó todos los días.', 'Mejoró su pronunciación.'],
  ['El local es pequeño.', 'Siempre está lleno.'], ['Se fue la luz.', 'Seguimos trabajando con velas.'], ['Leí las instrucciones.', 'Armé el mueble sin problemas.'],
]
export const CONECTOR_TIPO: Record<string, string> = {
  aunque: 'concesión: a pesar de lo primero, pasa lo segundo', porque: 'causa: lo que viene después explica lo anterior', 'a pesar de que': 'concesión', 'ya que': 'causa: introduce el motivo, no la consecuencia',
  'sin embargo': 'contraste: la segunda idea va en contra de la primera', 'de modo que': 'consecuencia: lo que viene después es el resultado', 'dado que': 'causa: introduce el motivo', 'mientras que': 'paralelo: compara dos cosas, no las contradice',
}

export const CASOS_GARANTIA = [
  { a: 'La empresa debería ofrecer horario flexible.', e: 'En el área donde se probó, las tardanzas bajaron a la mitad.' },
  { a: 'Conviene leer en papel antes de un examen.', e: 'Los estudiantes que leyeron en papel recordaron más detalles una semana después.' },
  { a: 'El municipio debería poner más ciclovías.', e: 'En las avenidas con ciclovía hubo menos accidentes de ciclistas.' },
  { a: 'La universidad necesita un reglamento sobre el uso de IA.', e: 'Cada profesor aplica hoy un criterio distinto para el mismo trabajo.' },
  { a: 'Una pyme debería registrar todos sus gastos.', e: 'Las que lo hicieron detectaron fugas de dinero que no veían.' },
  { a: 'Las reuniones deberían durar máximo 30 minutos.', e: 'En las reuniones cortas se tomaron la misma cantidad de decisiones.' },
  { a: 'Es mejor estudiar un poco cada día que todo la víspera.', e: 'Quienes repasaron en varios días olvidaron menos al mes.' },
  { a: 'El restaurante debería reducir su carta.', e: 'Con menos platos, la cocina desperdició menos insumos.' },
]

export const PALABRAS_LOCAS = ['lunes', 'wifi', 'combi', 'alarma', 'fila', 'ascensor', 'mochila', 'audio de WhatsApp', 'reunión', 'cargador', 'examen', 'feriado', 'impresora', 'paradero', 'contraseña', 'grupo de trabajo', 'bostezo', 'tupper', 'siesta', 'semáforo', 'chancla', 'agenda']
export const SITUACIONES = ['El bus va llenísimo.', 'Se cae el wifi en plena clase.', 'La impresora se queda sin tinta justo hoy.', 'Suena tu alarma por quinta vez.', 'Llegas y la fila da la vuelta a la esquina.', 'Tu celular tiene 2 % de batería.', 'Te saludan y no recuerdas el nombre.', 'El micro pasa de largo.', 'Abres la refri y solo hay salsas.', 'Mandas un audio de tres minutos sin querer.', 'El ascensor se detiene en todos los pisos.', 'Estudias el tema que no entró.']
export const ESCENAS = [
  { c: 'Llegué temprano a clase, con mi café y mis apuntes ordenados.', t: 'Me senté en primera fila y noté que nadie más entraba.' },
  { c: 'Me arreglé con calma para la entrevista.', t: 'En la sala, el entrevistador miraba fijo hacia mis pies.' },
  { c: 'Preparé un almuerzo saludable para toda la semana.', t: 'El lunes abrí el tupper frente a todos.' },
  { c: 'Por fin ordené mi cuarto de arriba abajo.', t: 'Al día siguiente necesité mi DNI.' },
  { c: 'Salí a correr decidida a empezar una vida nueva.', t: 'A la segunda cuadra vi una panadería abierta.' },
  { c: 'Le escribí un mensaje largo y sentido a mi amiga.', t: 'Le di enviar y vi el nombre del chat.' },
]

export const AFIRMACIONES_TEMA = ['siempre funciona', 'sirve para cualquier organización', 'es más útil en la teoría que en la práctica', 'debería enseñarse en el colegio']

export const PENSAMIENTOS = [
  { p: 'Si no lo hago perfecto, mejor no lo hago.', r: 'La de Blanco y Negro', w: 'Solo ve dos opciones: perfecto o nada. Entre medio hay mil versiones válidas.' },
  { p: 'Fallé un día, ya se arruinó toda la semana.', r: 'La de Blanco y Negro', w: 'Un día no es un patrón. Convierte un punto en toda la línea.' },
  { p: 'O me sale a la primera o no es lo mío.', r: 'La de Blanco y Negro', w: 'Todo o nada, sin espacio para aprender.' },
  { p: 'Debí saberlo; cualquiera lo sabría.', r: 'La Jueza Extrema', w: 'Dicta sentencia con un “debí” y una vara que no le pondría a nadie más.' },
  { p: 'No tengo derecho a descansar hasta terminar todo.', r: 'La Jueza Extrema', w: 'Impone un castigo. El descanso no se gana: se necesita.' },
  { p: 'Reaccioné mal una vez, así que soy mala persona.', r: 'La Jueza Extrema', w: 'Juzga a la persona entera por un solo acto.' },
  { p: 'Saqué buena nota, pero fue pura suerte.', r: 'La Restadora', w: 'Le resta valor a lo que sí salió bien.' },
  { p: 'Me felicitaron, pero seguro lo hacen con todos.', r: 'La Restadora', w: 'Descuenta el reconocimiento antes de recibirlo.' },
  { p: 'Sí lo logré, pero no cuenta porque era fácil.', r: 'La Restadora', w: 'Cambia la regla después de ganar para que no valga.' },
  { p: 'Seguro me va a ir mal en la exposición.', r: 'La Adivina', w: 'Predice el futuro sin datos, y siempre le sale lo peor.' },
  { p: 'Si le escribo, se va a molestar.', r: 'La Adivina', w: 'Adivina la reacción de otra persona sin haberla comprobado.' },
  { p: 'Ni lo intento: ya sé que no me van a elegir.', r: 'La Adivina', w: 'Da por hecho el resultado y se ahorra el intento.' },
]
export const PERSONAJES = ['La Jueza Extrema', 'La de Blanco y Negro', 'La Restadora', 'La Adivina']

export const CARTAS = [
  { n: 'Ayni', de: 'Andes', e: '🤝', t: 'Reciprocidad: hoy por ti, mañana por mí. Dar y recibir mantiene el equilibrio.', h: 'Deja que alguien te ayude hoy sin sentir que “debes” algo.' },
  { n: 'Allin kawsay', de: 'Andes', e: '🌾', t: 'El buen vivir: estar bien no es tener más, sino vivir en equilibrio con los demás y con la tierra.', h: 'Ante un roce, pregúntate qué lo devuelve al equilibrio, no quién ganó.' },
  { n: 'Wabi-sabi', de: 'Japón', e: '🍵', t: 'La belleza de lo imperfecto, lo incompleto y lo que pasa.', h: 'Deja hoy algo “suficientemente bien” a propósito.' },
  { n: 'Arugamama', de: 'Japón · terapia Morita', e: '🎋', t: 'Aceptar lo que sientes tal como es, y actuar igual según tu propósito.', h: 'Haz una cosa pequeña con el nervio presente, sin esperar a que se vaya.' },
  { n: 'Kintsugi', de: 'Japón', e: '🏺', t: 'La cerámica rota se repara con oro: la grieta pasa a ser parte de la historia.', h: 'Nombra una “grieta” tuya que hoy te hace más interesante.' },
  { n: 'Warai y rakugo', de: 'Japón', e: '🎭', t: 'La risa como práctica seria: un solo narrador, sentado, cuenta una historia con remate.', h: 'Cuenta algo de tu día en tres tiempos: calma, tensión, remate.' },
  { n: 'Craic', de: 'Irlanda', e: '🍀', t: 'Un buen rato compartido: conversación, risa y energía. No hace falta que sea gracioso.', h: 'Busca hoy cinco minutos de buen craic con alguien.' },
  { n: 'Ubuntu', de: 'África austral', e: '🌍', t: '“Soy porque somos”: una persona se hace persona a través de las demás.', h: 'Agradece a alguien que te ayudó a ser quien eres.' },
  { n: 'El Trickster', de: 'Zorro andino, Coyote, Anansi', e: '🦊', t: 'El personaje que rompe las reglas y, por eso mismo, enseña.', h: 'Convierte un error pequeño de hoy en un momento Zorro.' },
  { n: 'Dicotomía del control', de: 'Estoicismo', e: '🏛️', t: 'Separar lo que depende de ti de lo que no, y poner la energía en lo primero.', h: 'De lo que hoy te preocupa, subraya solo lo que sí depende de ti.' },
]

export const al = <T,>(xs: T[]): T => xs[Math.floor(Math.random() * xs.length)]
export const sinTildes = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
export const palabrasDe = (s: string) => s.trim().split(/\s+/).filter(Boolean).length
