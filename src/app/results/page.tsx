/**
 * Lottery Results Display Page
 * 
 * Shows historical lottery results with filtering and search capabilities
 */

'use client'

import { useState, useEffect } from 'react'
import { LOTTERY_GAMES } from '@/utils/constants'

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
    hasMore: false
  })

  useEffect(() => {
    fetchResults()
  }, [selectedGame, pagination.offset])

  const fetchResults = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString()
      })
      
      if (selectedGame) {
        params.append('game', selectedGame)
      }

      const response = await fetch(`/api/results?${params}`)
      if (response.ok) {
        const data: ResultsResponse = await response.json()
        setResults(data.results)
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          hasMore: data.pagination.hasMore
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

  const handleNextPage = () => {
    if (pagination.hasMore) {
      setPagination(prev => ({
        ...prev,
        offset: prev.offset + prev.limit
      }))
    }
  }

  const handlePrevPage = () => {
    if (pagination.offset > 0) {
      setPagination(prev => ({
        ...prev,
        offset: Math.max(0, prev.offset - prev.limit)
      }))
    }
  }

  const formatNumber = (num: number) => {
    return num.toString().padStart(2, '0')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🎲 Lottery Results</h1>
          <p className="text-gray-600">Historical Philippine lottery draw results</p>
        </header>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter by Game</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleGameFilter('')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedGame === ''
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {game.description}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Results {selectedGame && `- ${LOTTERY_GAMES[selectedGame as keyof typeof LOTTERY_GAMES]?.description}`}
              </h2>
              <div className="text-sm text-gray-500">
                Showing {pagination.offset + 1}-{Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} results
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading results...</p>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="divide-y divide-gray-100">
                {results.map((result, index) => (
                  <div key={result.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {result.gameName}
                          </span>
                          <span className="text-lg font-medium text-gray-900">
                            {new Date(result.drawDate).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-3">
                          {result.numbers.map((number, numIndex) => (
                            <span
                              key={numIndex}
                              className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold rounded-full shadow-md"
                            >
                              {formatNumber(number)}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          ₱{result.jackpot?.toLocaleString() || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Added {new Date(result.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="p-6 border-t bg-gray-50">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handlePrevPage}
                    disabled={pagination.offset === 0}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <span className="text-sm text-gray-700">
                    Page {Math.floor(pagination.offset / pagination.limit) + 1} of {Math.ceil(pagination.total / pagination.limit)}
                  </span>
                  
                  <button
                    onClick={handleNextPage}
                    disabled={!pagination.hasMore}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-lg text-gray-600 mb-2">No results found</p>
              <p className="text-gray-500">
                {selectedGame 
                  ? `No results available for ${LOTTERY_GAMES[selectedGame as keyof typeof LOTTERY_GAMES]?.description}. Try importing some data first.`
                  : 'No lottery results available. Import some data to get started.'
                }
              </p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {results.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{results.length}</div>
                <div className="text-sm text-gray-600">Results Shown</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ₱{results.reduce((sum, r) => sum + (r.jackpot || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Jackpots</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  ₱{results.length > 0 ? Math.round(results.reduce((sum, r) => sum + (r.jackpot || 0), 0) / results.length).toLocaleString() : 0}
                </div>
                <div className="text-sm text-gray-600">Average Jackpot</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
