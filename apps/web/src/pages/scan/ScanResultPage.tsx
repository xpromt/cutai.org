import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getScan, type ScanResponse } from '../../lib/api'

export function ScanResultPage() {
  const { slug } = useParams<{ slug: string }>()
  const [data, setData] = useState<ScanResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [polling, setPolling] = useState(true)

  useEffect(() => {
    if (!slug) return

    let cancelled = false
    let attempts = 0
    const maxAttempts = 30 // 30 * 2s = 60s max poll

    async function poll() {
      while (!cancelled && attempts < maxAttempts) {
        attempts++
        try {
          const resp = await getScan(slug!)
          if (cancelled) return
          setData(resp)
          if (resp.status === 'done' || resp.status === 'failed') {
            setPolling(false)
            return
          }
        } catch (err) {
          if (cancelled) return
          setError(err instanceof Error ? err.message : 'Polling failed')
          setPolling(false)
          return
        }
        await new Promise(r => setTimeout(r, 2000))
      }
      if (!cancelled && attempts >= maxAttempts) {
        setPolling(false)
      }
    }

    poll()
    return () => { cancelled = true }
  }, [slug])

  const tierColor: Record<string, string> = {
    'certified-human': 'text-green-400',
    'mostly-organic': 'text-lime-400',
    'suspiciously-smooth': 'text-yellow-400',
    'slop-adjacent': 'text-orange-400',
    'grade-a-slop': 'text-red-400',
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4">
      {/* Top Header Navigation */}
      <div className="max-w-lg mx-auto pt-6 pb-4 flex items-center justify-between border-b border-zinc-800/80 mb-6">
        <Link
          to="/scan"
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 rounded-lg text-sm text-purple-300 font-medium transition group"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
          <span>Go back to scan page</span>
        </Link>
        <Link to="/" className="text-xs text-zinc-500 hover:text-zinc-300 transition">
          cutai.org
        </Link>
      </div>

      <div className="max-w-lg mx-auto">
        {error ? (
          <div className="p-6 bg-zinc-900/90 rounded-xl border border-red-900/50 text-center space-y-4">
            <p className="text-red-400">{error}</p>
            <Link
              to="/scan"
              className="inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition"
            >
              Back to Scan Page
            </Link>
          </div>
        ) : !data ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-zinc-400 text-sm">{polling ? 'Analyzing site & calculating slop score…' : 'Scan not found'}</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-1">Slop Score</h1>
            <a href={data.url} target="_blank" rel="noopener noreferrer" className="text-sm text-purple-400 hover:underline mb-6 block truncate">{data.url}</a>

            {polling && data.status !== 'done' && data.status !== 'failed' && (
              <div className="flex items-center gap-3 bg-zinc-900/80 p-3 rounded-lg border border-yellow-500/30 text-yellow-300 text-sm mb-6">
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
                <span>Scanning target site… ({data.status})</span>
              </div>
            )}

            {data.status === 'failed' && (
              <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 mb-6">
                <p className="text-red-400 font-medium mb-1">Scan failed</p>
                <p className="text-sm text-zinc-400">{data.error}</p>
              </div>
            )}

            {data.status === 'done' && data.scan && (
              <>
                <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800 space-y-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`text-6xl font-bold ${tierColor[data.scan.tier] ?? 'text-white'}`}>
                      {data.scan.score}
                    </div>
                    <div>
                      <p className="text-xl font-semibold capitalize">{data.scan.tier.replace(/-/g, ' ')}</p>
                      <p className="text-sm text-zinc-400 italic mt-1">"{data.scan.roast}"</p>
                    </div>
                  </div>

                  <details className="text-sm">
                    <summary className="cursor-pointer text-zinc-400 hover:text-white transition">Breakdown ({data.scan.breakdown.length} signals)</summary>
                    <ul className="mt-2 space-y-1">
                      {data.scan.breakdown.map((hit: { ruleId: string; label: string; points: number; count: number }) => (
                        <li key={hit.ruleId} className="flex justify-between text-zinc-300 py-1 border-b border-zinc-800/50 last:border-0">
                          <span>{hit.label}</span>
                          <span className="text-zinc-400 font-mono">+{hit.points} pts ({hit.count}x)</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>

                {/* Badge preview + embed */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Generated Badge</h2>
                    <span className="text-xs text-zinc-500">Live SVG Preview</span>
                  </div>

                  <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-4">
                    <img
                      src={`/badge/${slug}.svg?theme=slop-detector&size=sm`}
                      alt="Slop Score badge"
                      className="rounded-lg max-w-full"
                    />
                    <img
                      src={`/badge/${slug}.svg?theme=slop-detector&size=lg`}
                      alt="Slop Score banner"
                      className="rounded-lg w-full"
                    />
                  </div>

                  <details className="text-sm">
                    <summary className="cursor-pointer text-zinc-400 hover:text-white transition">Embed code</summary>
                    <div className="mt-2 space-y-2">
                      <label className="block text-zinc-500 text-xs">Markdown</label>
                      <code className="block p-2 bg-zinc-900 rounded text-xs break-all text-zinc-300 font-mono">
                        {`[![Slop Score](/badge/${slug}.svg)](https://cutai.org/scan/${slug})`}
                      </code>
                      <label className="block text-zinc-500 text-xs mt-2">HTML</label>
                      <code className="block p-2 bg-zinc-900 rounded text-xs break-all text-zinc-300 font-mono">
                        {`<a href="https://cutai.org/scan/${slug}"><img src="/badge/${slug}.svg" alt="Slop Score"/></a>`}
                      </code>
                    </div>
                  </details>

                  <a
                    href={`/badge/${slug}.png?theme=slop-detector&size=sm`}
                    download
                    className="inline-block px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium transition"
                  >
                    Download PNG
                  </a>
                </div>
              </>
            )}

            <div className="text-center pt-8 pb-12 border-t border-zinc-900 mt-8">
              <Link
                to="/scan"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition text-white shadow-lg shadow-purple-600/20"
              >
                <span>← Go back to main scan page</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

