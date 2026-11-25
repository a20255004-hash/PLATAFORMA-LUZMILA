import '@fontsource/montserrat/800.css'
import '@fontsource/playfair-display/800.css'
import '@fontsource/abril-fatface/400.css'
import '@fontsource/righteous/400.css'
import '@fontsource/sora/800.css'
import '@fontsource/bebas-neue/400.css'

// Letras que se pueden elegir para el nombre y los títulos. Cada una tiene su versión 3D (se carga solo si se usa).
export const LETRAS = [
  { id: 'montserrat', nombre: 'Montserrat', css: "'Montserrat', sans-serif", peso: 800, f3d: () => import('./fuentes3d/montserrat.json') },
  { id: 'playfair', nombre: 'Playfair', css: "'Playfair Display', serif", peso: 800, f3d: () => import('./fuentes3d/playfair.json') },
  { id: 'abril', nombre: 'Abril', css: "'Abril Fatface', serif", peso: 400, f3d: () => import('./fuentes3d/abril.json') },
  { id: 'righteous', nombre: 'Righteous', css: "'Righteous', sans-serif", peso: 400, f3d: () => import('./fuentes3d/righteous.json') },
  { id: 'sora', nombre: 'Sora', css: "'Sora', sans-serif", peso: 800, f3d: () => import('./fuentes3d/sora.json') },
  { id: 'bebas', nombre: 'Bebas', css: "'Bebas Neue', sans-serif", peso: 400, f3d: () => import('./fuentes3d/bebas.json') },
  { id: 'condensada', nombre: 'Condensada', css: "'Roboto Condensed Variable', 'Roboto Condensed', sans-serif", peso: 700, f3d: () => import('./fuentes3d/condensada.json') },
] as const
export type LetraId = (typeof LETRAS)[number]['id']
export const letraDe = (id?: string) => LETRAS.find((l) => l.id === id) || LETRAS[0]
export const LETRA_TITULOS_BASE = 'condensada'
