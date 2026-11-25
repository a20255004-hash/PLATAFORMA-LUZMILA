import { create } from 'zustand'
import type { Evaluacion } from './cerebro'

type Modo = Evaluacion['modo']
export const useCoach = create<{ modo: Modo; tema: string; abrir: (modo: Modo, tema?: string) => void }>((set) => ({
  modo: 'explicar', tema: '',
  abrir: (modo, tema = '') => set({ modo, tema }),
}))
