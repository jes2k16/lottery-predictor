export function numbersToString(nums: number[]): string {
  return nums.join(',')
}

export function parseNumbers(str: string | null | undefined): number[] {
  if (!str) return []
  return str.split(',').map(Number)
}
