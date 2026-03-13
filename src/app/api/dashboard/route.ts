import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { LOTTERY_GAMES } from '@/utils/constants'
import { parseNumbers } from '@/utils/numbers'

export async function GET() {
  try {
    const game = await prisma.lotteryGame.findUnique({
      where: { name: '6/42' },
    })

    if (!game) {
      return NextResponse.json({
        recentResults: [],
        stats: { totalDraws: 0, lastDrawDate: null, largestJackpot: 0, nextDrawDay: getNextDrawDay('6/42') },
        numberFrequency: {},
        hotNumbers: [],
        coldNumbers: [],
      })
    }

    const recentResults = await prisma.lotteryResult.findMany({
      where: { gameId: game.id },
      orderBy: { drawDate: 'desc' },
      take: 10,
      include: { game: true },
    })

    const allResults = await prisma.lotteryResult.findMany({
      where: { gameId: game.id },
      orderBy: { drawDate: 'desc' },
      select: { numbers: true, drawDate: true, jackpot: true },
    })

    const totalDraws = allResults.length
    const lastDrawDate = allResults[0]?.drawDate ?? null

    const jackpots = allResults
      .map((r: any) => parseFloat(r.jackpot?.toString() || '0'))
      .filter((j: number) => j > 0)
    const largestJackpot = jackpots.length > 0 ? Math.max(...jackpots) : 0

    const numberFrequency: Record<number, number> = {}
    for (let i = 1; i <= game.maxNumber; i++) numberFrequency[i] = 0
    allResults.forEach((r: any) => {
      const nums = parseNumbers(r.numbers)
      nums.forEach((n: number) => { numberFrequency[n] = (numberFrequency[n] || 0) + 1 })
    })

    const sorted = Object.entries(numberFrequency)
      .map(([num, freq]) => ({ number: parseInt(num), frequency: freq }))
      .sort((a, b) => b.frequency - a.frequency)

    const hotNumbers = sorted.slice(0, 10).map(s => s.number)
    const coldNumbers = sorted.slice(-10).reverse().map(s => s.number)

    const totalPredictions = await prisma.prediction.count({
      where: { gameId: game.id },
    })

    return NextResponse.json({
      recentResults: recentResults.map((r: any) => ({
        id: r.id,
        gameName: r.game.name,
        drawDate: r.drawDate,
        numbers: parseNumbers(r.numbers),
        jackpot: r.jackpot ? parseFloat(r.jackpot.toString()) : null,
      })),
      stats: {
        totalDraws,
        lastDrawDate,
        largestJackpot,
        nextDrawDay: getNextDrawDay('6/42'),
        totalPredictions,
      },
      numberFrequency,
      hotNumbers,
      coldNumbers,
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}

function getNextDrawDay(gameType: string): string {
  const config = LOTTERY_GAMES[gameType as keyof typeof LOTTERY_GAMES]
  if (!config) return 'Unknown'

  const dayMap: Record<string, number> = {
    Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
    Thursday: 4, Friday: 5, Saturday: 6,
  }
  const today = new Date()
  const todayDay = today.getDay()

  const drawDayNumbers = config.drawDays.map(d => dayMap[d])
  let minDaysAhead = 7
  let nextDay = ''

  for (const dd of drawDayNumbers) {
    let diff = dd - todayDay
    if (diff <= 0) diff += 7
    if (diff < minDaysAhead) {
      minDaysAhead = diff
      nextDay = config.drawDays[drawDayNumbers.indexOf(dd)]
    }
  }

  const nextDate = new Date(today)
  nextDate.setDate(today.getDate() + minDaysAhead)
  return `${nextDay}, ${nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
}
