export type { User, Contractor, Lead, PricingSettings, Subscription } from '@prisma/client'

export interface LeadWithContractor {
  id: string
  contractorId: string
  name: string
  email: string
  phone: string | null
  address: string
  lat: number | null
  lng: number | null
  roofSquares: number
  estimateLow: number
  estimateHigh: number
  createdAt: Date
  contractor: {
    companyName: string
  }
}

export interface DashboardStats {
  totalLeads: number
  leadsThisMonth: number
  averageEstimate: number
}
