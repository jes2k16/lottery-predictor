export interface LotteryGame {
  id: string
  name: string
  description?: string
  maxNumber: number
  numberCount: number
  createdAt: Date
}

export interface LotteryResult {
  id: string
  gameId: string
  drawDate: Date
  numbers: number[]
  jackpot?: number
  createdAt: Date
  game?: LotteryGame
}

export interface Prediction {
  id: string
  gameId: string
  predictedFor: Date
  numbers: number[]
  algorithm: string
  confidence?: number
  createdAt: Date
  game?: LotteryGame
}

export interface NumberStatistics {
  id: string
  gameId: string
  number: number
  frequency: number
  lastDrawn?: Date
  coldStreak: number
  hotStreak: number
  updatedAt: Date
}
