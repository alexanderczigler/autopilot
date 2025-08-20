import type { ClassValues } from '@autopilot/shared'

export const getSuperSimulatorPrice = ({
  auditPrice,
  capacity,
  demand,
}: { auditPrice: ClassValues; capacity: ClassValues; demand: ClassValues }) => {
  return {
    business: getTicketPrice(
      auditPrice.business,
      capacity.business,
      demand.business
    ),
    cargo: getTicketPrice(auditPrice.cargo, capacity.cargo, demand.cargo),
    economy: getTicketPrice(
      auditPrice.economy,
      capacity.economy,
      demand.economy
    ),
    first: getTicketPrice(auditPrice.first, capacity.first, demand.first),
  } as ClassValues
}

export const getTicketPrice = (
  auditFare: number,
  capacity: number,
  auditDemand: number
): number => {
  if (auditDemand === 0 || capacity === 0) return 0

  let bestFare = auditFare
  let bestSold = 0
  let bestRevenue = 0

  const minFare = Math.floor(auditFare * 0.4)
  const maxFare = Math.ceil(auditFare * 1.6)

  for (let fare = minFare; fare <= maxFare; fare++) {
    const demand = Math.max(
      0,
      Math.floor(4 * auditDemand - (3 * fare * auditDemand) / auditFare)
    )

    const sold = Math.min(demand, capacity)
    const revenue = fare * sold

    if (sold > bestSold || (sold === bestSold && revenue > bestRevenue)) {
      bestFare = fare
      bestSold = sold
      bestRevenue = revenue
    }
  }

  return bestFare
}
