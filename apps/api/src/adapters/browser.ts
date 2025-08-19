import { getURL } from '@autopilot/shared'
import { PlaywrightBlocker } from '@ghostery/adblocker-playwright'
import { type Browser, type Page, firefox } from 'playwright'

export let browser: Browser | null = null
export let page: Page

const isOpen = () => browser !== null

export const closeBrowser = async () => {
  if (!isOpen()) {
    return
  }

  await browser?.close()
}

export const openBrowser = async () => {
  if (isOpen()) {
    return
  }

  browser = await firefox.launch({ headless: true })
  page = await browser.newPage()

  PlaywrightBlocker.fromPrebuiltAdsAndTracking(fetch).then((blocker) => {
    blocker.enableBlockingInPage(page)
  })
}

export const goToLoginPage = async (): Promise<void> => {
  await page.goto(getURL('/'))
  await page.waitForLoadState('domcontentloaded')
}

// export const loadAudit = async (routeId: string) => {
//   await goToRoutePricingPage(routeId)

//   const reliability = await page.$('p.reliability a.tooltipLink')
//   await reliability?.scrollIntoViewIfNeeded()
//   const reliabilityHtml = await reliability?.innerHTML()

//   if (
//     !reliabilityHtml ||
//     !reliabilityHtml?.toLowerCase().startsWith('reliable')
//   ) {
//     console.log('Unreliable audit, do audit...')
//     await doRouteAudit(page)
//     await goToRoutePricingPage(routeId)
//   }
// }

// export const goToRoutePricingPage = async (routeId: string) => {
//   await wait(5000)
//   await page.goto(getURL(`/marketing/pricing/${routeId}`))
// }

// export const saveRoutePrice = async (price: ClassValues) => {
//   const priceBus = await page.$('input#line_priceBus')
//   await priceBus?.scrollIntoViewIfNeeded()
//   await priceBus?.fill(price.business.toString())

//   const priceCargo = await page.$('input#line_priceCargo')
//   await priceCargo?.scrollIntoViewIfNeeded()
//   await priceCargo?.fill(price.cargo.toString())

//   const priceEco = await page.$('input#line_priceEco')
//   await priceEco?.scrollIntoViewIfNeeded()
//   await priceEco?.fill(price.economy.toString())

//   const priceFirst = await page.$('input#line_priceFirst')
//   await priceFirst?.scrollIntoViewIfNeeded()
//   await priceFirst?.fill(price.first.toString())

//   /**
//    * Save the price.
//    */
//   console.log('Saving price...')
//   const submitButton = await page.$(
//     'input[type="submit"].validBtn.validBtnBlue'
//   )

//   await submitButton?.scrollIntoViewIfNeeded()

//   await wait(2000)
//   await submitButton?.click()
// }
