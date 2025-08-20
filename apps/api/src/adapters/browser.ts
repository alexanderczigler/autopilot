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
