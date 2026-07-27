import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { postScan, postScore, type ScanResult } from '../../lib/api'

type Mode = 'url' | 'text'

export function ScanPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('url')
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [textResult, setTextResult] = useState<ScanResult | null>(null)

  async function handleUrlSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const resp = await postScan(url)
      navigate(`/scan/${resp.slug}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleTextSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const result = await postScore(text)
      setTextResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Score failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col p-4">
      {/* Header bar */}
      <div className="w-full max-w-lg mx-auto pt-4 pb-2 flex items-center justify-between">
        <Link to="/" className="text-xs font-semibold text-purple-400 hover:underline">
          ← cutai.org home
        </Link>
        <span className="text-xs text-zinc-500">v1.0 Slop Engine</span>
      </div>

      <div className="w-full max-w-lg mx-auto my-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Slop Detector
        </h1>


        {/* Mode tabs */}
        <div className="flex mb-6 bg-zinc-900 rounded-lg p-1">
          <button
            onClick={() => { setMode('url'); setTextResult(null) }}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${mode === 'url' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'}`}
          >
            Scan a URL
          </button>
          <button
            onClick={() => { setMode('text'); setTextResult(null) }}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${mode === 'text' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'}`}
          >
            Paste text
          </button>
        </div>

        {mode === 'url' ? (
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="example.com or https://example.com"
              required
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-700 rounded-lg font-medium transition"
            >
              {loading ? 'Scanning…' : 'Scan URL'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleTextSubmit} className="space-y-4">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Paste text to analyze for slop…"
              rows={6}
              required
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 resize-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-700 rounded-lg font-medium transition"
            >
              {loading ? 'Scoring…' : 'Score Text'}
            </button>
          </form>
        )}

        {/* Paste text result */}
        {textResult && <ScoreDisplay result={textResult} />}

        {error && (
          <p className="mt-4 text-red-400 text-sm text-center">{error}</p>
        )}
      </div>
    </div>
  )
}

function ScoreDisplay({ result }: { result: ScanResult }) {
  const tierColor: Record<string, string> = {
    'certified-human': 'text-green-400',
    'mostly-organic': 'text-lime-400',
    'suspiciously-smooth': 'text-yellow-400',
    'slop-adjacent': 'text-orange-400',
    'grade-a-slop': 'text-red-400',
  }

  return (
    <div className="mt-8 p-6 bg-zinc-900 rounded-xl border border-zinc-800 space-y-4">
      <div className="flex items-center gap-4">
        <div className={`text-5xl font-bold ${tierColor[result.tier] ?? 'text-white'}`}>
          {result.score}
        </div>
        <div>
          <p className="text-lg font-semibold capitalize">{result.tier.replace(/-/g, ' ')}</p>
          <p className="text-sm text-zinc-400 italic">"{result.roast}"</p>
        </div>
      </div>
      {result.lowConfidence && (
        <p className="text-xs text-zinc-500">Low confidence — short text</p>
      )}
      <details className="text-sm">
        <summary className="cursor-pointer text-zinc-400 hover:text-white transition">Breakdown</summary>
        <ul className="mt-2 space-y-1">
          {result.breakdown.map(hit => (
            <li key={hit.ruleId} className="flex justify-between text-zinc-300">
              <span>{hit.label}</span>
              <span className="text-zinc-500">+{hit.points} ({hit.count}x)</span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  )
}
