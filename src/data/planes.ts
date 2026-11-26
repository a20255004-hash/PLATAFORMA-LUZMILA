// Plan paso a paso de cada fase (5 a 22), con su porqué: lo que dice la evidencia científica y, aparte, el saber tradicional.
// Cada paso es pequeño y se puede hacer en la versión mínima. Nada de esto es diagnóstico ni reemplaza apoyo profesional.
export type Plan = {
  ciencia: string; tradicion?: string
  pasos: string[]
  entregables: string[]
  gana: string // cómo se celebra (o por qué no hay puntos)
  minima: string
  alerta?: string
  chip?: string
}

export const PLANES: Record<number, Plan> = {
  5: {
    ciencia: 'La exposición gradual (Wolpe) reduce la evitación: se empieza por lo menos temido. El modelo de Clark y Wells explica que la autovigilancia social mantiene el miedo; mirar tu situación “desde afuera” (Kross) y el “liking gap” (Boothby: caemos mejor de lo que creemos) ayudan a bajar la guardia.',
    tradicion: 'Morita (Japón) propone arugamama: aceptar el nervio como está y actuar igual. En lo andino, el allin kawsay busca equilibrio en la relación, no ausencia de roce.',
    pasos: ['Nombra a tu alter ego y elige 3 rasgos que quieres sacar a pasear', 'Un saludo extra a alguien de bajo riesgo esta semana', 'Sal del baño sin esperar a que no haya nadie, aunque no saludes', 'Propón un plan pequeño (un café, una salida corta)', 'Elige una “mueca o frase” de tu firma auténtica y úsala una vez', 'Anota en el Expediente qué pasó realmente frente a lo que temías'],
    entregables: ['Ficha de tu alter ego', 'Firma de personalidad (muecas, frases, jergas)', 'Biblioteca de guiones para poner límites', 'Escalera de exposición con 4 peldaños hechos'],
    gana: '+2 XP cada vez que activas tu alter ego (cuenta aunque no salga perfecto) y la insignia “Racha de valentía” al completar 4 semanas.',
    minima: 'Un solo saludo en la semana. Eso ya es un peldaño.',
    chip: 'Hacerlo con el nervio presente cuenta doble.',
  },
  6: {
    ciencia: 'Moverse con regularidad mejora el ánimo y la energía; la constancia de sesiones cortas pesa más que la intensidad (la OMS sugiere 150–300 minutos semanales de actividad moderada en adultos). La motivación dura más cuando eliges algo que disfrutas (Deci y Ryan, autodeterminación).',
    tradicion: 'La danza y el movimiento en comunidad (fiestas, danzas andinas, baile) son formas tradicionales de ejercicio con alegría, sin medir nada.',
    pasos: ['Elige UNO: muay thai, natación o tenis de mesa, por la menor fricción', 'Fija tus 2 días y la hora (ya en tu calendario)', 'Primera sesión: de prueba, sin exigencia', 'Segunda semana: repite los mismos 2 días', 'A las 3 semanas, revisa si sumar otro o ajustar el horario', 'Cada 4 sesiones, celebra tu cinturón'],
    entregables: ['Deporte elegido con días y lugar', '4 sesiones registradas', 'Primer cinturón'],
    gana: '+2 XP por sesión y cinturones cada 4 sesiones (blanco, amarillo, naranja…). Nada de peso, calorías ni medidas.',
    minima: 'Una sesión corta a la semana, o 10 minutos de baile en casa.',
    alerta: 'Esta fase está separada a propósito de cualquier meta de peso o imagen corporal: no se usa para compensar comida ni culpa.',
  },
  7: {
    ciencia: 'El ocio libre (sin meta de productividad) se asocia con más bienestar y recuperación; las actividades “paratélicas” se hacen por el placer de hacerlas, no por el resultado (Apter). Te ayuda a salir del “todo tiene que servir”.',
    tradicion: 'Para Aristóteles el ocio (scholé) era el fin de la vida buena, no un descanso para volver a trabajar. En lo andino, la fiesta y el compartir son parte del equilibrio.',
    pasos: ['Escoge un momento fijo a la semana (aunque sea 30 minutos)', 'Elige algo de tu lista: teatro o improvisación, dibujo, una peli, un lugar bello', 'Hazlo sin tomar notas ni medirlo', 'Solo después, anota una línea: qué fue y cómo se sintió', 'Repite o cambia: no tiene que ser lo mismo'],
    entregables: ['Un momento semanal fijo', 'Registro de momentos de disfrute (sin puntos)'],
    gana: 'No hay puntos, rachas ni promedios: es zona libre de evaluación. Solo queda el registro de que lo disfrutaste.',
    minima: 'Un momento de disfrute al mes ya cuenta.',
  },
  8: {
    ciencia: 'Las relaciones pasan por rupturas y reparaciones todo el tiempo; lo que las sostiene es reparar (Tronick). Un mensaje ligero funciona mejor de lo que imaginamos (Boothby; Kumar y Epley sobre sorprender con gratitud). Nuestro círculo cercano es pequeño por naturaleza (Dunbar), así que cuidar a pocas personas vale la pena.',
    tradicion: 'El ayni (reciprocidad andina): se cuida la relación dando y recibiendo en pequeño, de forma constante.',
    pasos: ['Identifica 1 vínculo en pausa', 'Escribe el mensaje más ligero posible (“vi esto y me acordé de ti”)', 'Envíalo sin esperar respuesta', 'Anota en el Expediente qué pasó realmente frente a lo que temías', 'Si hubo respuesta, propón algo pequeño (un café, una llamada corta)', 'Elige el siguiente vínculo cuando te sientas lista'],
    entregables: ['Lista de vínculos en pausa', 'Mensajes ligeros enviados', 'Registro “qué pasó vs. qué temía”'],
    gana: 'Insignia “Puente reconstruido” por cada vínculo reactivado. Cuenta el intento, responda o no la otra persona.',
    minima: 'Un mensaje ligero en el mes.',
    chip: 'Cuenta el intento, no la respuesta.',
  },
  9: {
    ciencia: 'La teoría de los sistemas familiares (Bowen) y la teoría del apego (Bowlby, Ainsworth) muestran cómo aprendemos patrones en casa. Un genograma (McGoldrick y Gerson) sirve para ver patrones sin buscar culpables. El trabajo con historias de infancia difíciles se hace mejor acompañada por un profesional especializado.',
    tradicion: 'El ayllu entiende a la familia como una red de apoyo mutuo, con deberes y cuidados en las dos direcciones.',
    pasos: ['Decide si quieres abrir esta fase y a qué ritmo (puedes cerrarla cuando quieras)', 'Si lo deseas, busca acompañamiento profesional en paralelo', 'Dibuja un mapa familiar simple (quién es quién, sin juicios)', 'Escribe notas privadas sobre lo que observas, solo cuando tú quieras', 'Piensa en un límite pequeño y cuidado que quieras probar', 'Anota qué te llevas de cada conversación, sin exigirte conclusiones'],
    entregables: ['Mapa familiar', 'Notas privadas', 'Un límite pensado con calma'],
    gana: 'No hay puntos, retos ni rachas en esta fase. El éxito es ir a tu ritmo.',
    minima: 'Dejarla cerrada es una decisión válida.',
    alerta: 'Si algo de esto te remueve mucho, pausa y busca apoyo profesional. La plataforma nunca te mostrará esto de vuelta por sorpresa.',
  },
  10: {
    ciencia: 'El estilo de apego (Hazan y Shaver) y los patrones de comunicación (Gottman describe cuatro señales de riesgo: crítica, desprecio, defensiva y muro de silencio) ayudan a entender cómo nos vinculamos. La comunicación no violenta (Rosenberg) ofrece una forma de expresar necesidades. Es reflexión, no diagnóstico.',
    tradicion: 'El chacha-warmi andino entiende la pareja como complementariedad: dos que se equilibran y comparten el trabajo y la decisión.',
    pasos: ['Escribe lo que valoras y lo que no negocias en una relación', 'Revisa tus patrones al vincularte, sin etiquetarte', 'Practica decir una necesidad en una frase clara (observación, sentimiento, necesidad, pedido)', 'Nota qué señales de alerta quieres reconocer a tiempo', 'Decide qué ritmo quieres para conocer a alguien'],
    entregables: ['Lista de valores y no negociables', 'Notas privadas de patrones', 'Frases de necesidades practicadas'],
    gana: 'Sin puntos ni retos. Se abre solo después de trabajar Familia de Origen y a tu ritmo.',
    minima: 'Escribir tus no negociables en una nota.',
    alerta: 'Esta fase se trabaja mejor con acompañamiento profesional y cuando te sientas segura.',
  },
  11: {
    ciencia: 'Aclarar valores (terapia de aceptación y compromiso, Hayes) orienta decisiones a largo plazo mejor que fijar metas sueltas. Imaginar tu vida futura con detalle aumenta la probabilidad de actuar hacia ella (visualización del “mejor yo posible”, King).',
    tradicion: 'La familia ampliada y la comunidad (ayllu) como red de cuidado: se piensa en “quiénes me sostienen” además de en la pareja.',
    pasos: ['Escribe 5 valores que quieres para tu familia', 'Describe un día normal de tu vida futura con detalle', 'Lista lo que quieres repetir de tu familia y lo que quieres distinto', 'Piensa en qué necesitas tener resuelto antes (sin presión de fecha)', 'Guarda una carta para tu yo futuro'],
    entregables: ['Valores de tu familia futura', 'Descripción de un día normal', 'Carta a tu yo futuro'],
    gana: 'Sin puntos. Es un espacio de imaginación, sin plazo.',
    minima: 'Un solo valor escrito.',
  },
  12: {
    ciencia: 'Los intereses vocacionales (Holland, RIASEC) y la “casualidad planeada” (Krumboltz: probar cosas pequeñas y aprovechar oportunidades) funcionan mejor que decidir en abstracto. Una matriz de decisión con criterios ponderados reduce el sesgo de elegir por ansiedad.',
    tradicion: 'Ikigai (Japón): buscar la intersección entre lo que amas, lo que se te da bien, lo que el mundo necesita y por lo que te pagan; úsalo como conversación, no como fórmula.',
    pasos: ['Lista tus 4 opciones (Administración, PNP, diplomacia, consultoría) y las que quieras sumar', 'Para cada una, anota qué te atrae y qué pide (estudios, exámenes, tiempos)', 'Habla con una persona que ya esté ahí (una conversación de 20 minutos)', 'Haz un mini experimento (un curso corto, una visita, un voluntariado)', 'Compara con criterios: interés, ingreso, requisitos, impacto', 'Elige el siguiente paso, no la decisión final'],
    entregables: ['Matriz de opciones', 'Conversaciones con personas del área', 'Un mini experimento hecho', 'CV fortalecido'],
    gana: 'Insignia “Exploradora” por cada conversación y mini experimento. Sin puntos de XP.',
    minima: 'Una conversación de 20 minutos al mes.',
  },
  13: {
    ciencia: 'Registrar sin juzgar durante 2 semanas da más información que cualquier propósito; “pagarte primero” (ahorrar un monto fijo al recibir ingresos) y poner topes por categoría ayudan a sostener el hábito (Thaler: cuentas mentales; Gollwitzer: intenciones de implementación). La regla 50/30/20 (Warren y Tyagi) es una guía, no una ley.',
    tradicion: 'El pandero o la junta (ahorro rotativo entre personas de confianza) y las “alcancías” por sobres son formas tradicionales de ahorrar con estructura externa.',
    pasos: ['Durante 2 semanas, anota cada compra sin juzgarla', 'Agrupa por categorías y mira qué sorprende', 'Pon un tope semanal solo en 1 o 2 categorías', 'Aparta un monto pequeño y fijo apenas recibas dinero', 'Define un hito de independencia con fecha tentativa (habitación, ahorro mínimo)', 'Revisa cada domingo en 5 minutos'],
    entregables: ['Registro de compras de 2 semanas', 'Tope por categoría', 'Hito de independencia'],
    gana: 'Insignia “Cuentas claras” a las 2 semanas de registro (con la regla de 48 h, nunca castigo). Sin comparaciones.',
    minima: 'Anotar solo las compras de más de S/ 10.',
    alerta: 'Tus montos viven solo en tu dispositivo.',
  },
  14: {
    ciencia: 'Practicar gratitud (anotar 3 cosas que agradeces) aumenta el bienestar a corto plazo (Emmons y McCullough, 2003). Unos minutos de silencio o atención plena ayudan a regular el estrés.',
    tradicion: 'Tu fe es personal: creer en Dios y en su amor. En la tradición andina, el “pago a la tierra” es un gesto de agradecimiento. Aquí cada quien decide su forma.',
    pasos: ['Cada noche o mañana, anota una cosa que agradeces', 'Dos minutos de silencio o respiración, sin meta', 'Elige un texto o frase que te acompañe (tú decides cuál)', 'Una vez a la semana, escribe una gratitud más larga', 'Revisa qué prácticas son tuyas y cuáles heredadas'],
    entregables: ['Gratitudes anotadas', 'Tu frase o texto elegido'],
    gana: 'No hay puntos. Es opcional y sin doctrina ni intermediarios.',
    minima: 'Una gratitud a la semana.',
  },
  15: {
    ciencia: 'Encontrar sentido protege el bienestar (Frankl, logoterapia). Contrastar cosmovisiones amplía la flexibilidad mental.',
    tradicion: 'Cosmovisión andina (ayni, tiempo circular, tres mundos); wabi-sabi (belleza en lo imperfecto); ubuntu (“soy porque somos”); craic y warai, que ya viste en el Zorro.',
    pasos: ['Recoge 5 ideas de culturas o personas que te resuenen (tu álbum de Zorro ya tiene varias)', 'Escribe qué te dice cada una sobre cómo vivir', 'Elige una y úsala ante una situación difícil de la semana', 'Escribe tu propia frase: “para mí, lo que da sentido es…”', 'Vuelve a leerla cada mes y ajústala'],
    entregables: ['5 ideas con su “por qué me resuena”', 'Tu frase de sentido'],
    gana: 'Sin puntos. Se alimenta de Culta y del Zorro.',
    minima: 'Una idea al mes.',
  },
  16: {
    ciencia: 'Escribir en bloques pequeños y regulares rinde más que las maratones (Boice). Las intenciones de implementación (“si es martes a las 5 pm, entonces escribo 25 minutos”) aumentan mucho la probabilidad de empezar (Gollwitzer).',
    tradicion: 'Minka: un gran trabajo se hace entre varios y por turnos; pedir ayuda a tu asesor o a compañeros es parte del método.',
    pasos: ['Compara tus 4 temas de tesis con una matriz (interés, viabilidad, datos, asesor)', 'Elige tema y redacta la pregunta de investigación en 1 frase', 'Define el siguiente paso de 25 minutos y su día y hora', 'Marca hitos: 10 %, 30 %, 50 %', 'Para proyectos grandes (libro, cortometraje): escribe la “idea semilla” en 3 líneas', 'Cada domingo, anota el avance de la semana'],
    entregables: ['Tema y pregunta de tesis', 'Hitos con fecha', 'Idea semilla de tu proyecto grande'],
    gana: 'Barra de avance de tu tesis (%) e insignias al 10 %, 30 % y 50 %. Sin puntos de XP.',
    minima: '25 minutos a la semana.',
    chip: 'Un bloque pequeño a la vez.',
  },
  17: {
    ciencia: 'Aclarar valores (Schwartz; Hayes) hace que las decisiones difíciles sean menos agotadoras. Un valor sirve cuando lo puedes traducir en conductas observables.',
    tradicion: 'El código andino: ama sua, ama llulla, ama quella (no robar, no mentir, no ser ocioso). Las virtudes cardinales estoicas (sabiduría, justicia, coraje y moderación) son otra referencia.',
    pasos: ['De una lista de 20 valores, marca los que sientes tuyos', 'Reduce a 7 y luego a 5 como máximo', 'Para cada uno, escribe qué significa y una vez que lo cumpliste', 'Haz una versión laboral (qué no negocias en el trabajo)', 'Léelo cada domingo y ajusta una palabra si hace falta'],
    entregables: ['Documento “Mi código” (hasta 7 principios)', 'Versión laboral'],
    gana: 'Insignia “Mi código” al escribir tus principios. Sin XP: son tuyos, no un examen.',
    minima: 'Un principio, bien escrito.',
  },
  21: {
    ciencia: 'Gastar o dar a otros aumenta la felicidad más que gastar en uno mismo (Dunn, Aknin y Norton, 2008). Pero ayudar sin límites agota: elegir una causa y un monto de tiempo protege la energía.',
    tradicion: 'Ayni (reciprocidad) y minka (trabajo comunitario) son la base andina del servicio: se ayuda en comunidad, en turnos y sin sacrificarse sola.',
    pasos: ['Anota lo que ya haces por otros (más de lo que crees)', 'Elige una causa o grupo al que quieras ayudar', 'Define una acción concreta y un tiempo mensual', 'Hazla y anota qué sentiste', 'Revisa tus límites: ayudar no es sacrificarte'],
    entregables: ['Inventario de lo que ya haces', 'Intención de servicio', 'Acciones registradas'],
    gana: 'Insignia “Minka” a las 3 acciones. Sin XP.',
    minima: 'Una acción al mes.',
  },
  22: {
    ciencia: 'Una marca personal coherente se construye con identidad (valores, voz, propósito) y constancia, no con likes. Publicar con regularidad pequeña mejora la claridad sobre lo que quieres decir.',
    pasos: ['Escribe tu bio en 2 líneas', 'Elige 3 valores y 1 mensaje clave', 'Define 3 pilares de contenido (de qué hablas)', 'Planifica 1 publicación por semana, 4 semanas', 'Publica la primera sin revisar métricas', 'Revisa al mes si lo publicado se parece a ti'],
    entregables: ['Ficha de marca', '3 pilares de contenido', '4 publicaciones planificadas'],
    gana: 'Insignia “Mi voz en público” a las 4 semanas de constancia. Sin métricas de likes.',
    minima: 'Una idea guardada al mes.',
    alerta: 'Nada de compararte: aquí importa que seas coherente.',
  },
}
