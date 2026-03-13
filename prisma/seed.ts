import { PrismaClient } from '@prisma/client'
import { LOTTERY_GAMES } from '../src/utils/constants'

const prisma = new PrismaClient()

function numbersToString(nums: number[]): string {
  return nums.join(',')
}

async function main() {
  console.log('Starting database seed...')

  console.log('Creating lottery games...')

  for (const [key, gameConfig] of Object.entries(LOTTERY_GAMES)) {
    const game = await prisma.lotteryGame.upsert({
      where: { name: key },
      update: {
        description: gameConfig.description,
        maxNumber: gameConfig.maxNumber,
        numberCount: gameConfig.numberCount,
      },
      create: {
        name: key,
        description: gameConfig.description,
        maxNumber: gameConfig.maxNumber,
        numberCount: gameConfig.numberCount,
      },
    })
    console.log(`Created/Updated: ${game.name} - ${game.description}`)
  }

  console.log('Adding sample lottery results...')

  const sampleResults = [
    { gameName: '6/42', drawDate: new Date('2025-09-02'), numbers: [40, 14, 16, 29, 35, 18], jackpot: 73224072.00 },
    { gameName: '6/42', drawDate: new Date('2025-09-04'), numbers: [24, 38, 18, 30, 9, 27], jackpot: 79979967.00 },
    { gameName: '6/42', drawDate: new Date('2025-09-06'), numbers: [8, 39, 7, 38, 2, 9], jackpot: 86346740.00 },
    { gameName: '6/45', drawDate: new Date('2025-09-01'), numbers: [38, 3, 36, 15, 27, 33], jackpot: 9759510.00 },
    { gameName: '6/45', drawDate: new Date('2025-09-03'), numbers: [10, 39, 43, 33, 14, 9], jackpot: 13103444.00 },
    { gameName: '6/45', drawDate: new Date('2025-09-05'), numbers: [4, 34, 31, 25, 18, 41], jackpot: 16682679.40 },
    { gameName: '6/49', drawDate: new Date('2025-09-02'), numbers: [38, 11, 16, 31, 21, 7], jackpot: 18731955.00 },
    { gameName: '6/49', drawDate: new Date('2025-09-04'), numbers: [16, 49, 14, 17, 22, 6], jackpot: 21833187.00 },
    { gameName: '6/55', drawDate: new Date('2025-09-01'), numbers: [54, 20, 24, 30, 39, 29], jackpot: 113375439.00 },
    { gameName: '6/55', drawDate: new Date('2025-09-03'), numbers: [43, 9, 41, 18, 48, 27], jackpot: 119888627.00 },
    { gameName: '6/55', drawDate: new Date('2025-09-06'), numbers: [29, 4, 34, 20, 1, 48], jackpot: 126391514.00 },
    { gameName: '6/58', drawDate: new Date('2025-09-02'), numbers: [36, 58, 49, 22, 25, 40], jackpot: 49500000.00 },
    { gameName: '6/58', drawDate: new Date('2025-09-05'), numbers: [41, 1, 19, 57, 27, 11], jackpot: 49500000.00 },
  ]

  for (const result of sampleResults) {
    const game = await prisma.lotteryGame.findUnique({
      where: { name: result.gameName }
    })

    if (game) {
      await prisma.lotteryResult.upsert({
        where: {
          gameId_drawDate: {
            gameId: game.id,
            drawDate: result.drawDate
          }
        },
        update: {
          numbers: numbersToString(result.numbers),
          jackpot: result.jackpot
        },
        create: {
          gameId: game.id,
          drawDate: result.drawDate,
          numbers: numbersToString(result.numbers),
          jackpot: result.jackpot
        }
      })
      console.log(`Added result: ${result.gameName} - ${result.drawDate.toDateString()} - [${result.numbers.join(', ')}]`)
    }
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
