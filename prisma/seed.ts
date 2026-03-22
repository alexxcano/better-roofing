import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clean up any existing seed data
  await prisma.lead.deleteMany({ where: { contractor: { companyName: 'Demo Roofing Co.' } } })
  await prisma.weeklyReport.deleteMany({ where: { contractor: { companyName: 'Demo Roofing Co.' } } })
  await prisma.subscription.deleteMany({ where: { contractor: { companyName: 'Demo Roofing Co.' } } })
  await prisma.pricingSettings.deleteMany({ where: { contractor: { companyName: 'Demo Roofing Co.' } } })
  await prisma.contractor.deleteMany({ where: { companyName: 'Demo Roofing Co.' } })
  await prisma.user.deleteMany({ where: { email: 'demo@betterroofing.co' } })

  // Create contractor + user
  const contractor = await prisma.contractor.create({
    data: {
      companyName: 'Demo Roofing Co.',
      website: 'https://demoroofing.com',
      phone: '512-555-0100',
      notificationEmail: 'demo@betterroofing.co',
      bookingUrl: 'https://calendly.com/demo',
      outOfAreaBehavior: 'FLAG',
    },
  })

  const hashedPassword = await bcrypt.hash('demo1234', 10)
  await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'demo@betterroofing.co',
      password: hashedPassword,
      role: 'CONTRACTOR',
      contractorId: contractor.id,
    },
  })

  // Active Pro subscription
  await prisma.subscription.create({
    data: {
      contractorId: contractor.id,
      plan: 'PRO',
      status: 'trialing',
      currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  })

  // Pricing settings
  await prisma.pricingSettings.create({
    data: {
      contractorId: contractor.id,
      pricePerSquareAsphalt: 425,
      pricePerSquareMetal: 750,
      pricePerSquareTile: 650,
      pricePerSquareFlat: 500,
      wasteFactor: 1.12,
      tearOffCost: 1000,
      offersAsphalt: true,
      offersMetal: true,
      offersTile: true,
      offersFlat: false,
    },
  })

  // Dummy leads — varied scores, materials, insurance status, and dates
  const leads = [
    {
      name: 'Sarah Mitchell',
      email: 'sarah.mitchell@gmail.com',
      phone: '512-555-0191',
      address: '4821 Shoal Creek Blvd, Austin, TX 78756',
      lat: 30.3318, lng: -97.7341,
      insuranceClaim: 'yes',
      materialType: 'asphalt', roofSlope: 'medium',
      homeSqft: 2200, roofSquares: 26.4, estimateLow: 10200, estimateHigh: 12400,
      leadScore: 10, outOfArea: false, status: 'new',
      aiLeadBrief: `• Homeowner on Shoal Creek filing an insurance claim for storm damage — asphalt replacement, ready to move forward.\n• Estimated job value $11,300 avg; score 10/10 — highest-priority lead in your pipeline right now.\n• Call within the next 1–2 hours: insurance claim leads contacted same day convert at 3× the rate of next-day follow-ups.`,
      aiEmailDraft: `Subject: Your Roof Estimate from Demo Roofing Co.

Hi Sarah,

Thank you for reaching out to Demo Roofing Co. about your roofing project at 4821 Shoal Creek Blvd. We understand this is an emergency situation and we're ready to help.

Based on the information you provided, your estimated cost for an asphalt shingle replacement is $10,200 – $12,400. This is just an estimate and we'd love to schedule a free inspection to give you an exact quote.

Our team is available as early as tomorrow. Would that work for you?

Best regards,
Demo Roofing Co.`,
      aiSmsDraft: 'Hi Sarah, this is Demo Roofing Co. We saw your estimate request — emergency replacement on Shoal Creek. We can send someone tomorrow. Call us at 512-555-0100 or reply here.',
      daysAgo: 0,
    },
    {
      name: 'James Kowalski',
      email: 'jkowalski@outlook.com',
      phone: '512-555-0142',
      address: '1902 Barton Hills Dr, Austin, TX 78704',
      lat: 30.2427, lng: -97.7741,
      insuranceClaim: 'no',
      materialType: 'metal', roofSlope: 'steep',
      homeSqft: 2600, roofSquares: 31.2, estimateLow: 22800, estimateHigh: 27900,
      leadScore: 8, outOfArea: false, status: 'contacted',
      aiLeadBrief: `• Homeowner on Barton Hills Dr planning a steep-pitch metal roof replacement — high-value, deliberate buyer likely comparing quotes.\n• Estimated job value $25,350 avg; metal installs have a 60–90 day decision window but strong close rates.\n• Send a follow-up today referencing the estimate and offer a free on-site measurement to advance the conversation.`,
      aiEmailDraft: `Subject: Metal Roof Estimate — Demo Roofing Co.

Hi James,

Thanks for using our estimator for your property on Barton Hills Dr. Metal roofing is a great long-term investment and we specialize in standing seam installations.

Your estimate range is $22,800 – $27,900. I'd love to walk you through the options and schedule a free on-site measurement.

Warm regards,
Demo Roofing Co.`,
      aiSmsDraft: 'Hey James! Demo Roofing here. Got your metal roof inquiry on Barton Hills. Great choice — we do a lot of standing seam in that neighborhood. Free inspection anytime this week?',
      daysAgo: 1,
    },
    {
      name: 'Maria Gonzalez',
      email: 'mgonzalez@yahoo.com',
      phone: '512-555-0177',
      address: '7834 Manchaca Rd, Austin, TX 78745',
      lat: 30.2021, lng: -97.8021,
      insuranceClaim: 'no',
      materialType: 'tile', roofSlope: 'medium',
      homeSqft: 2400, roofSquares: 28.8, estimateLow: 16900, estimateHigh: 20600,
      leadScore: 8, outOfArea: false, status: 'quoted',
      aiLeadBrief: `• Homeowner on Manchaca Rd looking to replace a tile roof — tile jobs are specialty work with fewer competing bids.\n• Estimated job value $18,750 avg; tile replacement margins are typically 15–20% higher than asphalt.\n• Status shows quoted — follow up within 48 hours to address any questions and push toward a signed agreement.`,
      aiEmailDraft: null, aiSmsDraft: null,
      daysAgo: 2,
    },
    {
      name: 'Derek Thompson',
      email: 'derek.t@gmail.com',
      phone: '512-555-0163',
      address: '2301 E Cesar Chavez St, Austin, TX 78702',
      lat: 30.2591, lng: -97.7201,
      insuranceClaim: 'yes',
      materialType: 'asphalt', roofSlope: 'low',
      homeSqft: 1533, roofSquares: 18.4, estimateLow: 6800, estimateHigh: 8300,
      leadScore: 7, outOfArea: false, status: 'contacted',
      aiLeadBrief: `• Homeowner on E Cesar Chavez filing an insurance claim — repair job, likely storm or hail damage.\n• Repair job at $7,550 avg; lower ticket but insurance repairs often lead to full replacement quotes within 3–6 months.\n• Already contacted — confirm inspection time today and document the damage for a potential upsell to full replacement.`,
      aiEmailDraft: `Subject: Roof Repair Estimate — Demo Roofing Co.

Hi Derek,

We received your repair request for your property on E Cesar Chavez. Emergency repairs are something we handle quickly — usually within 24-48 hours.

Estimated cost: $6,800 – $8,300 for the repair work. Let's get someone out there to assess the damage.

Demo Roofing Co.`,
      aiSmsDraft: 'Hi Derek, Demo Roofing Co. here. Saw your emergency repair request on Cesar Chavez. We can be out there within 24hrs. OK to call you at 512-555-0163?',
      daysAgo: 3,
    },
    {
      name: 'Linda Park',
      email: 'linda.park@icloud.com',
      phone: '512-555-0188',
      address: '5512 Burnet Rd, Austin, TX 78756',
      lat: 30.3421, lng: -97.7421,
      insuranceClaim: 'unsure',
      materialType: 'asphalt', roofSlope: 'medium',
      homeSqft: 1900, roofSquares: 22.8, estimateLow: 9400, estimateHigh: 11500,
      leadScore: 8, outOfArea: false, status: 'new',
      aiLeadBrief: `• Homeowner on Burnet Rd planning an asphalt shingle replacement — steady buyer, moving forward within weeks not months.\n• Estimated job value $10,450 avg; clean asphalt replacement with good margin potential.\n• No contact yet — reach out today with the estimate confirmation and offer a same-week free inspection.`,
      aiEmailDraft: null, aiSmsDraft: null,
      daysAgo: 4,
    },
    {
      name: 'Tom Bradshaw',
      email: 'tombradshaw@gmail.com',
      phone: null,
      address: '9201 Research Blvd, Austin, TX 78758',
      lat: 30.3921, lng: -97.7221,
      insuranceClaim: 'no',
      materialType: 'asphalt', roofSlope: 'medium',
      homeSqft: 2000, roofSquares: 24.0, estimateLow: 9900, estimateHigh: 12100,
      leadScore: 5, outOfArea: false, status: 'new',
      aiLeadBrief: `• Homeowner on Research Blvd still in early research phase — not ready to buy but actively gathering quotes.\n• Estimated job value $11,000 avg; worth a soft touch but don't prioritize over active buyers.\n• No phone captured — email only. Send a low-pressure note positioning yourself for when they're ready to move forward.`,
      aiEmailDraft: null, aiSmsDraft: null,
      daysAgo: 5,
    },
    {
      name: 'Rachel Kim',
      email: 'rachel.kim@gmail.com',
      phone: '512-555-0129',
      address: '3104 Guadalupe St, Austin, TX 78705',
      lat: 30.2921, lng: -97.7441,
      insuranceClaim: 'yes',
      materialType: 'asphalt', roofSlope: 'steep',
      homeSqft: 2475, roofSquares: 29.7, estimateLow: 12800, estimateHigh: 15600,
      leadScore: 10, outOfArea: false, status: 'won',
      aiLeadBrief: `• Homeowner on Guadalupe filing an insurance claim — steep-pitch asphalt replacement, high-value job, decisive buyer.\n• Estimated job value $14,200 avg; insurance claim + steep-pitch premium make this a top-tier lead.\n• Marked won — great close. Follow up post-job for a Google review and referral ask.`,
      aiEmailDraft: `Subject: Urgent: Roof Replacement Estimate — Demo Roofing Co.

Hi Rachel,

We received your emergency request for your home on Guadalupe St. A steep-pitch replacement is a significant project and we want to make sure you're protected quickly.

Estimated range: $12,800 – $15,600. We're available for an inspection as soon as today.

Best,
Demo Roofing Co.`,
      aiSmsDraft: 'Hi Rachel, Demo Roofing here. Emergency replacement on Guadalupe — we got your estimate request. Available for inspection today. Call 512-555-0100 or reply.',
      daysAgo: 6,
    },
    {
      name: 'Frank Deluca',
      email: 'frankd@hotmail.com',
      phone: '512-555-0155',
      address: '18940 FM 1825, Pflugerville, TX 78660',
      lat: 30.4721, lng: -97.6021,
      insuranceClaim: 'yes',
      materialType: 'asphalt', roofSlope: 'medium',
      homeSqft: 1958, roofSquares: 23.5, estimateLow: 9700, estimateHigh: 11800,
      leadScore: 6, outOfArea: true, status: 'new',
      aiLeadBrief: `• Homeowner in Pflugerville — outside your current service area but an active buyer planning a replacement soon.\n• Estimated job value $10,750 avg; worth a response if you're willing to travel or expanding coverage.\n• Consider adding a Pflugerville service location — this is the second out-of-area lead from that zip code this month.`,
      aiEmailDraft: null, aiSmsDraft: null,
      daysAgo: 7,
    },
    {
      name: 'Amy Sutton',
      email: 'amy.sutton@gmail.com',
      phone: '512-555-0111',
      address: '614 W 6th St, Austin, TX 78701',
      lat: 30.2721, lng: -97.7521,
      insuranceClaim: 'no',
      materialType: 'asphalt', roofSlope: 'flat',
      homeSqft: 1183, roofSquares: 14.2, estimateLow: 4800, estimateHigh: 5900,
      leadScore: 4, outOfArea: false, status: 'new',
      aiLeadBrief: `• Renter on W 6th St requesting a repair quote — renter leads require landlord authorization before work can proceed.\n• Estimated job value $5,350 avg; lower score due to renter status, but repair jobs are quick revenue.\n• Before booking, confirm they have landlord sign-off or ask for landlord contact to avoid a wasted site visit.`,
      aiEmailDraft: null, aiSmsDraft: null,
      daysAgo: 10,
    },
    {
      name: 'Carlos Reyes',
      email: 'carlosreyes@gmail.com',
      phone: '512-555-0144',
      address: '2200 S Lamar Blvd, Austin, TX 78704',
      lat: 30.2521, lng: -97.7731,
      insuranceClaim: 'no',
      materialType: 'metal', roofSlope: 'medium',
      homeSqft: 2258, roofSquares: 27.1, estimateLow: 19800, estimateHigh: 24200,
      leadScore: 8, outOfArea: false, status: 'quoted',
      aiLeadBrief: `• Homeowner on S Lamar planning a metal roof replacement — strong buyer, mid-range pitch, high job value.\n• Estimated job value $22,000 avg; metal installs are your highest-margin material category.\n• Currently quoted — send a follow-up referencing longevity and warranty advantages of metal to reinforce the decision.`,
      aiEmailDraft: null, aiSmsDraft: null,
      daysAgo: 12,
    },
    {
      name: 'Nancy Okafor',
      email: 'nokafor@icloud.com',
      phone: '512-555-0166',
      address: '4401 Speedway, Austin, TX 78751',
      lat: 30.3121, lng: -97.7321,
      insuranceClaim: 'unsure',
      materialType: 'tile', roofSlope: 'steep',
      homeSqft: 2700, roofSquares: 32.4, estimateLow: 19100, estimateHigh: 23300,
      leadScore: 6, outOfArea: false, status: 'new',
      aiLeadBrief: `• Homeowner on Speedway exploring options for a steep-pitch tile replacement — large job but early-stage buyer.\n• Estimated job value $21,200 avg; tile + steep pitch is a specialty combo with limited local competition.\n• Early-stage buyer — add to a monthly nurture sequence and re-engage if they don't move forward in 30 days.`,
      aiEmailDraft: null, aiSmsDraft: null,
      daysAgo: 14,
    },
    {
      name: 'Mike Harrington',
      email: 'mharrington@yahoo.com',
      phone: '512-555-0133',
      address: '1100 Congress Ave, Austin, TX 78701',
      lat: 30.2691, lng: -97.7411,
      insuranceClaim: 'no',
      materialType: 'asphalt', roofSlope: 'low',
      homeSqft: 1742, roofSquares: 20.9, estimateLow: 8600, estimateHigh: 10500,
      leadScore: 8, outOfArea: false, status: 'lost',
      aiLeadBrief: `• Homeowner on Congress Ave who requested a replacement quote 18 days ago — standard asphalt, low pitch, clean job.\n• Estimated job value $9,550 avg; marked as lost, likely went with another contractor.\n• Consider a re-engagement email in 60–90 days — many lost leads recycle when the winning bid falls through.`,
      aiEmailDraft: null, aiSmsDraft: null,
      daysAgo: 18,
    },
  ]

  for (const lead of leads) {
    const { daysAgo, ...data } = lead
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
    await prisma.lead.create({
      data: {
        ...data,
        contractorId: contractor.id,
        createdAt,
      },
    })
  }

  // Weekly report
  await prisma.weeklyReport.create({
    data: {
      contractorId: contractor.id,
      weekOf: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      report: `**This Week at a Glance**
You received 5 new leads this week with an average estimate of $14,200. Your hottest lead — Sarah Mitchell — is an insurance claim job with a 10/10 score. Insurance leads represent 40% of this week's pipeline, which is above your usual rate.

**What's Hot**
Insurance claim leads on the east side of Austin are trending up. Three of your five leads this week cited storm or hail damage, suggesting a weather event may have impacted the 78704–78756 zip code corridor.

**Opportunities**
Two leads from last week (James Kowalski, Maria Gonzalez) haven't been contacted yet based on the dashboard. Metal and tile estimates tend to have longer decision cycles — a follow-up now keeps you top of mind.

**Recommendation**
Prioritize Sarah Mitchell and Rachel Kim immediately (scores 10/10). Both are high-value insurance claim leads. Consider adding a service area location near Pflugerville — you had one out-of-area lead this week that you couldn't serve.`,
    },
  })

  console.log(`✅ Seed complete`)
  console.log(`   Contractor: Demo Roofing Co.`)
  console.log(`   Login: demo@betterroofing.co / demo1234`)
  console.log(`   Leads: ${leads.length}`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
