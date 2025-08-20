import type { Aircraft } from './Aircraft.js'

export type Wave = {
  [K in keyof Aircraft]: number
}
