import type { ClassValues } from './ClassValues.js'

export type Audit = {
  demand: ClassValues
  price: ClassValues
  updated?: string
  unlocks?: string
}
