export type SlopeType = 'flat' | 'low' | 'medium' | 'steep'

// Pitch-to-area multipliers (industry standard)
export const SLOPE_FACTORS: Record<SlopeType, number> = {
  flat:   1.00, // 0–2/12
  low:    1.10, // 3–5/12
  medium: 1.20, // 6–8/12 (most common)
  steep:  1.35, // 9/12+
}

export interface EstimateInput {
  homeSqft: number
  pricePerSquare: number
  wasteFactor: number
  tearOffCost: number
  slope?: SlopeType
}

export interface EstimateResult {
  squares: number
  estimateLow: number
  estimateHigh: number
}

function roundToNearest100(value: number): number {
  return Math.round(value / 100) * 100
}

export function calculateEstimate(input: EstimateInput): EstimateResult {
  const { homeSqft, pricePerSquare, wasteFactor, tearOffCost, slope = 'medium' } = input

  const slopeFactor = SLOPE_FACTORS[slope]
  const squares = (homeSqft * slopeFactor) / 100
  const base = squares * pricePerSquare * wasteFactor
  const total = base + tearOffCost

  const estimateLow = roundToNearest100(total * 0.9)
  const estimateHigh = roundToNearest100(total * 1.1)

  return {
    squares: Math.round(squares * 10) / 10,
    estimateLow,
    estimateHigh,
  }
}
