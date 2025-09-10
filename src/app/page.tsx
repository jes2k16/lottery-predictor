import { LOTTERY_GAMES } from '@/utils/constants'

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

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Phase 1 Complete: Project setup with NextJS, TypeScript, Tailwind CSS, and PostgreSQL
          </p>
        </div>
      </div>
    </main>
  )
}