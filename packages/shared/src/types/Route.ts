import type { Hub } from './Hub.js'
import type { ID } from './ID.js'

export type Route = ID & {
  departure: Hub
  destination: Hub
}
