import { getURL } from '@autopilot/shared'
import type { Cookie } from 'playwright'
import {
  browser,
  goToLoginPage,
  openBrowser,
  page,
} from '../adapters/browser.js'

export const isLoggedIn = async (): Promise<boolean> => {
  await page.goto(getURL('/home'))

  return await page.isVisible('div.companyNameBox', {
    timeout: 10_000,
  })
}

const sessionCookieName = 'REMEMBERME'

export const login = async (
  username: string,
  password: string
): Promise<Cookie[]> => {
  await openBrowser()
  await goToLoginPage()

  const cookies = await doLogin(username, password)

  const sessionCookie = cookies.find(
    (cookie) => cookie.name === sessionCookieName
  )

  if (!sessionCookie) {
    throw new Error('Session cookie not found!')
  }

  return [sessionCookie]
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

export const setSessionCookie = async (value: string) => {
  if (!browser) {
    await openBrowser()
  }

  await page.context().addCookies([
    {
      name: sessionCookieName,
      value,
      domain: process.env.GAME_URL || 'www.example.com',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'None',
    },
  ])
}
