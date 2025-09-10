/**
 * Demo Import Script
 * 
 * This script demonstrates the data import functionality
 * without requiring a database connection.
 * 
 * Run with: node scripts/demo-import.js
 */

// Simple validation function for demo
function validateLotteryResult(data) {
  const errors = []
  const warnings = []

  const gameConfigs = {
    '6/42': { numberCount: 6, maxNumber: 42 },
    '6/45': { numberCount: 6, maxNumber: 45 },
    '6/49': { numberCount: 6, maxNumber: 49 },
    '6/55': { numberCount: 6, maxNumber: 55 },
    '6/58': { numberCount: 6, maxNumber: 58 }
  }

  const gameConfig = gameConfigs[data.gameName]
  if (!gameConfig) {
    errors.push(`Invalid game name: ${data.gameName}`)
    return { isValid: false, errors, warnings }
  }

  if (data.numbers.length !== gameConfig.numberCount) {
    errors.push(`Expected ${gameConfig.numberCount} numbers, got ${data.numbers.length}`)
  }

  data.numbers.forEach((num, index) => {
    if (num < 1 || num > gameConfig.maxNumber) {
      errors.push(`Number ${num} at index ${index} is out of range (1-${gameConfig.maxNumber})`)
    }
  })

  const uniqueNumbers = new Set(data.numbers)
  if (uniqueNumbers.size !== data.numbers.length) {
    errors.push('Duplicate numbers found')
  }

  return { isValid: errors.length === 0, errors, warnings }
}

function validateLotteryResults(results) {
  const validResults = []
  const invalidResults = []

  results.forEach(result => {
    const validation = validateLotteryResult(result)
    if (validation.isValid) {
      validResults.push(result)
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
      warnings: 0
    }
  }
}

// Sample lottery data for testing
const sampleData = [
  {
    gameName: '6/42',
    drawDate: '2025-09-01',
    numbers: [5, 12, 23, 31, 38, 42],
    jackpot: 5500000
  },
  {
    gameName: '6/45',
    drawDate: '2025-09-01',
    numbers: [3, 15, 22, 28, 36, 44],
    jackpot: 8200000
  },
  {
    gameName: '6/49',
    drawDate: '2025-09-01',
    numbers: [7, 14, 21, 29, 35, 47],
    jackpot: 12300000
  },
  {
    gameName: '6/55',
    drawDate: '2025-09-01',
    numbers: [9, 18, 27, 34, 41, 52],
    jackpot: 28500000
  },
  {
    gameName: '6/58',
    drawDate: '2025-09-01',
    numbers: [11, 19, 26, 33, 45, 56],
    jackpot: 48000000
  },
  // Invalid data for testing validation
  {
    gameName: '6/42',
    drawDate: '2025-09-02',
    numbers: [1, 2, 3, 4, 5], // Too few numbers
    jackpot: 6000000
  },
  {
    gameName: '6/45',
    drawDate: '2025-09-02', 
    numbers: [1, 15, 22, 28, 50, 44], // Number 50 out of range for 6/45
    jackpot: 8500000
  }
]

console.log('🎯 Philippine Lottery Predictor - Demo Import Script')
console.log('================================================\n')

console.log('📊 Sample Data:')
sampleData.forEach((result, index) => {
  console.log(`${index + 1}. ${result.gameName} - ${result.drawDate} - [${result.numbers.join(', ')}] - ₱${result.jackpot?.toLocaleString()}`)
})

console.log('\n🔍 Validating Data...')
const validation = validateLotteryResults(sampleData)

console.log('\n📈 Validation Results:')
console.log(`✅ Valid Results: ${validation.summary.valid}`)
console.log(`❌ Invalid Results: ${validation.summary.invalid}`)
console.log(`⚠️  Warnings: ${validation.summary.warnings}`)

if (validation.invalidResults.length > 0) {
  console.log('\n❌ Invalid Results Found:')
  validation.invalidResults.forEach((invalid, index) => {
    console.log(`${index + 1}. ${invalid.data.gameName} - ${invalid.data.drawDate}`)
    console.log(`   Errors: ${invalid.validation.errors.join(', ')}`)
  })
}

console.log('\n🔍 Checking for Duplicates...')
const duplicates = []
const seen = new Map()
sampleData.forEach(result => {
  const key = `${result.gameName}-${result.drawDate}`
  if (seen.has(key)) {
    duplicates.push([seen.get(key), result])
  } else {
    seen.set(key, result)
  }
})

if (duplicates.length > 0) {
  console.log(`Found ${duplicates.length} duplicate groups`)
  duplicates.forEach((group, index) => {
    console.log(`Duplicate Group ${index + 1}:`)
    group.forEach(result => {
      console.log(`  - ${result.gameName} on ${result.drawDate}`)
    })
  })
} else {
  console.log('✅ No duplicates found')
}

console.log('\n✅ Valid Data Ready for Import:')
validation.validResults.forEach((result, index) => {
  console.log(`${index + 1}. ${result.gameName} - ${result.drawDate} - [${result.numbers.join(', ')}]`)
})

console.log('\n🚀 Demo Complete!')
console.log('\nTo test with a real database:')
console.log('1. Set up PostgreSQL database')
console.log('2. Configure DATABASE_URL in .env')
console.log('3. Run: npx prisma migrate dev --name init')
console.log('4. Run: npm run db:seed')
console.log('5. Test API: curl http://localhost:3000/api/stats')

module.exports = { sampleData, validation }
