import { LOTTERY_GAMES } from '@/utils/constants'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎯 Philippine Lottery Predictor
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Advanced prediction system using 25+ years of historical data and statistical analysis
          </p>
          
          {/* Navigation */}
          <div className="flex justify-center gap-4 mt-6">
            <Link 
              href="/results" 
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Results
            </Link>
            <Link 
              href="/admin" 
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Admin Panel
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {Object.entries(LOTTERY_GAMES).map(([key, game]) => (
            <div key={key} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{game.description}</h3>
              <p className="text-gray-600 mb-4">
                Pick {game.numberCount} numbers from 1 to {game.maxNumber}
              </p>
              <div className="text-sm text-gray-500">
                <strong>Draw Days:</strong> {game.drawDays.join(', ')}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
              <div className="text-gray-600">Historical Results</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">0</div>
              <div className="text-gray-600">Active Predictions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">--</div>
              <div className="text-gray-600">Accuracy Rate</div>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 Development Progress</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Phase 1: Project Foundation</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">✅ Complete</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Phase 2: Data Infrastructure</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">✅ Complete</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Phase 3: Core Functionality</span>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">⏳ Pending</span>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-blue-900 font-medium mb-2">📋 Phase 2 Features Implemented:</h4>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Database schema for all 5 lottery games (6/42, 6/45, 6/49, 6/55, 6/58)</li>
              <li>• Data validation and cleaning utilities</li>
              <li>• Web scraper framework for PCSO results</li>
              <li>• Bulk import system for historical data</li>
              <li>• API endpoints: /api/results, /api/import, /api/stats</li>
              <li>• Database seeding with sample September 2025 results</li>
            </ul>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Ready for Phase 3: Statistical Analysis & Prediction Algorithms
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}