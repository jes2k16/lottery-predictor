'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import NumberBall from '@/components/NumberBall'
import StatsCard from '@/components/StatsCard'

interface DashboardResult {
  id: string
  gameName: string
  drawDate: string
  numbers: number[]
  jackpot: number | null
}

interface DashboardData {
  recentResults: DashboardResult[]
  stats: {
    totalDraws: number
    lastDrawDate: string | null
    largestJackpot: number
    nextDrawDay: string
    totalPredictions: number
  }
  numberFrequency: Record<number, number>
  hotNumbers: number[]
  coldNumbers: number[]
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-white rounded-xl animate-pulse" />
      </div>
    )
  }

  if (!data) {
    return <p className="text-gray-500">Failed to load dashboard data.</p>
  }

  const maxFreq = Math.max(...Object.values(data.numberFrequency), 1)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Lotto 6/42 overview and statistics</p>
        </div>
        <Link
          href="/predict"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          <span className="text-xl">🎲</span>
          Lucky Pick
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          label="Total Draws"
          value={data.stats.totalDraws.toLocaleString()}
          icon="📊"
        />
        <StatsCard
          label="Last Draw"
          value={data.stats.lastDrawDate
            ? new Date(data.stats.lastDrawDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : 'No data'}
          icon="📅"
        />
        <StatsCard
          label="Next Draw"
          value={data.stats.nextDrawDay}
          icon="⏰"
        />
        <StatsCard
          label="Largest Jackpot"
          value={data.stats.largestJackpot > 0
            ? `₱${(data.stats.largestJackpot / 1_000_000).toFixed(1)}M`
            : '—'}
          icon="💰"
        />
      </div>

      {/* Latest Results */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Latest 6/42 Results</h2>
          <Link href="/results" className="text-sm text-indigo-600 hover:underline">
            View all
          </Link>
        </div>
        {data.recentResults.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <p>No results yet. Import data from the Admin panel.</p>
            <Link href="/admin" className="text-indigo-600 hover:underline mt-2 inline-block">
              Go to Admin
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {data.recentResults.slice(0, 5).map(result => (
              <div key={result.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500 w-28 shrink-0">
                    {new Date(result.drawDate).toLocaleDateString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </span>
                  <div className="flex gap-2">
                    {result.numbers.map((n, i) => (
                      <NumberBall key={i} number={n} size="sm" />
                    ))}
                  </div>
                </div>
                {result.jackpot && (
                  <span className="text-sm font-medium text-green-700">
                    ₱{result.jackpot.toLocaleString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Two Column: Frequency Chart + Hot/Cold */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Frequency Heatmap */}
        <section className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Number Frequency (1-42)</h2>
          {data.stats.totalDraws === 0 ? (
            <p className="text-gray-400 text-center py-8">No draw data available yet.</p>
          ) : (
            <div className="grid grid-cols-6 sm:grid-cols-7 gap-2">
              {Object.entries(data.numberFrequency)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([num, freq]) => {
                  const intensity = freq / maxFreq
                  const bg = intensity > 0.75
                    ? 'bg-indigo-600 text-white'
                    : intensity > 0.5
                    ? 'bg-indigo-400 text-white'
                    : intensity > 0.25
                    ? 'bg-indigo-200 text-indigo-900'
                    : freq > 0
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'bg-gray-50 text-gray-400'
                  return (
                    <div
                      key={num}
                      className={`relative flex flex-col items-center justify-center rounded-lg p-2 ${bg} transition-colors`}
                      title={`Number ${num}: ${freq} times`}
                    >
                      <span className="font-bold text-sm">{num}</span>
                      <span className="text-[10px] opacity-75">{freq}x</span>
                    </div>
                  )
                })}
            </div>
          )}
        </section>

        {/* Hot / Cold Numbers */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              🔥 Hot Numbers
            </h3>
            {data.hotNumbers.length === 0 ? (
              <p className="text-gray-400 text-sm">No data</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {data.hotNumbers.map(n => (
                  <NumberBall key={n} number={n} size="md" variant="hot" />
                ))}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              ❄️ Cold Numbers
            </h3>
            {data.coldNumbers.length === 0 ? (
              <p className="text-gray-400 text-sm">No data</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {data.coldNumbers.map(n => (
                  <NumberBall key={n} number={n} size="md" variant="cold" />
                ))}
              </div>
            )}
          </div>
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Lucky Picks Made</span>
              <span className="font-bold text-indigo-600">{data.stats.totalPredictions}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
