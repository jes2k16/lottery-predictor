/**
 * PCSO Lottery Data Scraper
 * 
 * This module provides functions to scrape lottery results from PCSO websites
 * and other reliable sources for historical data collection.
 */

import { LotteryResultData, validateLotteryResult, cleanLotteryResult } from './validation'

export interface ScrapingResult {
  success: boolean
  data: LotteryResultData[]
  errors: string[]
  source: string
  scrapedAt: Date
}

/**
 * Mock scraper for demonstration - simulates scraping PCSO website
 * In production, this would make actual HTTP requests to PCSO endpoints
 */
export async function scrapePCSOResults(
  gameType: string,
  startDate: Date,
  endDate: Date
): Promise<ScrapingResult> {
  console.log(`🔍 Scraping ${gameType} results from ${startDate.toDateString()} to ${endDate.toDateString()}`)
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  try {
    // Mock data - in production this would fetch from actual PCSO API/website
    const mockResults: LotteryResultData[] = generateMockHistoricalData(gameType, startDate, endDate)
    
    // Validate scraped data
    const validatedResults: LotteryResultData[] = []
    const errors: string[] = []

    mockResults.forEach(result => {
      const validation = validateLotteryResult(result)
      if (validation.isValid) {
        validatedResults.push(cleanLotteryResult(result))
      } else {
        errors.push(`Invalid result for ${result.drawDate}: ${validation.errors.join(', ')}`)
      }
    })

    return {
      success: true,
      data: validatedResults,
      errors,
      source: 'PCSO Official Website (Mock)',
      scrapedAt: new Date()
    }
  } catch (error) {
    return {
      success: false,
      data: [],
      errors: [`Scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      source: 'PCSO Official Website (Mock)',
      scrapedAt: new Date()
    }
  }
}

/**
 * Generates mock historical data for testing
 * In production, replace this with actual web scraping logic
 */
function generateMockHistoricalData(
  gameType: string,
  startDate: Date,
  endDate: Date
): LotteryResultData[] {
  const results: LotteryResultData[] = []
  const gameConfig = getGameConfig(gameType)
  
  if (!gameConfig) return results

  const current = new Date(startDate)
  while (current <= endDate) {
    // Check if current date is a draw day for this game
    if (isDrawDay(current, gameType)) {
      const numbers = generateRandomNumbers(gameConfig.numberCount, gameConfig.maxNumber)
      const jackpot = generateRandomJackpot(gameType)
      
      results.push({
        gameName: gameType,
        drawDate: new Date(current),
        numbers,
        jackpot
      })
    }
    
    current.setDate(current.getDate() + 1)
  }

  return results
}

/**
 * Game configuration helper
 */
function getGameConfig(gameType: string) {
  const configs: Record<string, { numberCount: number; maxNumber: number; drawDays: string[] }> = {
    '6/42': { numberCount: 6, maxNumber: 42, drawDays: ['Tuesday', 'Thursday', 'Saturday'] },
    '6/45': { numberCount: 6, maxNumber: 45, drawDays: ['Monday', 'Wednesday', 'Friday'] },
    '6/49': { numberCount: 6, maxNumber: 49, drawDays: ['Tuesday', 'Thursday', 'Sunday'] },
    '6/55': { numberCount: 6, maxNumber: 55, drawDays: ['Monday', 'Wednesday', 'Saturday'] },
    '6/58': { numberCount: 6, maxNumber: 58, drawDays: ['Tuesday', 'Friday', 'Sunday'] }
  }
  return configs[gameType]
}

/**
 * Check if a date is a draw day for the given game
 */
function isDrawDay(date: Date, gameType: string): boolean {
  const gameConfig = getGameConfig(gameType)
  if (!gameConfig) return false

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const dayName = dayNames[date.getDay()]
  
  return gameConfig.drawDays.includes(dayName)
}

/**
 * Generate random lottery numbers (for mock data)
 */
function generateRandomNumbers(count: number, maxNumber: number): number[] {
  const numbers = new Set<number>()
  
  while (numbers.size < count) {
    const num = Math.floor(Math.random() * maxNumber) + 1
    numbers.add(num)
  }
  
  return Array.from(numbers).sort((a, b) => a - b)
}

/**
 * Generate random jackpot amount (for mock data)
 */
function generateRandomJackpot(gameType: string): number {
  const baseAmounts: Record<string, number> = {
    '6/42': 5000000,
    '6/45': 8000000,
    '6/49': 15000000,
    '6/55': 25000000,
    '6/58': 45000000
  }
  
  const base = baseAmounts[gameType] || 10000000
  const multiplier = 0.5 + Math.random() * 2 // 0.5x to 2.5x the base amount
  
  return Math.round(base * multiplier)
}

/**
 * Real scraper implementation would look like this:
 * 
 * export async function scrapePCSOWebsite(gameType: string): Promise<ScrapingResult> {
 *   const response = await fetch(`https://pcso.gov.ph/SearchLottoResult.aspx?lottery=${gameType}`)
 *   const html = await response.text()
 *   
 *   // Parse HTML using cheerio or similar
 *   const $ = cheerio.load(html)
 *   const results: LotteryResultData[] = []
 *   
 *   $('.result-row').each((i, element) => {
 *     const date = $(element).find('.date').text()
 *     const numbers = $(element).find('.numbers').text().split(',').map(n => parseInt(n.trim()))
 *     const jackpot = parseFloat($(element).find('.jackpot').text().replace(/[^\d.]/g, ''))
 *     
 *     results.push({ gameName: gameType, drawDate: new Date(date), numbers, jackpot })
 *   })
 *   
 *   return { success: true, data: results, errors: [], source: 'PCSO Website', scrapedAt: new Date() }
 * }
 */
