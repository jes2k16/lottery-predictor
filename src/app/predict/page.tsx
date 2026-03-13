'use client'

import { useState, useCallback } from 'react'
import NumberBall from '@/components/NumberBall'
import { LOTTERY_GAMES } from '@/utils/constants'

interface NumberAnalysisItem {
  number: number
  frequency: number
  frequencyPercent: number
  recentFrequency: number
  status: 'hot' | 'warm' | 'cold'
}

interface AnalysisData {
  numbers: number[]
  totalDraws: number
  numberAnalysis: NumberAnalysisItem[]
  distribution: {
    even: number
    odd: number
    high: number
    low: number
    midpoint: number
  }
  coverageScore: number
  exactMatchFound: boolean
  exactMatchDate: string | null
  bestPartialMatches: {
    drawDate: string
    matchCount: number
    matchedNumbers: number[]
  }[]
  averageFrequency: number
}

interface SavedPrediction {
  id: string
  numbers: number[]
  createdAt: string
}

const GAME = LOTTERY_GAMES['6/42']

function generateNumbers(): number[] {
  const nums = new Set<number>()
  while (nums.size < GAME.numberCount) {
    nums.add(Math.floor(Math.random() * GAME.maxNumber) + 1)
  }
  return Array.from(nums).sort((a, b) => a - b)
}

export default function PredictPage() {
  const [currentPick, setCurrentPick] = useState<number[] | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null)
  const [history, setHistory] = useState<SavedPrediction[]>([])
  const [generating, setGenerating] = useState(false)
  const [analyzeLoading, setAnalyzeLoading] = useState(false)
  const [animKey, setAnimKey] = useState(0)

  const handleGenerate = useCallback(async () => {
    setGenerating(true)
    setAnalysis(null)

    const nums = generateNumbers()
    setAnimKey(k => k + 1)

    await new Promise(r => setTimeout(r, 200))
    setCurrentPick(nums)
    setGenerating(false)

    try {
      const saveRes = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameName: '6/42', numbers: nums }),
      })
      const saved = await saveRes.json()
      if (saved.id) {
        setHistory(prev => [{ id: saved.id, numbers: nums, createdAt: saved.createdAt }, ...prev])
      }
    } catch (err) {
      console.error('Failed to save prediction:', err)
    }

    setAnalyzeLoading(true)
    try {
      const res = await fetch(`/api/predictions/analyze?game=6/42&numbers=${nums.join(',')}`)
      const data = await res.json()
      setAnalysis(data)
    } catch (err) {
      console.error('Failed to analyze:', err)
    } finally {
      setAnalyzeLoading(false)
    }
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Lucky Pick</h1>
        <p className="text-gray-500 mt-1">Generate a random 6/42 combination and see how it stacks up</p>
      </div>

      {/* Game Selector + Generate */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Game</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 bg-white"
              defaultValue="6/42"
            >
              <option value="6/42">Lotto 6/42</option>
              <option disabled>Mega Lotto 6/45 — Coming Soon</option>
              <option disabled>Super Lotto 6/49 — Coming Soon</option>
              <option disabled>Grand Lotto 6/55 — Coming Soon</option>
              <option disabled>Ultra Lotto 6/58 — Coming Soon</option>
            </select>
          </div>
          <div className="pt-0 sm:pt-6">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="relative bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {generating ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  🎲 Lucky Pick!
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Generated Numbers Display */}
        <div className="mt-8 flex justify-center">
          {currentPick ? (
            <div key={animKey} className="flex gap-3 sm:gap-4">
              {currentPick.map((n, i) => (
                <NumberBall
                  key={`${animKey}-${n}`}
                  number={n}
                  size="lg"
                  variant="highlight"
                  animated
                  delay={i * 100}
                />
              ))}
            </div>
          ) : (
            <div className="flex gap-3 sm:gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <span
                  key={i}
                  className="w-14 h-14 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-300 text-lg font-bold"
                >
                  ?
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Statistical Analysis Panel */}
      {(analysis || analyzeLoading) && (
        <div className="animate-fade-up">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Statistical Analysis</h2>

          {analyzeLoading ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
              <div className="flex items-center justify-center gap-3 text-gray-400">
                <span className="w-5 h-5 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin" />
                Analyzing your numbers...
              </div>
            </div>
          ) : analysis && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Per-Number Frequency */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Number Breakdown
                </h3>
                <div className="space-y-3">
                  {analysis.numberAnalysis.map(item => (
                    <div key={item.number} className="flex items-center gap-3">
                      <NumberBall
                        number={item.number}
                        size="sm"
                        variant={item.status === 'hot' ? 'hot' : item.status === 'cold' ? 'cold' : 'default'}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            {item.frequency} / {analysis.totalDraws} draws ({item.frequencyPercent}%)
                          </span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            item.status === 'hot'
                              ? 'bg-red-100 text-red-700'
                              : item.status === 'warm'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {item.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                          <div
                            className={`h-1.5 rounded-full ${
                              item.status === 'hot'
                                ? 'bg-red-500'
                                : item.status === 'warm'
                                ? 'bg-amber-500'
                                : 'bg-blue-400'
                            }`}
                            style={{ width: `${Math.min(item.frequencyPercent * 5, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Distribution Stats */}
              <div className="space-y-6">
                {/* Even/Odd + High/Low */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Distribution
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Even / Odd</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${(analysis.distribution.even / 6) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-mono text-gray-700">
                          {analysis.distribution.even}:{analysis.distribution.odd}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-2">High / Low</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${(analysis.distribution.high / 6) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-mono text-gray-700">
                          {analysis.distribution.high}:{analysis.distribution.low}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">
                        Midpoint: {analysis.distribution.midpoint}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Coverage + Exact Match */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Coverage &amp; History
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Range Coverage</span>
                        <span className="font-bold text-gray-900">{analysis.coverageScore}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600"
                          style={{ width: `${analysis.coverageScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Exact Historical Match</span>
                      {analysis.exactMatchFound ? (
                        <span className="text-red-600 font-semibold">
                          Yes — {new Date(analysis.exactMatchDate!).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-green-600 font-semibold">Unique combination</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Best Partial Matches */}
                {analysis.bestPartialMatches.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Closest Historical Draws (3+ match)
                    </h3>
                    <div className="space-y-2">
                      {analysis.bestPartialMatches.map((match, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">
                            {new Date(match.drawDate).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric'
                            })}
                          </span>
                          <span className="font-semibold text-indigo-600">
                            {match.matchCount}/6 matched
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Prediction History */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Session History</h2>
        </div>
        {history.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No lucky picks yet. Hit the button above to generate your first combination!
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {history.map((pick, idx) => (
              <div key={pick.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400 w-8 text-right">#{history.length - idx}</span>
                  <div className="flex gap-2">
                    {pick.numbers.map((n, i) => (
                      <NumberBall key={i} number={n} size="sm" />
                    ))}
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(pick.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
