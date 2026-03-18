import { Resend } from 'resend'
import type { Lead } from '@prisma/client'
import { calculateLeadScore } from '@/lib/leadScore'

const resend = new Resend(process.env.RESEND_API_KEY)

const MATERIAL_LABELS: Record<string, string> = {
  asphalt: 'Asphalt Shingles',
  metal: 'Metal Roofing',
  tile: 'Tile Roofing',
}

const URGENCY_LABELS: Record<string, string> = {
  emergency: '🚨 Emergency — ASAP',
  soon: '📅 Within 3 months',
  browsing: '🔍 Just getting prices',
}

const PROJECT_LABELS: Record<string, string> = {
  replacement: 'Full replacement',
  repair: 'Repair only',
}

const HOMEOWNER_LABELS: Record<string, string> = {
  yes: 'Homeowner',
  no: 'Represents owner',
  renter: 'Renter',
}

const TIER_COLORS: Record<string, string> = {
  hot: '#dc2626',
  warm: '#ea580c',
  cool: '#2563eb',
  cold: '#64748b',
}

export async function sendLeadNotification({
  lead,
  toEmail,
  companyName,
}: {
  lead: Lead
  toEmail: string
  companyName: string
}): Promise<void> {
  try {
    const { score, tier, label, emoji } = calculateLeadScore({
      isHomeowner: lead.isHomeowner,
      projectType: lead.projectType,
      urgency: lead.urgency,
    })
    const tierColor = TIER_COLORS[tier]

    await resend.emails.send({
      from: 'BetterRoofing <notifications@betterroofing.co>',
      to: toEmail,
      subject: `${emoji} ${label} lead: ${lead.name} (score ${score}/10) — ${companyName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #f97316; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">New Roofing Lead</h1>
            <p style="color: #fed7aa; margin: 4px 0 0;">${companyName}</p>
          </div>

          <div style="background: white; border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">

            <!-- Lead score badge -->
            <div style="margin-bottom: 20px;">
              <span style="background: ${tierColor}1a; color: ${tierColor}; border: 1px solid ${tierColor}40; padding: 6px 14px; border-radius: 9999px; font-weight: 700; font-size: 15px;">
                ${emoji} ${label} Lead · ${score}/10
              </span>
            </div>

            <h2 style="font-size: 18px; color: #0f172a; margin: 0 0 12px;">Contact</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr><td style="padding: 6px 0; color: #64748b; width: 140px;">Name</td><td style="padding: 6px 0; font-weight: 600;">${lead.name}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Email</td><td style="padding: 6px 0;"><a href="mailto:${lead.email}" style="color: #f97316;">${lead.email}</a></td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Phone</td><td style="padding: 6px 0;">${lead.phone || '—'}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Address</td><td style="padding: 6px 0;">${lead.address}</td></tr>
            </table>

            <h2 style="font-size: 18px; color: #0f172a; margin: 0 0 12px;">Qualification</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr><td style="padding: 6px 0; color: #64748b; width: 140px;">Homeowner?</td><td style="padding: 6px 0;">${HOMEOWNER_LABELS[lead.isHomeowner] ?? lead.isHomeowner}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Project</td><td style="padding: 6px 0;">${PROJECT_LABELS[lead.projectType] ?? lead.projectType}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Urgency</td><td style="padding: 6px 0;">${URGENCY_LABELS[lead.urgency] ?? lead.urgency}</td></tr>
            </table>

            <h2 style="font-size: 18px; color: #0f172a; margin: 0 0 12px;">Estimate</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr><td style="padding: 6px 0; color: #64748b; width: 140px;">Material</td><td style="padding: 6px 0;">${MATERIAL_LABELS[lead.materialType] ?? lead.materialType}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Roof Squares</td><td style="padding: 6px 0;">${lead.roofSquares.toFixed(1)}</td></tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Range</td>
                <td style="padding: 6px 0;">
                  <span style="background: #dcfce7; color: #166534; font-weight: 700; padding: 4px 10px; border-radius: 9999px;">
                    $${lead.estimateLow.toLocaleString()} – $${lead.estimateHigh.toLocaleString()}
                  </span>
                </td>
              </tr>
            </table>

            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/leads"
               style="background: #f97316; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
              View in Dashboard →
            </a>
          </div>

          <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 16px;">
            Powered by BetterRoofing · <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings" style="color: #94a3b8;">Manage notification settings</a>
          </p>
        </div>
      `,
    })
  } catch (err) {
    console.error('[Resend] Failed to send lead notification:', err)
  }
}

export async function sendWeeklyReport({
  toEmail,
  companyName,
  weekOf,
  report,
  stats,
}: {
  toEmail: string
  companyName: string
  weekOf: Date
  report: string
  stats: {
    newLeads: number
    hotLeads: number
    avgEstimate: number
    totalEstimateValue: number
  }
}): Promise<void> {
  try {
    const weekStr = weekOf.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

    // Convert **bold** markers to <strong> tags for email
    const reportHtml = report
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .split('\n')
      .map((line) => `<p style="margin: 0 0 12px; line-height: 1.6;">${line}</p>`)
      .join('')

    await resend.emails.send({
      from: 'BetterRoofing <reports@betterroofing.co>',
      to: toEmail,
      subject: `📊 Your weekly lead report — week of ${weekStr}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1c1917;">

          <div style="background: #1c1917; padding: 24px; border-bottom: 4px solid #f97316;">
            <h1 style="color: white; margin: 0 0 4px; font-size: 22px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em;">
              Weekly Intelligence Report
            </h1>
            <p style="color: #a8a29e; margin: 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
              ${companyName} · Week of ${weekStr}
            </p>
          </div>

          <!-- Quick stats -->
          <div style="display: flex; border-bottom: 2px solid #e7e5e4;">
            ${[
              { label: 'New Leads', value: stats.newLeads },
              { label: 'Hot Leads', value: stats.hotLeads },
              { label: 'Avg Estimate', value: `$${stats.avgEstimate.toLocaleString()}` },
              { label: 'Pipeline Value', value: `$${stats.totalEstimateValue.toLocaleString()}` },
            ].map((s) => `
              <div style="flex: 1; padding: 16px; border-right: 1px solid #e7e5e4; text-align: center;">
                <p style="margin: 0; font-size: 24px; font-weight: 900; color: #f97316;">${s.value}</p>
                <p style="margin: 4px 0 0; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #78716c;">${s.label}</p>
              </div>
            `).join('')}
          </div>

          <!-- AI report -->
          <div style="padding: 24px; background: white; border: 2px solid #e7e5e4; border-top: none;">
            ${reportHtml}
          </div>

          <div style="padding: 16px; text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
               style="background: #f97316; color: white; padding: 12px 28px; text-decoration: none; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block;">
              Open Dashboard →
            </a>
          </div>

          <p style="text-align: center; color: #a8a29e; font-size: 11px; margin-top: 8px;">
            Powered by BetterRoofing ·
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings" style="color: #a8a29e;">Manage notifications</a>
          </p>
        </div>
      `,
    })
  } catch (err) {
    console.error('[Resend] Failed to send weekly report:', err)
  }
}
