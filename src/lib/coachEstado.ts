import { create } from 'zustand'
import type { Evaluacion } from './cerebro'

type Modo = Evaluacion['modo']
export const useCoach = create<{ modo: Modo; tema: string; abrir: (modo: Modo, tema?: string) => void }>((set) => ({
  modo: 'explicar', tema: '',
  abrir: (modo, tema = '') => set({ modo, tema }),
}))

export const useQuiz = create<{ tema: string; bloque: 'B1' | 'B2' | 'B3'; k: number; abierto: boolean; abrir: (tema: string, bloque: 'B1' | 'B2' | 'B3') => void; cerrar: () => void }>((set) => ({
  tema: '', bloque: 'B1', k: 0, abierto: false,
  abrir: (tema, bloque) => set((s) => ({ tema, bloque, abierto: true, k: s.k + 1 })),
  cerrar: () => set({ abierto: false }),
}))
export const useCultaTab = create<{ tab: 'sesiones' | 'ruleta' | 'temario' | 'fuentes'; poner: (t: 'sesiones' | 'ruleta' | 'temario' | 'fuentes') => void }>((set) => ({ tab: 'sesiones', poner: (tab) => set({ tab }) }))
