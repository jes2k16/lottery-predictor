import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseNumbers } from '@/utils/numbers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gameName = searchParams.get('game') || '6/42'
    const numbersParam = searchParams.get('numbers')

    if (!numbersParam) {
      return NextResponse.json(
        { error: 'numbers query param is required (comma-separated)' },
        { status: 400 }
      )
    }

    const numbers = numbersParam.split(',').map(Number).sort((a, b) => a - b)

    const game = await prisma.lotteryGame.findUnique({
      where: { name: gameName },
    })

    if (!game) {
      return NextResponse.json({ error: `Game "${gameName}" not found` }, { status: 404 })
    }

    const allResults = await prisma.lotteryResult.findMany({
      where: { gameId: game.id },
      orderBy: { drawDate: 'desc' },
      select: { numbers: true, drawDate: true },
    })

    const totalDraws = allResults.length

    const globalFrequency: Record<number, number> = {}
    for (let i = 1; i <= game.maxNumber; i++) globalFrequency[i] = 0
    allResults.forEach((r: any) => {
      const nums = parseNumbers(r.numbers)
      nums.forEach((n: number) => { globalFrequency[n] = (globalFrequency[n] || 0) + 1 })
    })

    const recentWindow = allResults.slice(0, 20)
    const recentFrequency: Record<number, number> = {}
    recentWindow.forEach((r: any) => {
      const nums = parseNumbers(r.numbers)
      nums.forEach((n: number) => { recentFrequency[n] = (recentFrequency[n] || 0) + 1 })
    })

    const avgFreq = totalDraws > 0
      ? Object.values(globalFrequency).reduce((a, b) => a + b, 0) / game.maxNumber
      : 0

    const numberAnalysis = numbers.map(num => {
      const freq = globalFrequency[num] || 0
      const recentFreq = recentFrequency[num] || 0
      const freqPercent = totalDraws > 0 ? ((freq / totalDraws) * 100) : 0

      let status: 'hot' | 'warm' | 'cold'
      if (recentFreq >= 3) status = 'hot'
      else if (recentFreq >= 1) status = 'warm'
      else status = 'cold'

      return {
        number: num,
        frequency: freq,
        frequencyPercent: parseFloat(freqPercent.toFixed(1)),
        recentFrequency: recentFreq,
        status,
      }
    })

    const midpoint = Math.ceil(game.maxNumber / 2)
    const evenCount = numbers.filter(n => n % 2 === 0).length
    const oddCount = numbers.length - evenCount
    const highCount = numbers.filter(n => n > midpoint).length
    const lowCount = numbers.length - highCount

    const range = numbers[numbers.length - 1] - numbers[0]
    const coverageScore = parseFloat(((range / (game.maxNumber - 1)) * 100).toFixed(1))

    const numbersKey = numbers.join(',')
    const exactMatch = allResults.find((r: any) => {
      const nums = parseNumbers(r.numbers)
      return [...nums].sort((a: number, b: number) => a - b).join(',') === numbersKey
    })

    const partialMatches = allResults
      .map((r: any) => {
        const nums = parseNumbers(r.numbers)
        const matched = numbers.filter((n: number) => nums.includes(n))
        return { drawDate: r.drawDate, matchCount: matched.length, matchedNumbers: matched }
      })
      .filter((m: { matchCount: number }) => m.matchCount >= 3)
      .sort((a: { matchCount: number }, b: { matchCount: number }) => b.matchCount - a.matchCount)
      .slice(0, 5)

    return NextResponse.json({
      numbers,
      totalDraws,
      numberAnalysis,
      distribution: {
        even: evenCount,
        odd: oddCount,
        high: highCount,
        low: lowCount,
        midpoint,
      },
      coverageScore,
      exactMatchFound: !!exactMatch,
      exactMatchDate: exactMatch?.drawDate ?? null,
      bestPartialMatches: partialMatches,
      averageFrequency: parseFloat(avgFreq.toFixed(1)),
    })
  } catch (error) {
    console.error('Analyze API error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze numbers' },
      { status: 500 }
    )
  }
}
