import { getOpenAI } from './openai'

const MATERIAL_LABELS: Record<string, string> = {
  asphalt: 'asphalt shingles',
  metal: 'metal roofing',
  tile: 'tile roofing',
  flat: 'flat / TPO roofing',
}

export interface LeadEmailInput {
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
  brief: string
}

export async function generateLeadDrafts(input: LeadEmailInput): Promise<LeadDrafts> {
  const {
    companyName,
    leadName,
    address,
    insuranceClaim,
    materialType,
    roofSquares,
    estimateLow,
    estimateHigh,
  } = input

  const sqft = Math.round(roofSquares * 100)
  const material = MATERIAL_LABELS[materialType] ?? materialType
  const insuranceNote =
    insuranceClaim === 'yes' ? 'filing or planning to file an insurance claim (storm/hail damage)' :
    insuranceClaim === 'unsure' ? 'unsure whether to file an insurance claim' :
    'paying out of pocket (no insurance claim)'

  const prompt = `You are writing outreach content for ${companyName}, a roofing contractor.

Lead details:
- Name: ${leadName}
- Address: ${address}
- Material: ${material}
- Roof size: ~${sqft} sq ft (${roofSquares} squares)
- Estimate range: $${estimateLow.toLocaleString()} – $${estimateHigh.toLocaleString()}
- Insurance: ${insuranceNote}

Produce THREE sections separated by the exact delimiters shown:

PART 1 — Lead intelligence brief (3 bullet points, shown to the contractor as an AI summary):
- Bullet 1: Who this person is and what they need (1 sentence, specific)
- Bullet 2: Job value context and lead quality signal (1 sentence)
- Bullet 3: Recommended action with timing context (1 sentence, actionable)
- Format each bullet starting with "• "
- Do NOT use markdown bold or headers

---SMS---

PART 2 — Follow-up email:
- First line must be "Subject: " followed by the subject
- Blank line, then the body
- 3–4 short paragraphs, no bullet lists
- Acknowledge their situation and project type, mention the estimate range as a starting point, end with a clear CTA to reply or call to schedule a free inspection
- Tone: straight-talking, helpful local contractor — not salesy
- Do not invent phone numbers or URLs
- Sign off as the team at ${companyName}

---SMS---

PART 3 — SMS follow-up text:
- Max 160 characters
- Friendly, direct, mentions their name and ${companyName}
- Single sentence or two short ones, ends with a CTA
- No links, no placeholders`

  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 800,
    temperature: 0.7,
  })

  const raw = response.choices[0]?.message?.content?.trim() ?? ''
  const parts = raw.split('---SMS---')

  return {
    brief: parts[0]?.trim() ?? '',
    email: parts[1]?.trim() ?? '',
    sms: parts[2]?.trim() ?? '',
  }
}
