// Exporta recordatorios y fechas límite como archivo de calendario (.ics) para que suenen en la alarma del celular,
// incluso con la página cerrada. Hora flotante (la que tengas en tu teléfono).
export type EventoICS = { uid: string; resumen: string; descripcion?: string; fecha: string; hora?: string; durMin?: number; rrule?: string; alarmas?: string[] }

const esc = (t: string) => t.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\;')
const d8 = (f: string) => f.replaceAll('-', '')
const hms = (h: string) => h.replace(':', '') + '00'
const sumaMin = (f: string, h: string, min: number) => { const [y, m, d] = f.split('-').map(Number); const [hh, mm] = h.split(':').map(Number); const t = new Date(y, m - 1, d, hh, mm + min); const p = (n: number) => String(n).padStart(2, '0'); return `${t.getFullYear()}${p(t.getMonth() + 1)}${p(t.getDate())}T${p(t.getHours())}${p(t.getMinutes())}00` }
const plegar = (l: string) => (l.length <= 74 ? l : l.match(/.{1,73}/g)!.join('\r\n '))

export function construirICS(eventos: EventoICS[], nombre = 'Proyecto Luzmila') {
  const ahora = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z'
  const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Proyecto Luzmila//ES', 'CALSCALE:GREGORIAN', `X-WR-CALNAME:${esc(nombre)}`]
  for (const e of eventos) {
    L.push('BEGIN:VEVENT', `UID:${e.uid}@luzmila`, `DTSTAMP:${ahora}`)
    if (e.hora) { L.push(`DTSTART:${d8(e.fecha)}T${hms(e.hora)}`, `DTEND:${sumaMin(e.fecha, e.hora, e.durMin || 10)}`) }
    else { L.push(`DTSTART;VALUE=DATE:${d8(e.fecha)}`) }
    if (e.rrule) L.push(`RRULE:${e.rrule}`)
    L.push(plegar(`SUMMARY:${esc(e.resumen)}`))
    if (e.descripcion) L.push(plegar(`DESCRIPTION:${esc(e.descripcion)}`))
    for (const a of e.alarmas || ['PT0S']) L.push('BEGIN:VALARM', 'ACTION:DISPLAY', plegar(`DESCRIPTION:${esc(e.resumen)}`), `TRIGGER:${a}`, 'END:VALARM')
    L.push('END:VEVENT')
  }
  L.push('END:VCALENDAR')
  return L.join('\r\n')
}

export const bajarICS = (texto: string, nombre: string) => {
  const blob = new Blob([texto], { type: 'text/calendar;charset=utf-8' })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nombre; a.click(); URL.revokeObjectURL(a.href)
}

/** Enlace para añadir UN evento (con repetición) a Google Calendar con un toque. */
export const enlaceGoogle = (e: EventoICS) => {
  const ini = e.hora ? `${d8(e.fecha)}T${hms(e.hora)}` : d8(e.fecha)
  const fin = e.hora ? sumaMin(e.fecha, e.hora, e.durMin || 10) : d8(e.fecha)
  const q = new URLSearchParams({ action: 'TEMPLATE', text: e.resumen, details: e.descripcion || '', dates: `${ini}/${fin}`, ctz: 'America/Lima' })
  if (e.rrule) q.set('recur', 'RRULE:' + e.rrule)
  return `https://calendar.google.com/calendar/render?${q.toString()}`
}
