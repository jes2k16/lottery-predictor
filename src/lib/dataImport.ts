/**
 * Data Import System for Historical Lottery Results
 * 
 * This module handles bulk import of historical lottery data
 * from various sources (CSV, JSON, scraped data, etc.)
 */

import { prisma } from './db'
import { LotteryResultData, validateLotteryResults } from '@/utils/validation'
import { scrapePCSOResults } from '@/utils/scraper'
import { LOTTERY_GAMES } from '@/utils/constants'

export interface ImportResult {
  success: boolean
  imported: number
  skipped: number
  errors: string[]
  details: {
    total: number
    valid: number
    invalid: number
    duplicates: number
  }
}

export interface ImportOptions {
  skipDuplicates: boolean
  validateData: boolean
  batchSize: number
}

const DEFAULT_OPTIONS: ImportOptions = {
  skipDuplicates: true,
  validateData: true,
  batchSize: 100
}

/**
 * Import lottery results from an array of data
 */
export async function importLotteryResults(
  results: LotteryResultData[],
  options: Partial<ImportOptions> = {}
): Promise<ImportResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const errors: string[] = []
  let imported = 0
  let skipped = 0

  try {
    console.log(`📊 Starting import of ${results.length} lottery results...`)

    // Validate data if requested
    let validResults = results
    if (opts.validateData) {
      const validation = validateLotteryResults(results)
      validResults = validation.validResults
      
      if (validation.invalidResults.length > 0) {
        errors.push(`${validation.invalidResults.length} invalid results found`)
        console.log(`⚠️ Validation warnings: ${validation.summary.warnings}`)
      }
    }

    // Process in batches
    for (let i = 0; i < validResults.length; i += opts.batchSize) {
      const batch = validResults.slice(i, i + opts.batchSize)
      const batchResult = await processBatch(batch, opts)
      
      imported += batchResult.imported
      skipped += batchResult.skipped
      errors.push(...batchResult.errors)
      
      console.log(`📈 Processed batch ${Math.floor(i / opts.batchSize) + 1}: ${batchResult.imported} imported, ${batchResult.skipped} skipped`)
    }

    console.log(`✅ Import completed: ${imported} imported, ${skipped} skipped`)

    return {
      success: errors.length === 0,
      imported,
      skipped,
      errors,
      details: {
        total: results.length,
        valid: validResults.length,
        invalid: results.length - validResults.length,
        duplicates: skipped
      }
    }
  } catch (error) {
    const errorMsg = `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    console.error(`❌ ${errorMsg}`)
    
    return {
      success: false,
      imported,
      skipped,
      errors: [errorMsg, ...errors],
      details: {
        total: results.length,
        valid: 0,
        invalid: results.length,
        duplicates: 0
      }
    }
  }
}

/**
 * Process a batch of lottery results
 */
async function processBatch(
  batch: LotteryResultData[],
  options: ImportOptions
): Promise<{ imported: number; skipped: number; errors: string[] }> {
  let imported = 0
  let skipped = 0
  const errors: string[] = []

  for (const result of batch) {
    try {
      // Find the game
      const game = await prisma.lotteryGame.findUnique({
        where: { name: result.gameName }
      })

      if (!game) {
        errors.push(`Game not found: ${result.gameName}`)
        continue
      }

      const drawDate = new Date(result.drawDate)

      // Check for existing result
      if (options.skipDuplicates) {
        const existing = await prisma.lotteryResult.findUnique({
          where: {
            gameId_drawDate: {
              gameId: game.id,
              drawDate: drawDate
            }
          }
        })

        if (existing) {
          skipped++
          continue
        }
      }

      // Create the result
      await prisma.lotteryResult.create({
        data: {
          gameId: game.id,
          drawDate: drawDate,
          numbers: result.numbers,
          jackpot: result.jackpot || null
        }
      })

      imported++
    } catch (error) {
      errors.push(`Failed to import result for ${result.gameName} on ${result.drawDate}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return { imported, skipped, errors }
}

/**
 * Import historical data by scraping PCSO website
 */
export async function importHistoricalData(
  gameType: string,
  startDate: Date,
  endDate: Date
): Promise<ImportResult> {
  console.log(`🔍 Scraping historical data for ${gameType} from ${startDate.toDateString()} to ${endDate.toDateString()}`)

  try {
    const scrapingResult = await scrapePCSOResults(gameType, startDate, endDate)
    
    if (!scrapingResult.success) {
      return {
        success: false,
        imported: 0,
        skipped: 0,
        errors: scrapingResult.errors,
        details: { total: 0, valid: 0, invalid: 0, duplicates: 0 }
      }
    }

    return await importLotteryResults(scrapingResult.data)
  } catch (error) {
    return {
      success: false,
      imported: 0,
      skipped: 0,
      errors: [`Scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      details: { total: 0, valid: 0, invalid: 0, duplicates: 0 }
    }
  }
}

/**
 * Import all historical data for all games
 */
export async function importAllHistoricalData(
  startDate: Date = new Date('2000-01-01'),
  endDate: Date = new Date()
): Promise<{ [gameType: string]: ImportResult }> {
  const results: { [gameType: string]: ImportResult } = {}

  console.log(`🚀 Starting comprehensive historical data import from ${startDate.toDateString()} to ${endDate.toDateString()}`)

  for (const gameType of Object.keys(LOTTERY_GAMES)) {
    console.log(`\n📊 Processing ${gameType}...`)
    results[gameType] = await importHistoricalData(gameType, startDate, endDate)
    
    // Add delay between games to be respectful to the server
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  // Summary
  const totalImported = Object.values(results).reduce((sum, result) => sum + result.imported, 0)
  const totalSkipped = Object.values(results).reduce((sum, result) => sum + result.skipped, 0)
  const totalErrors = Object.values(results).reduce((sum, result) => sum + result.errors.length, 0)

  console.log(`\n🎯 Import Summary:`)
  console.log(`   Total Imported: ${totalImported}`)
  console.log(`   Total Skipped: ${totalSkipped}`)
  console.log(`   Total Errors: ${totalErrors}`)

  return results
}

/**
 * Import from CSV file
 */
export async function importFromCSV(csvContent: string): Promise<ImportResult> {
  try {
    const lines = csvContent.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.trim())
    
    // Expected headers: gameName, drawDate, numbers, jackpot
    const expectedHeaders = ['gameName', 'drawDate', 'numbers', 'jackpot']
    const headerMap = expectedHeaders.reduce((map, header, index) => {
      const headerIndex = headers.findIndex(h => h.toLowerCase().includes(header.toLowerCase()))
      if (headerIndex !== -1) map[header] = headerIndex
      return map
    }, {} as Record<string, number>)

    const results: LotteryResultData[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      
      if (values.length < headers.length) continue

      try {
        const numbers = values[headerMap.numbers]
          .replace(/[\[\]"]/g, '')
          .split(';')
          .map(n => parseInt(n.trim()))
          .filter(n => !isNaN(n))

        const result: LotteryResultData = {
          gameName: values[headerMap.gameName].replace(/"/g, ''),
          drawDate: new Date(values[headerMap.drawDate].replace(/"/g, '')),
          numbers,
          jackpot: headerMap.jackpot !== undefined ? parseFloat(values[headerMap.jackpot]) : undefined
        }

        results.push(result)
      } catch (error) {
        console.warn(`⚠️ Skipping invalid row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return await importLotteryResults(results)
  } catch (error) {
    return {
      success: false,
      imported: 0,
      skipped: 0,
      errors: [`CSV parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      details: { total: 0, valid: 0, invalid: 0, duplicates: 0 }
    }
  }
}
