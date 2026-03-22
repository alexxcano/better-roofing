export interface QualificationData {
  insuranceClaim: string  // 'yes' | 'no' | 'unsure'
  materialType: string    // 'asphalt' | 'metal' | 'tile' | 'flat'
  estimateHigh: number
  outOfArea?: boolean
}

export interface LeadScoreResult {
  score: number         // 1–10
  tier: 'hot' | 'warm' | 'cool' | 'cold'
  label: string
  emoji: string
}

export function calculateLeadScore(q: QualificationData): LeadScoreResult {
  let score = 0

  // Insurance claim (0–3 pts) — strongest signal for TX roofing contractors
  if (q.insuranceClaim === 'yes') score += 3
  else if (q.insuranceClaim === 'unsure') score += 1

  // Material type — metal/tile = high-value specialty job (1–2 pts)
  if (q.materialType === 'metal' || q.materialType === 'tile') score += 2
  else score += 1

  // Job value from estimate (1–4 pts)
  if (q.estimateHigh >= 20000) score += 4
  else if (q.estimateHigh >= 15000) score += 3
  else if (q.estimateHigh >= 10000) score += 2
  else score += 1

  // Out of area — hard cap at 4
  if (q.outOfArea) score = Math.min(score, 4)

  // Clamp to 1–10
  score = Math.max(1, Math.min(10, score))

  let tier: LeadScoreResult['tier']
  let label: string
  let emoji: string

  if (score >= 8) {
    tier = 'hot'; label = 'Hot'; emoji = '🔥'
  } else if (score >= 5) {
    tier = 'warm'; label = 'Warm'; emoji = '⚡'
  } else if (score >= 3) {
    tier = 'cool'; label = 'Cool'; emoji = '👍'
  } else {
    tier = 'cold'; label = 'Cold'; emoji = '🧊'
  }

  return { score, tier, label, emoji }
}
