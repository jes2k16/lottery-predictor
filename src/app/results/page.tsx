'use client'

import { useState, useEffect } from 'react'
import { LOTTERY_GAMES } from '@/utils/constants'
import NumberBall from '@/components/NumberBall'

interface LotteryResult {
  id: string
  gameName: string
  gameDescription: string
  drawDate: string
  numbers: number[]
  jackpot: number | null
  createdAt: string
}

interface ResultsResponse {
  results: LotteryResult[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

export default function ResultsPage() {
  const [results, setResults] = useState<LotteryResult[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGame, setSelectedGame] = useState<string>('')
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false,
  })

  useEffect(() => {
    fetchResults()
  }, [selectedGame, pagination.offset])

  const fetchResults = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString(),
      })
      if (selectedGame) params.append('game', selectedGame)

      const response = await fetch(`/api/results?${params}`)
      if (response.ok) {
        const data: ResultsResponse = await response.json()
        setResults(data.results)
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          hasMore: data.pagination.hasMore,
        }))
      }
    } catch (error) {
      console.error('Failed to fetch results:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGameFilter = (gameType: string) => {
    setSelectedGame(gameType)
    setPagination(prev => ({ ...prev, offset: 0 }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Results</h1>
        <p className="text-gray-500 mt-1">Historical Philippine lottery draw results</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleGameFilter('')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedGame === ''
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          All Games
        </button>
        {Object.entries(LOTTERY_GAMES).map(([key, game]) => (
          <button
            key={key}
            onClick={() => handleGameFilter(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedGame === key
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {game.description}
          </button>
        ))}
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {selectedGame
              ? LOTTERY_GAMES[selectedGame as keyof typeof LOTTERY_GAMES]?.description
              : 'All Games'}
          </h2>
          <span className="text-sm text-gray-500">
            {pagination.total > 0
              ? `${pagination.offset + 1}-${Math.min(pagination.offset + pagination.limit, pagination.total)} of ${pagination.total}`
              : '0 results'}
          </span>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <span className="w-8 h-8 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : results.length > 0 ? (
          <>
            <div className="divide-y divide-gray-50">
              {results.map(result => (
                <div key={result.id} className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors gap-3">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-semibold px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 w-12 text-center">
                      {result.gameName}
                    </span>
                    <span className="text-sm text-gray-500 w-32 shrink-0">
                      {new Date(result.drawDate).toLocaleDateString('en-US', {
                        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </span>
                    <div className="flex gap-1.5">
                      {result.numbers.map((n, i) => (
                        <NumberBall key={i} number={n} size="sm" />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-green-700">
                    {result.jackpot ? `₱${result.jackpot.toLocaleString()}` : '—'}
                  </span>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={() => setPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))}
                disabled={pagination.offset === 0}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {Math.floor(pagination.offset / pagination.limit) + 1} of {Math.max(1, Math.ceil(pagination.total / pagination.limit))}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
                disabled={!pagination.hasMore}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <div className="p-12 text-center text-gray-400">
            <p className="text-lg mb-1">No results found</p>
            <p className="text-sm">
              {selectedGame
                ? `No data for ${LOTTERY_GAMES[selectedGame as keyof typeof LOTTERY_GAMES]?.description}. Try importing from Admin.`
                : 'Import data from the Admin panel to get started.'}
            </p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {results.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
            <p className="text-2xl font-bold text-indigo-600">{results.length}</p>
            <p className="text-sm text-gray-500">Results Shown</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
            <p className="text-2xl font-bold text-green-600">
              ₱{results.reduce((sum, r) => sum + (r.jackpot || 0), 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Total Jackpots</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
            <p className="text-2xl font-bold text-purple-600">
              ₱{results.length > 0 ? Math.round(results.reduce((sum, r) => sum + (r.jackpot || 0), 0) / results.length).toLocaleString() : 0}
            </p>
            <p className="text-sm text-gray-500">Average Jackpot</p>
          </div>
        </div>
      )}
    </div>
  )
}
