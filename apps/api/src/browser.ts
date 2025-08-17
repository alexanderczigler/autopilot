import type { Audit, ClassValues } from '@autopilot/shared'
import { getURL, wait } from '@autopilot/shared'
import { PlaywrightBlocker } from '@ghostery/adblocker-playwright'
import { type Browser, type Cookie, type Page, firefox } from 'playwright'

let browser: Browser | null = null
let page: Page

export const closeBrowser = async () => {
  if (browser === null) {
    return
  }

  await browser.close()
}

export const openBrowser = async () => {
  browser = await firefox.launch({ headless: true })
  page = await browser.newPage()

  PlaywrightBlocker.fromPrebuiltAdsAndTracking(fetch).then((blocker) => {
    blocker.enableBlockingInPage(page)
  })
}

export const doRouteAudit = async (page: Page) => {
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

export const goToHomePage = async (): Promise<void> => {
  await page.goto(getURL('/home'))

  const success = await page.isVisible('div.companyNameBox', {
    timeout: 10_000,
  })

  if (!success) {
    throw new Error('Failed to load home page')
  }
}

export const goToLoginPage = async (): Promise<void> => {
  await page.goto(getURL('/'))
  await page.waitForLoadState('domcontentloaded')
}

export const doLogin = async (
  username: string,
  password: string
): Promise<Cookie[]> => {
  await page.fill('input[name="_username"]', username)
  await page.fill('input[name="_password"]', password)
  await page.click('button[id="loginSubmit"]')

  try {
    // NOTE: the login page redirects to http.
    await page.waitForURL(getURL('/home').replace('https', 'http'))
  } catch (error) {
    await page.waitForURL(getURL('/home'))
  }

  return await page.context().cookies()
}

export const addCookies = async (cookies: Cookie[]) => {
  if (!browser) {
    throw new Error('Browser is not open')
  }

  await page.context().addCookies(cookies)
}

export const getHubsDropdown = async () => {
  await page.goto(getURL('/marketing/pricing/'))

  const selectElement = await page.$('select#hubDropdown')

  if (!selectElement) {
    throw new Error('Unable to locate hub dropdown.')
  }

  return await selectElement.$$('option')
}

export const getRoutesDropdown = async (airport: string) => {
  await page.goto(getURL(`/marketing/pricing/?airport=${airport}&page=1`))

  return await page.$("select[name='filters[line]']")
}

export const loadAudit = async (routeId: string) => {
  await goToRoutePricingPage(routeId)

  const reliability = await page.$('p.reliability a.tooltipLink')
  await reliability?.scrollIntoViewIfNeeded()
  const reliabilityHtml = await reliability?.innerHTML()

  if (
    !reliabilityHtml ||
    !reliabilityHtml?.toLowerCase().startsWith('reliable')
  ) {
    console.log('Unreliable audit, do audit...')
    await doRouteAudit(page)
    await goToRoutePricingPage(routeId)
  }
}

export const goToRoutePricingPage = async (routeId: string) => {
  await wait(5000)
  await page.goto(getURL(`/marketing/pricing/${routeId}`))
}

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

  /**
   * Save the price.
   */
  console.log('Saving price...')
  const submitButton = await page.$(
    'input[type="submit"].validBtn.validBtnBlue'
  )

  await submitButton?.scrollIntoViewIfNeeded()

  await wait(2000)
  await submitButton?.click()
}
