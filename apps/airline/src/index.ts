import { getHubs, login, setSessionCookie } from '@autopilot/api'
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

  console.log('Hubs:', hubs)
  process.exit(0)
})().catch((error) => {
  console.error('An error occurred:', error)
  process.exit(1)
})
