import type { ClassValues, Route } from '@autopilot/shared'
import { ARN } from '../hubs/ARN.js'
import { BMA } from '../hubs/BMA.js'
import { VST } from '../hubs/VST.js'
import { AircraftConfiguration } from '../types/Aircraft.js'
import type { Network } from '../types/Network.js'

export const network: Network = {
  ARN,
  BMA,
  VST,
}

export const getCapacity = (route: Route): ClassValues | undefined => {
  const hub = route.departure.id.toUpperCase()
  const destination = route.destination.id

  if (!network[hub]) {
    console.warn(`No network data for hub: ${hub}`)
    return undefined
  }

  const capacity: ClassValues = {
    economy: 0,
    business: 0,
    first: 0,
    cargo: 0,
  }

  for (const circuit of Object.values(network[hub])) {
    if (circuit.destinations.includes(destination)) {
      let totalCapacity = 0
      for (const [wave, count] of Object.entries(circuit.waves)) {
        totalCapacity += count

        const aircraft =
          AircraftConfiguration[wave as keyof typeof AircraftConfiguration]
        capacity.economy += aircraft.economy * count * 2
        capacity.business += aircraft.business * count * 2
        capacity.first += aircraft.first * count * 2
        capacity.cargo += aircraft.cargo * count * 2
      }
    }
  }

  return capacity
}
