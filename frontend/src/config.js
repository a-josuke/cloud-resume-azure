const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname)

// Local: your own Functions host. Live: the API Management gateway.
const API_BASE = isLocal
  ? 'http://localhost:7071/api'
  : 'https://apim-crc-ad.azure-api.net/crc'

export const VISITOR_URL = `${API_BASE}/visitorCount`
export const STATS_URL = `${API_BASE}/stats`