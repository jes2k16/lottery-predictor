'use client'

import { useState, useEffect } from 'react'
import { LOTTERY_GAMES } from '@/utils/constants'
import NumberBall from '@/components/NumberBall'

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
  const [importStatus, setImportStatus] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchStats() }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')
      if (response.ok) setStats(await response.json())
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
        { gameName: '6/42', drawDate: '2025-09-08', numbers: [3, 17, 24, 31, 38, 41], jackpot: 5200000 },
        { gameName: '6/45', drawDate: '2025-09-08', numbers: [7, 19, 26, 33, 40, 44], jackpot: 8900000 },
        { gameName: '6/49', drawDate: '2025-09-08', numbers: [5, 14, 23, 32, 41, 48], jackpot: 15600000 },
      ]
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'results', data: demoData }),
      })
      const result = await response.json()
      setImportStatus(result.success
        ? `Successfully imported ${result.imported} results`
        : `Import failed: ${result.errors?.join(', ') || 'Unknown error'}`)
      if (result.success) fetchStats()
    } catch (error) {
      setImportStatus(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
        body: JSON.stringify({ type: 'historical', gameType, startDate: '2025-01-01', endDate: '2025-09-30' }),
      })
      const result = await response.json()
      setImportStatus(result.success
        ? `Successfully imported ${result.imported} results for ${gameType}`
        : `Import failed: ${result.errors?.join(', ') || 'Unknown error'}`)
      if (result.success) fetchStats()
    } catch (error) {
      setImportStatus(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setImporting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="w-8 h-8 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin</h1>
        <p className="text-gray-500 mt-1">Data management and system administration</p>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-medium text-gray-500">Total Games</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{stats?.overall.totalGames || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-medium text-gray-500">Total Results</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats?.overall.totalResults || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-medium text-gray-500">Last Updated</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">
            {stats?.overall.lastUpdated
              ? new Date(stats.overall.lastUpdated).toLocaleString()
              : 'No data'}
          </p>
        </div>
      </div>

      {/* Import Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h2 className="text-lg font-semibold text-gray-900">Data Import</h2>

        <div className="flex items-center gap-4">
          <button
            onClick={handleImportDemo}
            disabled={importing}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium transition-colors"
          >
            {importing ? 'Importing...' : 'Import Demo Data'}
          </button>
          <span className="text-sm text-gray-500">Add sample results for testing</span>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Import Historical Data by Game</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {Object.keys(LOTTERY_GAMES).map(gameType => (
              <button
                key={gameType}
                onClick={() => handleImportHistorical(gameType)}
                disabled={importing}
                className="bg-gray-50 border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 disabled:opacity-50 transition-colors"
              >
                {gameType}
              </button>
            ))}
          </div>
        </div>

        {importStatus && (
          <div className={`border rounded-lg p-4 text-sm font-mono ${
            importStatus.includes('failed') || importStatus.includes('Failed')
              ? 'bg-red-50 border-red-200 text-red-800'
              : importStatus.includes('Successfully')
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-gray-50 border-gray-200 text-gray-700'
          }`}>
            {importStatus}
          </div>
        )}
      </div>

      {/* Game Statistics */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Game Statistics</h2>
        </div>
        {stats?.games && stats.games.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-6 py-3">Game</th>
                  <th className="text-left px-6 py-3">Results</th>
                  <th className="text-left px-6 py-3">Date Range</th>
                  <th className="text-left px-6 py-3">Days</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.games.map((game, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3">
                      <p className="font-medium text-gray-900">{game.gameName}</p>
                      <p className="text-xs text-gray-500">{game.gameDescription}</p>
                    </td>
                    <td className="px-6 py-3 font-mono">{game.totalResults}</td>
                    <td className="px-6 py-3 text-gray-500">
                      {game.oldestResult && game.latestResult
                        ? `${new Date(game.oldestResult).toLocaleDateString()} - ${new Date(game.latestResult).toLocaleDateString()}`
                        : 'No data'}
                    </td>
                    <td className="px-6 py-3 font-mono">{game.dateRange}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400">No game data available yet.</div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        {stats?.recentActivity && stats.recentActivity.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold px-2 py-1 rounded-md bg-indigo-50 text-indigo-700">
                    {activity.gameName}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(activity.drawDate).toLocaleDateString()}
                  </span>
                  <div className="flex gap-1">
                    {activity.numbers.map((n, i) => (
                      <NumberBall key={i} number={n} size="sm" />
                    ))}
                  </div>
                </div>
                <span className="text-sm text-green-700 font-medium">
                  {activity.jackpot ? `₱${activity.jackpot.toLocaleString()}` : '—'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400">No recent activity.</div>
        )}
      </div>
    </div>
  )
}
