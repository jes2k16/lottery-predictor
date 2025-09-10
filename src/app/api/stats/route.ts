import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gameType = searchParams.get('game')

    // Get overall statistics
    const totalResults = await prisma.lotteryResult.count()
    const totalGames = await prisma.lotteryGame.count()

    // Get game-specific statistics
    let gameStats = []
    if (gameType) {
      const game = await prisma.lotteryGame.findUnique({
        where: { name: gameType },
        include: {
          results: {
            orderBy: { drawDate: 'desc' },
            take: 1
          }
        }
      })

      if (game) {
        const resultCount = await prisma.lotteryResult.count({
          where: { gameId: game.id }
        })

        const oldestResult = await prisma.lotteryResult.findFirst({
          where: { gameId: game.id },
          orderBy: { drawDate: 'asc' }
        })

        const latestResult = await prisma.lotteryResult.findFirst({
          where: { gameId: game.id },
          orderBy: { drawDate: 'desc' }
        })

        gameStats = [{
          gameName: game.name,
          gameDescription: game.description,
          maxNumber: game.maxNumber,
          numberCount: game.numberCount,
          totalResults: resultCount,
          oldestResult: oldestResult?.drawDate || null,
          latestResult: latestResult?.drawDate || null,
          dateRange: oldestResult && latestResult 
            ? Math.ceil((latestResult.drawDate.getTime() - oldestResult.drawDate.getTime()) / (1000 * 60 * 60 * 24))
            : 0
        }]
      }
    } else {
      // Get statistics for all games
      const games = await prisma.lotteryGame.findMany({
        include: {
          _count: {
            select: { results: true }
          }
        }
      })

      gameStats = await Promise.all(games.map(async (game) => {
        const oldestResult = await prisma.lotteryResult.findFirst({
          where: { gameId: game.id },
          orderBy: { drawDate: 'asc' }
        })

        const latestResult = await prisma.lotteryResult.findFirst({
          where: { gameId: game.id },
          orderBy: { drawDate: 'desc' }
        })

        return {
          gameName: game.name,
          gameDescription: game.description,
          maxNumber: game.maxNumber,
          numberCount: game.numberCount,
          totalResults: game._count.results,
          oldestResult: oldestResult?.drawDate || null,
          latestResult: latestResult?.drawDate || null,
          dateRange: oldestResult && latestResult 
            ? Math.ceil((latestResult.drawDate.getTime() - oldestResult.drawDate.getTime()) / (1000 * 60 * 60 * 24))
            : 0
        }
      }))
    }

    // Get recent activity
    const recentResults = await prisma.lotteryResult.findMany({
      include: {
        game: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    return NextResponse.json({
      overall: {
        totalResults,
        totalGames,
        lastUpdated: recentResults[0]?.createdAt || null
      },
      games: gameStats,
      recentActivity: recentResults.map(result => ({
        gameName: result.game.name,
        drawDate: result.drawDate,
        numbers: result.numbers,
        jackpot: result.jackpot ? parseFloat(result.jackpot.toString()) : null,
        addedAt: result.createdAt
      }))
    })
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json(
      { error: `Failed to fetch statistics: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
