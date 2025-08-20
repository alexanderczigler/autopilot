import type { Hub, Route } from '@autopilot/shared'
import { getURL } from '@autopilot/shared'
import { page } from '../adapters/browser.js'

export const getHubs = async (): Promise<Hub[]> => {
  await page.goto(getURL('/marketing/pricing/'))

  const selectElement = await page.$('select#hubDropdown')

  if (!selectElement) {
    throw new Error('Unable to locate hub dropdown.')
  }

  const options = await selectElement.$$('option')
  const hubs: Hub[] = []

  for (const option of options) {
    const value = await option.getAttribute('value')
    const name = (await option.textContent())?.trim()

    if (value && name) {
      const idMatch = value.match(/airport=(\d+)/)
      const externalId = idMatch ? idMatch[1] : ''
      const id = name.substring(0, 3)

      if (externalId) {
        hubs.push({ id, externalId, name })
      }
    }
  }

  // TODO: Move to a util function.
  const filteredHubs = hubs
    .filter((hub) => hub.name !== 'All...')
    .filter((hub) => hub.id !== 'Tou')
  return filteredHubs
}

export const getRoutes = async (hub: Hub): Promise<Route[]> => {
  if (!hub.externalId) {
    throw new Error('Hub externalId is not defined.')
  }

  await page.goto(
    getURL(`/marketing/pricing/?airport=${hub.externalId}&page=1`)
  )
  const selectElement = await page.$("select[name='filters[line]']")

  if (!selectElement) {
    throw new Error('Unable to locate route dropdown.')
  }

  const departure = hub.id
  const options = await selectElement.$$('option')
  const routes: Route[] = []

  for (const option of options) {
    const id = await option.getAttribute('value')
    const destination = (await option.textContent())?.trim().split('/')[1]

    /**
     * If another hub has a route to this hub, we skip it.
     */
    if (destination === departure) {
      continue
    }

    if (id && destination) {
      routes.push({
        id,
        departure: {
          id: departure,
          name: hub.name,
        },
        destination: {
          id: destination,
          name: destination, // TODO: can we find it in this context?
        },
      })
    }
  }

  return routes
}
