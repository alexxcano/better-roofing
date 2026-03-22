import { getOpenAI } from './openai'

interface LeadStats {
  // This week
  newLeads: number
  hotLeads: number       // score >= 8
  insuranceLeads: number // insuranceClaim === 'yes'
  outOfAreaLeads: number
  avgEstimate: number
  totalEstimateValue: number
  topCities: { city: string; count: number }[]
  materialBreakdown: { material: string; count: number }[]
  // All time
  totalLeads: number
  allTimeAvgScore: number
}

export async function generateWeeklyReport(
  companyName: string,
  stats: LeadStats,
  weekOf: Date
): Promise<string> {
  const weekStr = weekOf.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const topCitiesStr = stats.topCities.length
    ? stats.topCities.map((c) => `${c.city} (${c.count})`).join(', ')
    : 'No location data'
  const materialsStr = stats.materialBreakdown.length
    ? stats.materialBreakdown.map((m) => `${m.material}: ${m.count}`).join(', ')
    : 'None'

  const prompt = `You are a business analyst writing a weekly lead intelligence report for ${companyName}, a roofing contractor.

Week of ${weekStr}:
- New leads this week: ${stats.newLeads}
- Hot leads (score ≥8/10): ${stats.hotLeads}
- Insurance claim leads: ${stats.insuranceLeads}
- Out-of-area leads: ${stats.outOfAreaLeads}
- Avg estimate this week: $${stats.avgEstimate.toLocaleString()}
- Total pipeline value: $${stats.totalEstimateValue.toLocaleString()}
- Top areas: ${topCitiesStr}
- Materials: ${materialsStr}

All-time:
- Total leads: ${stats.totalLeads}
- Avg lead score: ${stats.allTimeAvgScore}/10

Write a brief weekly intelligence report. Structure it with these exact section headers:
**This Week at a Glance**
**What's Hot**
**Opportunities**
**Recommendation**

Rules:
- Each section is 2–3 sentences max
- Speak directly to the contractor — "you", "your leads", not "the contractor"
- Be specific to the numbers above — no generic advice
- "What's Hot" should call out the most promising signals from this week's data
- "Opportunities" should identify something actionable they might be missing
- "Recommendation" is one concrete action they should take this week
- Tone: direct, like a trusted advisor, not corporate fluff
- Do not make up data not provided above`

  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 400,
    temperature: 0.6,
  })

  return response.choices[0]?.message?.content?.trim() ?? ''
}
