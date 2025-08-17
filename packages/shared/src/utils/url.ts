export const getURL = (p: string): string => {
  let path = p

  if (path.startsWith('/')) {
    path = path.slice(1)
  }

  const baseUrl = process.env.BASE_URL || 'https://example.com'

  return `https://${baseUrl}/${path}`
}
