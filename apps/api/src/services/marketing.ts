import type { Audit } from '@autopilot/shared'
import { page } from '../adapters/browser.js'

export const doRouteAudit = async () => {
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

export const parseAudit = async (): Promise<Audit> => {
  const reliability = await page.$('p.reliability a.tooltipLink')
  await reliability?.scrollIntoViewIfNeeded()

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

  const audit: Audit = {
    demand,
    price,
  }

  return audit
}

export const parsePricingUnlocks = async () => {
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
