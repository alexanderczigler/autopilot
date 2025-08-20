import {
  getHubs,
  getRouteAudit,
  getRoutes,
  getSuperSimulatorPrice,
  login,
  saveRoutePrice,
  setSessionCookie,
} from '@autopilot/api'
import { getCapacity } from './services/network.js'
;(async () => {
  const cookie = process.env.GAME_COOKIE
  const username = process.env.GAME_USER
  const password = process.env.GAME_PASS

  if (cookie) {
    console.log('Using existing cookie for authentication.')

    await setSessionCookie(cookie)
  } else {
    console.log(
      'No cookie found, using username and password for authentication.'
    )

    if (!username || !password) {
      console.error('Username and password must be provided.')
      process.exit(1)
    }

    const cookies = await login(username, password)
    console.log('Cookies:', cookies)
  }

  const hubs = await getHubs()

  for (const hub of hubs) {
    const routes = await getRoutes(hub)
    console.log(`${hub.id} has ${routes.length} routes`)

    for (const route of routes) {
      console.log(
        ` > ${route.departure.id}/${route.destination.id} (${route.id})`
      )

      const audit = await getRouteAudit(route)

      if (audit.unlocks) {
        console.log(` > Prices are locked until ${audit.unlocks}`)
        continue
      }

      const capacity = getCapacity(route)

      if (!capacity) {
        console.warn(` > No capacity data for route: ${route.id}`)
        continue
      }

      const prices = await getSuperSimulatorPrice({
        auditPrice: audit.price,
        capacity,
        demand: audit.demand,
      })

      await saveRoutePrice(prices)
    }
  }

  process.exit(0)
})().catch((error) => {
  console.error('An error occurred:', error)
  process.exit(1)
})
