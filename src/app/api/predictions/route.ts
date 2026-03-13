import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { numbersToString, parseNumbers } from '@/utils/numbers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { gameName, numbers, algorithm = 'lucky_pick' } = body

    if (!gameName || !numbers || !Array.isArray(numbers)) {
      return NextResponse.json(
        { error: 'gameName and numbers[] are required' },
        { status: 400 }
      )
    }

    const game = await prisma.lotteryGame.findUnique({
      where: { name: gameName },
    })

    if (!game) {
      return NextResponse.json(
        { error: `Game "${gameName}" not found` },
        { status: 404 }
      )
    }

    if (numbers.length !== game.numberCount) {
      return NextResponse.json(
        { error: `Expected ${game.numberCount} numbers, got ${numbers.length}` },
        { status: 400 }
      )
    }

    const sorted = numbers.sort((a: number, b: number) => a - b)

    const prediction = await prisma.prediction.create({
      data: {
        gameId: game.id,
        predictedFor: new Date(),
        numbers: numbersToString(sorted),
        algorithm,
        confidence: null,
      },
      include: { game: true },
    })

    return NextResponse.json({
      id: prediction.id,
      gameName: prediction.game.name,
      numbers: parseNumbers(prediction.numbers),
      algorithm: prediction.algorithm,
      predictedFor: prediction.predictedFor,
      createdAt: prediction.createdAt,
    })
  } catch (error) {
    console.error('Prediction POST error:', error)
    return NextResponse.json(
      { error: 'Failed to save prediction' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gameName = searchParams.get('game') || '6/42'
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    const game = await prisma.lotteryGame.findUnique({
      where: { name: gameName },
    })

    if (!game) {
      return NextResponse.json({ predictions: [], total: 0 })
    }

    const [predictions, total] = await Promise.all([
      prisma.prediction.findMany({
        where: { gameId: game.id },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: { game: true },
      }),
      prisma.prediction.count({ where: { gameId: game.id } }),
    ])

    return NextResponse.json({
      predictions: predictions.map((p: any) => ({
        id: p.id,
        gameName: p.game.name,
        numbers: parseNumbers(p.numbers),
        algorithm: p.algorithm,
        confidence: p.confidence,
        predictedFor: p.predictedFor,
        createdAt: p.createdAt,
      })),
      total,
      pagination: { limit, offset, hasMore: offset + limit < total },
    })
  } catch (error) {
    console.error('Prediction GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch predictions' },
      { status: 500 }
    )
  }
}
