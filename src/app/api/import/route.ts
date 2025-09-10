import { NextRequest, NextResponse } from 'next/server'
import { importLotteryResults, importHistoricalData, importAllHistoricalData } from '@/lib/dataImport'
import { LotteryResultData } from '@/utils/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data, gameType, startDate, endDate } = body

    switch (type) {
      case 'results':
        if (!data || !Array.isArray(data)) {
          return NextResponse.json(
            { error: 'Invalid data format. Expected array of lottery results.' },
            { status: 400 }
          )
        }
        
        const importResult = await importLotteryResults(data as LotteryResultData[])
        return NextResponse.json(importResult)

      case 'historical':
        if (!gameType || !startDate || !endDate) {
          return NextResponse.json(
            { error: 'gameType, startDate, and endDate are required for historical import' },
            { status: 400 }
          )
        }
        
        const historicalResult = await importHistoricalData(
          gameType,
          new Date(startDate),
          new Date(endDate)
        )
        return NextResponse.json(historicalResult)

      case 'all':
        const allResult = await importAllHistoricalData(
          startDate ? new Date(startDate) : undefined,
          endDate ? new Date(endDate) : undefined
        )
        return NextResponse.json(allResult)

      default:
        return NextResponse.json(
          { error: 'Invalid import type. Use "results", "historical", or "all"' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Import API error:', error)
    return NextResponse.json(
      { error: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Lottery Data Import API',
    endpoints: {
      'POST /api/import': {
        description: 'Import lottery data',
        types: {
          results: 'Import array of lottery results',
          historical: 'Import historical data for specific game and date range',
          all: 'Import all historical data for all games'
        },
        examples: {
          results: {
            type: 'results',
            data: [
              {
                gameName: '6/42',
                drawDate: '2025-09-01',
                numbers: [1, 15, 23, 28, 35, 42],
                jackpot: 5000000
              }
            ]
          },
          historical: {
            type: 'historical',
            gameType: '6/42',
            startDate: '2025-01-01',
            endDate: '2025-12-31'
          },
          all: {
            type: 'all',
            startDate: '2000-01-01',
            endDate: '2025-12-31'
          }
        }
      }
    }
  })
}
