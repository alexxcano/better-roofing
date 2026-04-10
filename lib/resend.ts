import { Resend } from 'resend'
import type { Lead } from '@prisma/client'
import { logger } from '@/lib/logger'

export type TrialReminderType = '3d' | 'expiry'

const resend = new Resend(process.env.RESEND_API_KEY)

const MATERIAL_LABELS: Record<string, string> = {
  asphalt: 'Asphalt Shingles',
  metal: 'Metal Roofing',
  tile: 'Tile Roofing',
  flat: 'Flat / TPO',
}

const INSURANCE_LABELS: Record<string, string> = {
  yes: '🌩️ Insurance claim',
  no: '💰 Out of pocket',
  unsure: '🤷 Not sure yet',
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
    const score = lead.leadScore
    const tier = score >= 8 ? 'hot' : score >= 5 ? 'warm' : score >= 3 ? 'cool' : 'cold'
    const label = score >= 8 ? 'Hot' : score >= 5 ? 'Warm' : score >= 3 ? 'Cool' : 'Cold'
    const emoji = score >= 8 ? '🔥' : score >= 5 ? '⚡' : score >= 3 ? '👍' : '🧊'
    const tierColor = TIER_COLORS[tier]

    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    const dashboardUrl = `${appUrl}/dashboard/leads`
    const insuranceLabel = INSURANCE_LABELS[lead.insuranceClaim] ?? lead.insuranceClaim
    const materialLabel = MATERIAL_LABELS[lead.materialType] ?? lead.materialType
    const estimateRange = `$${lead.estimateLow.toLocaleString()} – $${lead.estimateHigh.toLocaleString()}`

    await resend.emails.send({
      from: 'BetterRoofing <notifications@betterroofing.co>',
      to: toEmail,
      subject: `${emoji} New ${label} lead: ${lead.name} · Score ${score}/10`,
      text: [
        `NEW ROOFING LEAD — ${companyName}`,
        `Score: ${score}/10 (${label})`,
        ``,
        `CONTACT`,
        `Name:    ${lead.name}`,
        `Email:   ${lead.email}`,
        `Phone:   ${lead.phone ?? 'Not provided'}`,
        `Address: ${lead.address}`,
        ``,
        `QUALIFICATION`,
        `Insurance: ${insuranceLabel}`,
        lead.outOfArea ? `Service Area: OUTSIDE your service radius` : '',
        ``,
        `ESTIMATE`,
        `Material:     ${materialLabel}`,
        `Roof squares: ${lead.roofSquares.toFixed(1)}`,
        `Range:        ${estimateRange}`,
        ``,
        `View in dashboard: ${dashboardUrl}`,
        ``,
        `BetterRoofing — Manage notifications: ${appUrl}/dashboard/settings`,
      ].filter(Boolean).join('\n'),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1c1917;">

          <!-- Header -->
          <div style="background: #1c1917; padding: 20px 24px; border-bottom: 4px solid #f97316;">
            <p style="color: #a8a29e; margin: 0 0 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;">BetterRoofing · New Lead</p>
            <p style="color: white; margin: 0; font-size: 18px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.03em;">${companyName}</p>
          </div>

          <!-- Score bar -->
          <div style="background: ${tierColor}; padding: 14px 24px; display: flex; align-items: center;">
            <table style="border-collapse: collapse; width: 100%;">
              <tr>
                <td style="vertical-align: middle;">
                  <table style="border-collapse: collapse;">
                    <tr>
                      <td style="width: 44px; height: 44px; background: rgba(0,0,0,0.25); text-align: center; vertical-align: middle; padding: 0;">
                        <span style="font-size: 22px; font-weight: 900; color: white; line-height: 1;">${score}</span>
                      </td>
                      <td style="padding-left: 12px; vertical-align: middle;">
                        <p style="margin: 0; font-size: 16px; font-weight: 900; color: white; text-transform: uppercase; letter-spacing: 0.04em;">${emoji} ${label} Lead</p>
                        <p style="margin: 2px 0 0; font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.75); text-transform: uppercase; letter-spacing: 0.06em;">Score ${score}/10</p>
                      </td>
                    </tr>
                  </table>
                </td>
                <td style="text-align: right; vertical-align: middle;">
                  <p style="margin: 0; font-size: 22px; font-weight: 900; color: white; line-height: 1;">${estimateRange}</p>
                  <p style="margin: 2px 0 0; font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 0.06em;">Estimate range</p>
                </td>
              </tr>
            </table>
          </div>

          <!-- Body -->
          <div style="background: white; border: 2px solid #e7e5e4; border-top: none; padding: 24px;">

            <!-- Contact -->
            <p style="margin: 0 0 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #78716c;">Contact</p>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr style="border-bottom: 1px solid #f5f5f4;">
                <td style="padding: 8px 0; color: #78716c; font-size: 13px; width: 130px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em;">Name</td>
                <td style="padding: 8px 0; font-weight: 700; color: #1c1917;">${lead.name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f5f5f4;">
                <td style="padding: 8px 0; color: #78716c; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em;">Email</td>
                <td style="padding: 8px 0;"><a href="mailto:${lead.email}" style="color: #f97316; font-weight: 600; text-decoration: none;">${lead.email}</a></td>
              </tr>
              <tr style="border-bottom: 1px solid #f5f5f4;">
                <td style="padding: 8px 0; color: #78716c; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em;">Phone</td>
                <td style="padding: 8px 0; color: #1c1917;">${lead.phone ?? 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #78716c; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em;">Address</td>
                <td style="padding: 8px 0; color: #1c1917;">${lead.address}</td>
              </tr>
            </table>

            <!-- Qualification -->
            <p style="margin: 0 0 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #78716c;">Qualification</p>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr style="border-bottom: 1px solid #f5f5f4;">
                <td style="padding: 8px 0; color: #78716c; font-size: 13px; width: 130px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em;">Insurance</td>
                <td style="padding: 8px 0; color: #1c1917; font-weight: 600;">${insuranceLabel}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f5f5f4;">
                <td style="padding: 8px 0; color: #78716c; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em;">Material</td>
                <td style="padding: 8px 0; color: #1c1917;">${materialLabel}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #78716c; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em;">Roof Squares</td>
                <td style="padding: 8px 0; color: #1c1917;">${lead.roofSquares.toFixed(1)} squares</td>
              </tr>
              ${lead.outOfArea ? `
              <tr>
                <td style="padding: 8px 0; color: #78716c; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em;">Service Area</td>
                <td style="padding: 8px 0; color: #ea580c; font-weight: 700;">Outside your radius</td>
              </tr>` : ''}
            </table>

            <a href="${dashboardUrl}"
               style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; font-weight: 700; font-size: 13px; display: inline-block; text-transform: uppercase; letter-spacing: 0.06em;">
              View Lead in Dashboard →
            </a>

          </div>

          <p style="text-align: center; color: #a8a29e; font-size: 11px; margin-top: 16px;">
            BetterRoofing · <a href="${appUrl}/dashboard/settings" style="color: #a8a29e;">Manage notification settings</a>
          </p>

        </div>
      `,
    })
  } catch (err) {
    await logger.error('resend.lead_notification', err, { meta: { toEmail, companyName } })
  }
}

export async function sendPasswordResetEmail({
  toEmail,
  resetUrl,
}: {
  toEmail: string
  resetUrl: string
}): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  await resend.emails.send({
    from: 'BetterRoofing <notifications@betterroofing.co>',
    to: toEmail,
    subject: 'Reset your BetterRoofing password',
    text: [
      'RESET YOUR PASSWORD',
      '',
      'We received a request to reset your password. Click the link below — it expires in 1 hour.',
      '',
      resetUrl,
      '',
      "If you didn't request this, you can safely ignore this email.",
      '',
      `BetterRoofing — ${appUrl}`,
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1c1917;">
        <div style="background: #1c1917; padding: 20px 24px; border-bottom: 4px solid #f97316;">
          <p style="color: #a8a29e; margin: 0 0 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;">BetterRoofing</p>
          <p style="color: white; margin: 0; font-size: 18px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.03em;">Reset Your Password</p>
        </div>
        <div style="background: white; border: 2px solid #e7e5e4; border-top: none; padding: 28px;">
          <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #44403c;">
            We received a request to reset your password. Click the button below — the link expires in <strong>1 hour</strong>.
          </p>
          <a href="${resetUrl}"
             style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 24px;">
            Reset Password →
          </a>
          <p style="margin: 0; font-size: 13px; color: #78716c; line-height: 1.5; border-top: 1px solid #f5f5f4; padding-top: 20px;">
            If you didn't request a password reset, you can safely ignore this email. Your password won't change.
          </p>
        </div>
        <p style="text-align: center; color: #a8a29e; font-size: 11px; margin-top: 16px;">
          BetterRoofing · <a href="${appUrl}" style="color: #a8a29e;">${appUrl}</a>
        </p>
      </div>
    `,
  })
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

    const plainReport = report.replace(/\*\*(.*?)\*\*/g, '$1')

    await resend.emails.send({
      from: 'BetterRoofing <reports@betterroofing.co>',
      to: toEmail,
      subject: `Your weekly lead report — week of ${weekStr}`,
      text: [
        `WEEKLY INTELLIGENCE REPORT — ${companyName}`,
        `Week of ${weekStr}`,
        ``,
        `New Leads: ${stats.newLeads}  |  Hot Leads: ${stats.hotLeads}  |  Avg Estimate: $${stats.avgEstimate.toLocaleString()}  |  Pipeline Value: $${stats.totalEstimateValue.toLocaleString()}`,
        ``,
        plainReport,
        ``,
        `Open your dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        ``,
        `BetterRoofing — Manage notifications: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
      ].join('\n'),
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
    await logger.error('resend.weekly_report', err, { meta: { toEmail, companyName } })
  }
}

export async function sendTrialReminder({
  toEmail,
  companyName,
  type,
  trialEndsAt,
  leadCount,
}: {
  toEmail: string
  companyName: string
  type: TrialReminderType
  trialEndsAt: Date
  leadCount: number
}): Promise<void> {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    const upgradeUrl = `${appUrl}/dashboard/billing`
    const expiryDate = trialEndsAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })

    const subject = type === '3d'
      ? `3 days left — your widget goes dark on ${expiryDate}`
      : `Last chance — your quote widget shuts off tonight`

    const ctaText = type === '3d' ? 'Keep My Widget Live' : "Don't Shut Off My Widget"

    const heroLine = leadCount > 0
      ? `Your widget pulled in <strong>${leadCount} lead${leadCount === 1 ? '' : 's'}</strong> during your trial. On ${expiryDate}, it goes dark.`
      : `On ${expiryDate}, your widget goes dark. Any homeowner who lands on your site after that gets nothing — and goes to the next guy.`

    const bodyLine = type === '3d'
      ? `You've got 3 days to decide. At $49/mo, one job you would have missed pays for the next two years. No setup fee. Cancel anytime.`
      : `This is the last day. After tonight, your widget stops accepting leads and your dashboard locks. Takes 2 minutes to subscribe and keep everything running.`

    await resend.emails.send({
      from: 'BetterRoofing <notifications@betterroofing.co>',
      to: toEmail,
      subject,
      text: [
        subject.toUpperCase(),
        ``,
        heroLine.replace(/<strong>(.*?)<\/strong>/g, '$1'),
        ``,
        bodyLine,
        ``,
        `Subscribe now: ${upgradeUrl}`,
        ``,
        `Your quote widget keeps running 24/7. Every lead comes in scored so you know who to call first. You get a plain-English brief on each homeowner and follow-up drafts ready to send. Every Monday you get a report on your pipeline.`,
        ``,
        `BetterRoofing — Manage notifications: ${appUrl}/dashboard/settings`,
      ].join('\n'),
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1c1917;">

          <div style="background: #1c1917; padding: 24px; border-bottom: 4px solid #f97316;">
            <p style="color: #a8a29e; margin: 0 0 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;">BetterRoofing · ${companyName}</p>
            <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 900; line-height: 1.3;">${subject}</h1>
          </div>

          <div style="background: white; border: 2px solid #e7e5e4; border-top: none; padding: 28px;">

            <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #1c1917;">${heroLine}</p>

            <p style="margin: 0 0 28px; line-height: 1.6; color: #44403c;">${bodyLine}</p>

            <a href="${upgradeUrl}"
               style="background: #f97316; color: white; padding: 14px 28px; border-radius: 4px; text-decoration: none; font-weight: 700; font-size: 15px; display: inline-block; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 28px;">
              ${ctaText} →
            </a>

            <div style="border-top: 2px solid #f5f5f4; padding-top: 20px;">
              <p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #78716c;">What stays on after you subscribe</p>
              <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #44403c;">
                Your quote widget keeps running 24/7. Every lead comes in scored so you know who to call first.
                You get a plain-English brief on each homeowner and follow-up drafts ready to send.
                Every Monday you get a report on your pipeline.
              </p>
            </div>

          </div>

          <p style="text-align: center; color: #a8a29e; font-size: 11px; margin-top: 16px;">
            BetterRoofing · <a href="${appUrl}/dashboard/settings" style="color: #a8a29e;">Manage notifications</a>
          </p>

        </div>
      `,
    })
  } catch (err) {
    await logger.error('resend.trial_reminder', err, { meta: { toEmail, companyName, type } })
  }
}
