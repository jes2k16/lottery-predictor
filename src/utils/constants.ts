export const LOTTERY_GAMES = {
  '6/42': {
    name: '6/42',
    description: 'Lotto 6/42',
    maxNumber: 42,
    numberCount: 6,
    drawDays: ['Tuesday', 'Thursday', 'Saturday']
  },
  '6/45': {
    name: '6/45',
    description: 'Mega Lotto 6/45',
    maxNumber: 45,
    numberCount: 6,
    drawDays: ['Monday', 'Wednesday', 'Friday']
  },
  '6/49': {
    name: '6/49',
    description: 'Super Lotto 6/49',
    maxNumber: 49,
    numberCount: 6,
    drawDays: ['Tuesday', 'Thursday', 'Sunday']
  },
  '6/55': {
    name: '6/55',
    description: 'Grand Lotto 6/55',
    maxNumber: 55,
    numberCount: 6,
    drawDays: ['Monday', 'Wednesday', 'Saturday']
  },
  '6/58': {
    name: '6/58',
    description: 'Ultra Lotto 6/58',
    maxNumber: 58,
    numberCount: 6,
    drawDays: ['Tuesday', 'Friday', 'Sunday']
  }
} as const

export type LotteryGameType = keyof typeof LOTTERY_GAMES
