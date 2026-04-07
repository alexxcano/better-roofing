import { getOpenAI } from './openai'

const MATERIAL_LABELS: Record<string, string> = {
  asphalt: 'asphalt shingles',
  metal: 'metal roofing',
  tile: 'tile roofing',
  flat: 'flat / TPO roofing',
}

export interface LeadInput {
  companyName: string
  leadName: string
  address: string
  insuranceClaim: string
  materialType: string
  roofSquares: number
  estimateLow: number
  estimateHigh: number
}

export interface LeadDrafts {
  email: string
  sms: string
}

function buildLeadContext(input: LeadInput) {
  const sqft = Math.round(input.roofSquares * 100)
  const material = MATERIAL_LABELS[input.materialType] ?? input.materialType
  const insuranceNote =
    input.insuranceClaim === 'yes'    ? 'filing or planning to file an insurance claim (storm/hail damage)' :
    input.insuranceClaim === 'unsure' ? 'unsure whether to file an insurance claim' :
                                        'paying out of pocket (no insurance claim)'
  return { sqft, material, insuranceNote }
}

export async function generateLeadBrief(input: LeadInput): Promise<string> {
  const { sqft, material, insuranceNote } = buildLeadContext(input)
  const { companyName, leadName, address, estimateLow, estimateHigh, roofSquares } = input

  const prompt = `You are a lead intelligence analyst for ${companyName}, a roofing contractor. Write a concise lead briefing for an incoming quote request.

Lead details:
- Name: ${leadName}
- Address: ${address}
- Material: ${material}
- Roof size: ~${sqft} sq ft (${roofSquares} squares)
- Estimate range: $${estimateLow.toLocaleString()} – $${estimateHigh.toLocaleString()}
- Insurance: ${insuranceNote}

Write exactly 4 bullet points. Each bullet is one tight sentence. No markdown, no headers.
Format each bullet starting with "• "

Bullet 1 — Situation: Who this homeowner is and exactly what they need. Be specific to the address, material, and insurance status.
Bullet 2 — Job value: What this job is worth in context. Reference the estimate range, roof size, and any premium signals (insurance, specialty material, slope).
Bullet 3 — Priority action: The single most important thing to do next, with a specific time window and the reason why that timing matters.
Bullet 4 — Opening line: Write the exact first sentence to use when calling or emailing this homeowner. Make it specific to their situation — not generic.`

  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 350,
    temperature: 0.6,
  })

  return response.choices[0]?.message?.content?.trim() ?? ''
}

export async function generateLeadDrafts(input: LeadInput): Promise<LeadDrafts> {
  const { sqft, material, insuranceNote } = buildLeadContext(input)
  const { companyName, leadName, address, estimateLow, estimateHigh, roofSquares } = input

  const prompt = `You are writing outreach content for ${companyName}, a roofing contractor.

Lead details:
- Name: ${leadName}
- Address: ${address}
- Material: ${material}
- Roof size: ~${sqft} sq ft (${roofSquares} squares)
- Estimate range: $${estimateLow.toLocaleString()} – $${estimateHigh.toLocaleString()}
- Insurance: ${insuranceNote}

Produce TWO sections separated by the exact delimiter shown:

PART 1 — Follow-up email:
- First line must be "Subject: " followed by the subject
- Blank line, then the body
- 3–4 short paragraphs, no bullet lists
- Acknowledge their situation and project type, mention the estimate range as a starting point, end with a clear CTA to reply or call to schedule a free inspection
- Tone: straight-talking, helpful local contractor, not salesy
- Do not invent phone numbers or URLs
- Sign off as the team at ${companyName}

---SMS---

PART 2 — SMS follow-up text:
- Max 160 characters
- Friendly, direct, mentions their name and ${companyName}
- Single sentence or two short ones, ends with a CTA
- No links, no placeholders`

  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 600,
    temperature: 0.7,
  })

  const raw = response.choices[0]?.message?.content?.trim() ?? ''
  const parts = raw.split('---SMS---')

  return {
    email: parts[0]?.trim() ?? '',
    sms:   parts[1]?.trim() ?? '',
  }
}
