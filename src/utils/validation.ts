import { LOTTERY_GAMES, LotteryGameType } from './constants'

export interface LotteryResultData {
  gameName: string
  drawDate: Date | string
  numbers: number[]
  jackpot?: number
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validates lottery result data
 */
export function validateLotteryResult(data: LotteryResultData): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Validate game name
  if (!data.gameName || typeof data.gameName !== 'string') {
    errors.push('Game name is required and must be a string')
  } else if (!(data.gameName in LOTTERY_GAMES)) {
    errors.push(`Invalid game name: ${data.gameName}. Must be one of: ${Object.keys(LOTTERY_GAMES).join(', ')}`)
  }

  // Validate draw date
  let drawDate: Date
  try {
    drawDate = new Date(data.drawDate)
    if (isNaN(drawDate.getTime())) {
      errors.push('Invalid draw date format')
    } else {
      // Check if date is in the future
      if (drawDate > new Date()) {
        warnings.push('Draw date is in the future')
      }
      // Check if date is too old (before 1995 when Philippine lottery started)
      if (drawDate < new Date('1995-01-01')) {
        warnings.push('Draw date is before Philippine lottery history (pre-1995)')
      }
    }
  } catch {
    errors.push('Invalid draw date')
  }

  // Validate numbers array
  if (!Array.isArray(data.numbers)) {
    errors.push('Numbers must be an array')
  } else {
    const gameConfig = LOTTERY_GAMES[data.gameName as LotteryGameType]
    
    if (gameConfig) {
      // Check array length
      if (data.numbers.length !== gameConfig.numberCount) {
        errors.push(`Expected ${gameConfig.numberCount} numbers, got ${data.numbers.length}`)
      }

      // Check number validity
      data.numbers.forEach((num, index) => {
        if (!Number.isInteger(num)) {
          errors.push(`Number at index ${index} is not an integer: ${num}`)
        } else if (num < 1 || num > gameConfig.maxNumber) {
          errors.push(`Number ${num} at index ${index} is out of range (1-${gameConfig.maxNumber})`)
        }
      })

      // Check for duplicates
      const uniqueNumbers = new Set(data.numbers)
      if (uniqueNumbers.size !== data.numbers.length) {
        errors.push('Duplicate numbers found in the array')
      }

      // Sort order warning
      const sortedNumbers = [...data.numbers].sort((a, b) => a - b)
      if (JSON.stringify(data.numbers) !== JSON.stringify(sortedNumbers)) {
        warnings.push('Numbers are not in ascending order')
      }
    }
  }

  // Validate jackpot (optional)
  if (data.jackpot !== undefined) {
    if (typeof data.jackpot !== 'number' || data.jackpot < 0) {
      errors.push('Jackpot must be a positive number')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Cleans and normalizes lottery result data
 */
export function cleanLotteryResult(data: LotteryResultData): LotteryResultData {
  return {
    gameName: data.gameName.trim(),
    drawDate: new Date(data.drawDate),
    numbers: [...data.numbers].sort((a, b) => a - b), // Sort numbers
    jackpot: data.jackpot ? Math.round(data.jackpot * 100) / 100 : undefined // Round to 2 decimal places
  }
}

/**
 * Validates multiple lottery results
 */
export function validateLotteryResults(results: LotteryResultData[]): {
  validResults: LotteryResultData[]
  invalidResults: { data: LotteryResultData; validation: ValidationResult }[]
  summary: {
    total: number
    valid: number
    invalid: number
    warnings: number
  }
} {
  const validResults: LotteryResultData[] = []
  const invalidResults: { data: LotteryResultData; validation: ValidationResult }[] = []
  let totalWarnings = 0

  results.forEach(result => {
    const validation = validateLotteryResult(result)
    
    if (validation.isValid) {
      validResults.push(cleanLotteryResult(result))
      totalWarnings += validation.warnings.length
    } else {
      invalidResults.push({ data: result, validation })
    }
  })

  return {
    validResults,
    invalidResults,
    summary: {
      total: results.length,
      valid: validResults.length,
      invalid: invalidResults.length,
      warnings: totalWarnings
    }
  }
}

/**
 * Detects potential duplicate results
 */
export function detectDuplicates(results: LotteryResultData[]): LotteryResultData[][] {
  const duplicates: LotteryResultData[][] = []
  const seen = new Map<string, LotteryResultData[]>()

  results.forEach(result => {
    const key = `${result.gameName}-${new Date(result.drawDate).toDateString()}`
    
    if (!seen.has(key)) {
      seen.set(key, [])
    }
    seen.get(key)!.push(result)
  })

  seen.forEach(group => {
    if (group.length > 1) {
      duplicates.push(group)
    }
  })

  return duplicates
}
