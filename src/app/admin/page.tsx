/**
 * Admin Dashboard for Data Management
 * 
 * This page provides administrative functions for:
 * - Importing historical data
 * - Viewing system statistics
 * - Managing database operations
 */

'use client'

import { useState, useEffect } from 'react'
import { LOTTERY_GAMES } from '@/utils/constants'

interface SystemStats {
  overall: {
    totalResults: number
    totalGames: number
    lastUpdated: string | null
  }
  games: Array<{
    gameName: string
    gameDescription: string
    totalResults: number
    oldestResult: string | null
    latestResult: string | null
    dateRange: number
  }>
  recentActivity: Array<{
    gameName: string
    drawDate: string
    numbers: number[]
    jackpot: number | null
    addedAt: string
  }>
}

export default function AdminPage() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [importing, setImporting] = useState(false)
  const [importStatus, setImportStatus] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImportDemo = async () => {
    setImporting(true)
    setImportStatus('Importing demo data...')
    
    try {
      const demoData = [
        {
          gameName: '6/42',
          drawDate: '2025-09-08',
          numbers: [3, 17, 24, 31, 38, 41],
          jackpot: 5200000
        },
        {
          gameName: '6/45',
          drawDate: '2025-09-08',
          numbers: [7, 19, 26, 33, 40, 44],
          jackpot: 8900000
        },
        {
          gameName: '6/49',
          drawDate: '2025-09-08',
          numbers: [5, 14, 23, 32, 41, 48],
          jackpot: 15600000
        }
      ]

      const response = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'results',
          data: demoData
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setImportStatus(`✅ Successfully imported ${result.imported} results`)
        fetchStats() // Refresh stats
      } else {
        setImportStatus(`❌ Import failed: ${result.errors?.join(', ') || 'Unknown error'}`)
      }
    } catch (error) {
      setImportStatus(`❌ Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setImporting(false)
    }
  }

  const handleImportHistorical = async (gameType: string) => {
    setImporting(true)
    setImportStatus(`Importing historical data for ${gameType}...`)
    
    try {
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'historical',
          gameType,
          startDate: '2025-01-01',
          endDate: '2025-09-30'
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setImportStatus(`✅ Successfully imported ${result.imported} results for ${gameType}`)
        fetchStats()
      } else {
        setImportStatus(`❌ Import failed: ${result.errors?.join(', ') || 'Unknown error'}`)
      }
    } catch (error) {
      setImportStatus(`❌ Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setImporting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔧 Admin Dashboard</h1>
          <p className="text-gray-600">Data management and system administration</p>
        </header>

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Games</h3>
            <p className="text-3xl font-bold text-blue-600">{stats?.overall.totalGames || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Results</h3>
            <p className="text-3xl font-bold text-green-600">{stats?.overall.totalResults || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Last Updated</h3>
            <p className="text-sm text-gray-600">
              {stats?.overall.lastUpdated 
                ? new Date(stats.overall.lastUpdated).toLocaleString()
                : 'No data'
              }
            </p>
          </div>
        </div>

        {/* Import Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📥 Data Import</h2>
          
          <div className="space-y-4">
            <div>
              <button
                onClick={handleImportDemo}
                disabled={importing}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 mr-4"
              >
                {importing ? 'Importing...' : 'Import Demo Data'}
              </button>
              <span className="text-sm text-gray-600">Add sample lottery results for testing</span>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-900 mb-2">Import Historical Data by Game:</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {Object.keys(LOTTERY_GAMES).map(gameType => (
                  <button
                    key={gameType}
                    onClick={() => handleImportHistorical(gameType)}
                    disabled={importing}
                    className="bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 disabled:opacity-50"
                  >
                    {gameType}
                  </button>
                ))}
              </div>
            </div>

            {importStatus && (
              <div className="bg-gray-50 border rounded-lg p-4">
                <p className="text-sm font-mono">{importStatus}</p>
              </div>
            )}
          </div>
        </div>

        {/* Game Statistics */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Game Statistics</h2>
          
          {stats?.games && stats.games.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Game</th>
                    <th className="text-left py-2">Results</th>
                    <th className="text-left py-2">Date Range</th>
                    <th className="text-left py-2">Days Covered</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.games.map((game, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-2">
                        <div>
                          <div className="font-medium">{game.gameName}</div>
                          <div className="text-sm text-gray-500">{game.gameDescription}</div>
                        </div>
                      </td>
                      <td className="py-2">{game.totalResults}</td>
                      <td className="py-2 text-sm">
                        {game.oldestResult && game.latestResult ? (
                          <div>
                            <div>{new Date(game.oldestResult).toLocaleDateString()}</div>
                            <div>to {new Date(game.latestResult).toLocaleDateString()}</div>
                          </div>
                        ) : (
                          'No data'
                        )}
                      </td>
                      <td className="py-2">{game.dateRange} days</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No game data available. Import some data to get started.</p>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🕒 Recent Activity</h2>
          
          {stats?.recentActivity && stats.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">{activity.gameName}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(activity.drawDate).toLocaleDateString()}</span>
                    <span className="mx-2">•</span>
                    <span className="text-sm text-gray-600">[{activity.numbers.join(', ')}]</span>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div>₱{activity.jackpot?.toLocaleString() || 'N/A'}</div>
                    <div>{new Date(activity.addedAt).toLocaleTimeString()}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recent activity. Import some data to see updates here.</p>
          )}
        </div>
      </div>
    </div>
  )
}
