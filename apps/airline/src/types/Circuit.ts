import type { Aircraft } from './Aircraft.js'

export type Circuit = {
  destinations: string
  waves: Partial<Record<Aircraft, number>>
}
