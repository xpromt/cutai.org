const API = import.meta.env.VITE_API_BASE ?? ''

export interface ScanResult {
  score: number
  tier: string
  breakdown: Array<{ ruleId: string; label: string; points: number; count: number; examples: string[] }>
  roast: string
  wordCount: number
  lowConfidence: boolean
}

export interface ScanResponse {
  slug: string
  url?: string
  status: 'queued' | 'running' | 'done' | 'failed'
  scan?: ScanResult & { createdAt: string }
  error?: string
}

export async function postScan(url: string, publicListing?: boolean): Promise<ScanResponse> {
  const res = await fetch(`${API}/api/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, publicListing }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'request failed', message: '' }))
    throw new Error(body.message || body.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export async function getScan(slug: string): Promise<ScanResponse> {
  const res = await fetch(`${API}/api/scan/${slug}`)
  if (!res.ok) {
    if (res.status === 404) throw new Error('not found')
    throw new Error(`HTTP ${res.status}`)
  }
  return res.json()
}

export async function postScore(text: string): Promise<ScanResult> {
  const res = await fetch(`${API}/api/score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'request failed', message: '' }))
    throw new Error(body.message || body.error || `HTTP ${res.status}`)
  }
  return res.json()
}
