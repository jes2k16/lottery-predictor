/**
 * Data Manager Utility
 * 
 * High-level functions for managing lottery data operations
 * including statistics calculation and data aggregation
 */

import { prisma } from '@/lib/db'
import { LotteryGame, LotteryResult } from '@/types/lottery'

export interface GameStatistics {
  gameName: string
  totalDraws: number
  dateRange: {
    earliest: Date | null
    latest: Date | null
    daysCovered: number
  }
  numberFrequency: { [number: string]: number }
  hotNumbers: number[]
  coldNumbers: number[]
  averageJackpot: number
  largestJackpot: number
}

export interface SystemStatistics {
  totalGames: number
  totalResults: number
  totalJackpotValue: number
  lastUpdated: Date | null
  gameStatistics: GameStatistics[]
}

/**
 * Get comprehensive system statistics
 */
export async function getSystemStatistics(): Promise<SystemStatistics> {
  try {
    const totalGames = await prisma.lotteryGame.count()
    const totalResults = await prisma.lotteryResult.count()
    
    const jackpotSum = await prisma.lotteryResult.aggregate({
      _sum: {
        jackpot: true
      }
    })

    const lastResult = await prisma.lotteryResult.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true }
    })

    const games = await prisma.lotteryGame.findMany({
      include: {
        results: {
          orderBy: { drawDate: 'desc' }
        }
      }
    })

    const gameStatistics = await Promise.all(
      games.map(game => calculateGameStatistics(game))
    )

    return {
      totalGames,
      totalResults,
      totalJackpotValue: parseFloat(jackpotSum._sum.jackpot?.toString() || '0'),
      lastUpdated: lastResult?.createdAt || null,
      gameStatistics
    }
  } catch (error) {
    console.error('Error fetching system statistics:', error)
    throw new Error('Failed to fetch system statistics')
  }
}

/**
 * Calculate statistics for a specific game
 */
export async function calculateGameStatistics(game: any): Promise<GameStatistics> {
  const results = game.results || []
  
  if (results.length === 0) {
    return {
      gameName: game.name,
      totalDraws: 0,
      dateRange: {
        earliest: null,
        latest: null,
        daysCovered: 0
      },
      numberFrequency: {},
      hotNumbers: [],
      coldNumbers: [],
      averageJackpot: 0,
      largestJackpot: 0
    }
  }

  // Calculate date range
  const dates = results.map((r: any) => new Date(r.drawDate)).sort((a, b) => a.getTime() - b.getTime())
  const earliest = dates[0]
  const latest = dates[dates.length - 1]
  const daysCovered = latest ? Math.ceil((latest.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24)) : 0

  // Calculate number frequency
  const numberFrequency: { [number: string]: number } = {}
  results.forEach((result: any) => {
    result.numbers.forEach((num: number) => {
      numberFrequency[num] = (numberFrequency[num] || 0) + 1
    })
  })

  // Get hot and cold numbers (top 10 most/least frequent)
  const sortedNumbers = Object.entries(numberFrequency)
    .sort(([,a], [,b]) => b - a)
    .map(([num]) => parseInt(num))

  const hotNumbers = sortedNumbers.slice(0, 10)
  const coldNumbers = sortedNumbers.slice(-10).reverse()

  // Calculate jackpot statistics
  const jackpots = results
    .map((r: any) => parseFloat(r.jackpot?.toString() || '0'))
    .filter(j => j > 0)
  
  const averageJackpot = jackpots.length > 0 ? jackpots.reduce((a, b) => a + b, 0) / jackpots.length : 0
  const largestJackpot = jackpots.length > 0 ? Math.max(...jackpots) : 0

  return {
    gameName: game.name,
    totalDraws: results.length,
    dateRange: {
      earliest,
      latest,
      daysCovered
    },
    numberFrequency,
    hotNumbers,
    coldNumbers,
    averageJackpot,
    largestJackpot
  }
}

/**
 * Get recent lottery results
 */
export async function getRecentResults(limit: number = 10): Promise<any[]> {
  try {
    const results = await prisma.lotteryResult.findMany({
      include: {
        game: true
      },
      orderBy: {
        drawDate: 'desc'
      },
      take: limit
    })

    return results.map(result => ({
      id: result.id,
      gameName: result.game.name,
      gameDescription: result.game.description,
      drawDate: result.drawDate,
      numbers: result.numbers,
      jackpot: result.jackpot ? parseFloat(result.jackpot.toString()) : null,
      createdAt: result.createdAt
    }))
  } catch (error) {
    console.error('Error fetching recent results:', error)
    throw new Error('Failed to fetch recent results')
  }
}

/**
 * Search lottery results with filters
 */
export async function searchResults(filters: {
  gameType?: string
  startDate?: Date
  endDate?: Date
  numbers?: number[]
  minJackpot?: number
  maxJackpot?: number
  limit?: number
  offset?: number
}) {
  try {
    const where: any = {}

    if (filters.gameType) {
      const game = await prisma.lotteryGame.findUnique({
        where: { name: filters.gameType }
      })
      if (game) where.gameId = game.id
    }

    if (filters.startDate || filters.endDate) {
      where.drawDate = {}
      if (filters.startDate) where.drawDate.gte = filters.startDate
      if (filters.endDate) where.drawDate.lte = filters.endDate
    }

    if (filters.minJackpot || filters.maxJackpot) {
      where.jackpot = {}
      if (filters.minJackpot) where.jackpot.gte = filters.minJackpot
      if (filters.maxJackpot) where.jackpot.lte = filters.maxJackpot
    }

    // Note: Array filtering for numbers would need to be done post-query
    // as Prisma doesn't have native array contains operations for this use case

    const results = await prisma.lotteryResult.findMany({
      where,
      include: {
        game: true
      },
      orderBy: {
        drawDate: 'desc'
      },
      take: Math.min(filters.limit || 50, 200),
      skip: filters.offset || 0
    })

    let filteredResults = results

    // Filter by numbers if specified
    if (filters.numbers && filters.numbers.length > 0) {
      filteredResults = results.filter(result => 
        filters.numbers!.every(num => result.numbers.includes(num))
      )
    }

    return {
      results: filteredResults.map(result => ({
        id: result.id,
        gameName: result.game.name,
        gameDescription: result.game.description,
        drawDate: result.drawDate,
        numbers: result.numbers,
        jackpot: result.jackpot ? parseFloat(result.jackpot.toString()) : null,
        createdAt: result.createdAt
      })),
      total: filteredResults.length
    }
  } catch (error) {
    console.error('Error searching results:', error)
    throw new Error('Failed to search results')
  }
}

/**
 * Get number analysis for a specific game
 */
export async function getNumberAnalysis(gameType: string) {
  try {
    const game = await prisma.lotteryGame.findUnique({
      where: { name: gameType },
      include: {
        results: {
          orderBy: { drawDate: 'desc' },
          take: 100 // Analyze last 100 draws
        }
      }
    })

    if (!game) {
      throw new Error(`Game not found: ${gameType}`)
    }

    const analysis = await calculateGameStatistics(game)
    
    // Additional analysis for patterns
    const recentDraws = game.results.slice(0, 20) // Last 20 draws
    const patterns = {
      evenOddRatio: calculateEvenOddRatio(recentDraws),
      highLowRatio: calculateHighLowRatio(recentDraws, game.maxNumber),
      consecutiveNumbers: findConsecutivePatterns(recentDraws),
      numberGaps: calculateNumberGaps(recentDraws, game.maxNumber)
    }

    return {
      ...analysis,
      patterns,
      gameConfig: {
        maxNumber: game.maxNumber,
        numberCount: game.numberCount
      }
    }
  } catch (error) {
    console.error('Error analyzing numbers:', error)
    throw new Error('Failed to analyze numbers')
  }
}

// Helper functions for pattern analysis
function calculateEvenOddRatio(results: any[]) {
  let evenCount = 0
  let oddCount = 0
  
  results.forEach(result => {
    result.numbers.forEach((num: number) => {
      if (num % 2 === 0) evenCount++
      else oddCount++
    })
  })
  
  const total = evenCount + oddCount
  return {
    even: total > 0 ? (evenCount / total * 100).toFixed(1) : 0,
    odd: total > 0 ? (oddCount / total * 100).toFixed(1) : 0
  }
}

function calculateHighLowRatio(results: any[], maxNumber: number) {
  const midpoint = Math.ceil(maxNumber / 2)
  let highCount = 0
  let lowCount = 0
  
  results.forEach(result => {
    result.numbers.forEach((num: number) => {
      if (num > midpoint) highCount++
      else lowCount++
    })
  })
  
  const total = highCount + lowCount
  return {
    high: total > 0 ? (highCount / total * 100).toFixed(1) : 0,
    low: total > 0 ? (lowCount / total * 100).toFixed(1) : 0
  }
}

function findConsecutivePatterns(results: any[]) {
  let consecutiveCount = 0
  
  results.forEach(result => {
    const sorted = [...result.numbers].sort((a, b) => a - b)
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i + 1] === sorted[i] + 1) {
        consecutiveCount++
      }
    }
  })
  
  return {
    frequency: consecutiveCount,
    percentage: results.length > 0 ? (consecutiveCount / (results.length * 5) * 100).toFixed(1) : 0
  }
}

function calculateNumberGaps(results: any[], maxNumber: number) {
  const allNumbers = Array.from({ length: maxNumber }, (_, i) => i + 1)
  const drawnNumbers = new Set()
  
  results.forEach(result => {
    result.numbers.forEach((num: number) => drawnNumbers.add(num))
  })
  
  const gaps = allNumbers.filter(num => !drawnNumbers.has(num))
  
  return {
    missingNumbers: gaps,
    missingCount: gaps.length,
    coverage: ((maxNumber - gaps.length) / maxNumber * 100).toFixed(1)
  }
}
