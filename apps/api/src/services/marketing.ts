import {
  type Audit,
  type ClassValues,
  type Route,
  getURL,
  wait,
} from '@autopilot/shared'
import { page } from '../adapters/browser.js'

export const getRouteAudit = async (route: Route): Promise<Audit> => {
  await goToRoutePricingPage(route.id)

  const reliability = await page.$('p.reliability a.tooltipLink')
  await reliability?.scrollIntoViewIfNeeded()
  const reliabilityHtml = await reliability?.innerHTML()

  if (
    !reliabilityHtml ||
    !reliabilityHtml?.toLowerCase().startsWith('reliable')
  ) {
    await auditRoute()
    await goToRoutePricingPage(route.id)
  }

  const box1 = await page.$('div.box1')
  await box1?.scrollIntoViewIfNeeded()
  const auditHtml = await box1?.innerHTML()

  if (!auditHtml) {
    throw new Error('No audit HTML found')
  }

  const priceRegex = /<div[^>]*class="price">.*?\$(\d[\d,]*)/gi
  const priceMatches = [...auditHtml.matchAll(priceRegex)]

  const demandRegex = /<div[^>]*class="demand">.*?(\d[\d ]*)/gi
  const demandMatches = [...auditHtml.matchAll(demandRegex)]

  const demand = {
    business: Number.parseInt(
      demandMatches[1][1].replaceAll(' ', '').replaceAll(',', '')
    ),
    cargo: Number.parseInt(
      demandMatches[3][1].replaceAll(' ', '').replaceAll(',', '')
    ),
    economy: Number.parseInt(
      demandMatches[0][1].replaceAll(' ', '').replaceAll(',', '')
    ),
    first: Number.parseInt(
      demandMatches[2][1].replaceAll(' ', '').replaceAll(',', '')
    ),
  }

  const price = {
    business: Number.parseInt(
      priceMatches[1][1].replaceAll(' ', '').replaceAll(',', '')
    ),
    cargo: Number.parseInt(
      priceMatches[3][1].replaceAll(' ', '').replaceAll(',', '')
    ),
    economy: Number.parseInt(
      priceMatches[0][1].replaceAll(' ', '').replaceAll(',', '')
    ),
    first: Number.parseInt(
      priceMatches[2][1].replaceAll(' ', '').replaceAll(',', '')
    ),
  }

  const unlocks = await parsePricingUnlocks()

  const audit: Audit = {
    demand,
    price,
    unlocks,
  }

  return audit
}

/**
 * Saves the route prices for all classes. This will lock changes for 24 h on the specific route.
 * @param price The price information to save.
 */
export const saveRoutePrice = async (price: ClassValues) => {
  const priceBus = await page.$('input#line_priceBus')
  await priceBus?.scrollIntoViewIfNeeded()
  await priceBus?.fill(price.business.toString())

  const priceCargo = await page.$('input#line_priceCargo')
  await priceCargo?.scrollIntoViewIfNeeded()
  await priceCargo?.fill(price.cargo.toString())

  const priceEco = await page.$('input#line_priceEco')
  await priceEco?.scrollIntoViewIfNeeded()
  await priceEco?.fill(price.economy.toString())

  const priceFirst = await page.$('input#line_priceFirst')
  await priceFirst?.scrollIntoViewIfNeeded()
  await priceFirst?.fill(price.first.toString())

  const submitButton = await page.$(
    'input[type="submit"].validBtn.validBtnBlue'
  )

  await submitButton?.scrollIntoViewIfNeeded()

  await wait(2000)
  await submitButton?.click()
}

/**
 * Audits the current route.
 */
const auditRoute = async () => {
  const url = page.url()

  await page
    .locator(
      'div.box0 a.gradientButton.gradientButtonPurple.marketing_PriceLink'
    )
    .click()

  await page.waitForSelector('#popupContainer[style*="display: block"]')
  await page.locator('#popupContainer a.internalAuditLink.submitButton').click()

  await page.waitForURL(url)
}

/**
 * Parses the pricing unlocks from the page.
 * @returns A string representing the unlock time or undefined.
 */
const parsePricingUnlocks = async () => {
  const countdownElement = await page.$(
    'div#marketing_linePricing span.amcountdown'
  )

  const timeRemainingInSeconds =
    await countdownElement?.getAttribute('data-timeremaining')

  let unlocks: string | undefined

  if (timeRemainingInSeconds && Number(timeRemainingInSeconds) > 0) {
    const now = new Date()
    now.setSeconds(now.getSeconds() + Number(timeRemainingInSeconds))
    unlocks = now.toISOString()
  }

  return unlocks
}

/**
 * Navigates to the pricing page for a specific route.
 * @param routeId The ID of the route to navigate to.
 */
const goToRoutePricingPage = async (routeId: string) => {
  await wait(5000)
  await page.goto(getURL(`/marketing/pricing/${routeId}`))
}
