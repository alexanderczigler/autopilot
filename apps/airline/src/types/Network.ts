import type { Circuits } from './Circuits.js'

export type Network = {
  [hub: string]: Circuits
}
