import type { ClassValues } from './ClassValues'

export type Audit = {
  demand: ClassValues
  price: ClassValues
  updated?: string
  unlocks?: string
}
