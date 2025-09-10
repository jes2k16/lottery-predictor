import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gameType = searchParams.get('game')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build where clause
    const where: any = {}
    
    if (gameType) {
      const game = await prisma.lotteryGame.findUnique({
        where: { name: gameType }
      })
      if (game) {
        where.gameId = game.id
      }
    }

    if (startDate && endDate) {
      where.drawDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    } else if (startDate) {
      where.drawDate = {
        gte: new Date(startDate)
      }
    } else if (endDate) {
      where.drawDate = {
        lte: new Date(endDate)
      }
    }

    // Get results with game information
    const results = await prisma.lotteryResult.findMany({
      where,
      include: {
        game: true
      },
      orderBy: {
        drawDate: 'desc'
      },
      take: Math.min(limit, 200), // Max 200 results per request
      skip: offset
    })

    // Get total count for pagination
    const total = await prisma.lotteryResult.count({ where })

    return NextResponse.json({
      results: results.map(result => ({
        id: result.id,
        gameName: result.game.name,
        gameDescription: result.game.description,
        drawDate: result.drawDate,
        numbers: result.numbers,
        jackpot: result.jackpot ? parseFloat(result.jackpot.toString()) : null,
        createdAt: result.createdAt
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  } catch (error) {
    console.error('Results API error:', error)
    return NextResponse.json(
      { error: `Failed to fetch results: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { gameName, drawDate, numbers, jackpot } = body

    // Validate required fields
    if (!gameName || !drawDate || !numbers || !Array.isArray(numbers)) {
      return NextResponse.json(
        { error: 'gameName, drawDate, and numbers array are required' },
        { status: 400 }
      )
    }

    // Find the game
    const game = await prisma.lotteryGame.findUnique({
      where: { name: gameName }
    })

    if (!game) {
      return NextResponse.json(
        { error: `Game not found: ${gameName}` },
        { status: 404 }
      )
    }

    // Create the result
    const result = await prisma.lotteryResult.create({
      data: {
        gameId: game.id,
        drawDate: new Date(drawDate),
        numbers: numbers,
        jackpot: jackpot || null
      },
      include: {
        game: true
      }
    })

    return NextResponse.json({
      id: result.id,
      gameName: result.game.name,
      gameDescription: result.game.description,
      drawDate: result.drawDate,
      numbers: result.numbers,
      jackpot: result.jackpot ? parseFloat(result.jackpot.toString()) : null,
      createdAt: result.createdAt
    })
  } catch (error) {
    console.error('Results POST API error:', error)
    return NextResponse.json(
      { error: `Failed to create result: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
