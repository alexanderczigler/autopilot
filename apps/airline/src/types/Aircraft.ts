export const AircraftConfiguration = {
  '767-200': { economy: 184, business: 40, first: 8, cargo: 11 },
  '767-300': { economy: 231, business: 44, first: 8, cargo: 14 },
  '767-300F': { economy: 0, business: 0, first: 0, cargo: 53 },
  'A220-100': { economy: 75, business: 16, first: 4, cargo: 5 },
  'A220-300': { economy: 80, business: 20, first: 8, cargo: 7 },
  'A350-1000': { economy: 355, business: 60, first: 14, cargo: 11 },
} as const

export type Aircraft = keyof typeof AircraftConfiguration
