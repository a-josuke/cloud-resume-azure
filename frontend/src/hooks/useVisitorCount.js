import { useEffect, useState } from 'react'
import { VISITOR_URL } from '../config.js'

// Which website sent this visitor here? Only the host name is sent (e.g. "www.linkedin.com").
function referrerHost() {
  try {
    const host = new URL(document.referrer).hostname
    return host === location.hostname ? '' : host
  } catch {
    return '' // no referrer = typed the address or used a bookmark
  }
}

// One request per page load, no matter how many times React mounts the home page
// (React's dev mode mounts twice, and navigating Stats -> Home mounts it again).
// Without this, one visit would be counted several times.
let request = null
function loadCount() {
  if (!request) {
    request = fetch(`${VISITOR_URL}?ref=${encodeURIComponent(referrerHost())}`).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    })
  }
  return request
}

export default function useVisitorCount() {
  const [text, setText] = useState('…')

  useEffect(() => {
    let active = true
    loadCount()
      .then(({ count, uniqueCount }) => {
        if (active) setText(`${count.toLocaleString()} views · ${(uniqueCount ?? 0).toLocaleString()} unique visitors`)
      })
      .catch((err) => {
        console.error('Visitor counter failed:', err)
        if (active) setText('-')
      })
    return () => {
      active = false
    }
  }, [])

  return text
}