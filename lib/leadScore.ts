export interface QualificationData {
  isHomeowner: string   // 'yes' | 'no' | 'renter'
  projectType: string   // 'replacement' | 'repair'
  urgency: string       // 'emergency' | 'soon' | 'browsing'
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

  // Homeowner status (0–3 pts)
  if (q.isHomeowner === 'yes') score += 3
  else if (q.isHomeowner === 'no') score += 1
  // renter = 0

  // Project type (0–3 pts)
  if (q.projectType === 'replacement') score += 3
  else if (q.projectType === 'repair') score += 1

  // Urgency (1–4 pts)
  if (q.urgency === 'emergency') score += 4
  else if (q.urgency === 'soon') score += 2
  else if (q.urgency === 'browsing') score += 1

  // Out of area — hard cap at 4, regardless of qualification
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
