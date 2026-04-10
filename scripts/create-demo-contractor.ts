/**
 * Run once to create the shared demo contractor used on the landing page.
 * Usage: npx tsx scripts/create-demo-contractor.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const existing = await prisma.contractor.findFirst({
    where: { companyName: 'BetterRoofing Demo' },
  })

  if (existing) {
    console.log('Demo contractor already exists:')
    console.log(`NEXT_PUBLIC_DEMO_CONTRACTOR_ID=${existing.id}`)
    return
  }

  const contractor = await prisma.contractor.create({
    data: {
      companyName: 'BetterRoofing Demo',
      onboardingCompleted: true,
      outOfAreaBehavior: 'FLAG',
      pricingSettings: {
        create: {
          pricePerSquare: 350,
          pricePerSquareAsphalt: 350,
          pricePerSquareMetal: 600,
          pricePerSquareTile: 500,
          pricePerSquareFlat: 450,
          wasteFactor: 1.10,
          tearOffCost: 500,
          offersAsphalt: true,
          offersMetal: true,
          offersTile: true,
          offersFlat: false,
        },
      },
      subscription: {
        create: {
          plan: 'PRO',
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3650), // 10 years
        },
      },
    },
  })

  console.log('Demo contractor created successfully!')
  console.log('')
  console.log('Add this to your .env.local:')
  console.log(`NEXT_PUBLIC_DEMO_CONTRACTOR_ID=${contractor.id}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
