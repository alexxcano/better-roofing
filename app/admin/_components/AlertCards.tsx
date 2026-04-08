import { prisma } from '@/lib/prisma'
import { AlertTriangle, Ticket } from 'lucide-react'
import { TicketModal } from './TicketModal'

export async function AlertCards() {
  const now = new Date()
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const [trialsExpiringSoon, openTickets] = await Promise.all([
    prisma.subscription.findMany({
      where: { status: 'trialing', trialEndsAt: { lte: sevenDaysFromNow } },
      include: { contractor: { select: { companyName: true } } },
      orderBy: { trialEndsAt: 'asc' },
    }),
    prisma.supportTicket.findMany({
      where: { status: { in: ['open', 'in_progress'] } },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        subject: true,
        message: true,
        category: true,
        status: true,
        companyName: true,
        plan: true,
        userEmail: true,
        pageUrl: true,
        createdAt: true,
      },
    }),
  ])

  const trialRows = trialsExpiringSoon.map((sub) => {
    const daysLeft = Math.ceil(
      (new Date(sub.trialEndsAt!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )
    const expired = daysLeft <= 0
    return {
      id: sub.id,
      name: sub.contractor.companyName,
      badge: expired ? 'Expired' : `${daysLeft}d left`,
      variant: expired ? 'red' : 'orange',
    }
  })

  return (
    <div className="grid grid-cols-2 border border-stone-300 bg-white divide-x divide-stone-300">

      {/* Trials Expiring */}
      <div className="flex flex-col">
        <div className="px-5 py-3 bg-stone-100 border-b border-stone-300 flex items-center gap-2 flex-shrink-0">
          <AlertTriangle
            className={`h-3.5 w-3.5 flex-shrink-0 ${trialsExpiringSoon.length > 0 ? 'text-orange-500' : 'text-stone-400'}`}
          />
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-600">
            Trials Expiring Soon
          </p>
          {trialsExpiringSoon.length > 0 && (
            <span className="ml-auto text-[9px] font-black text-orange-600 border border-orange-300 bg-orange-50 px-1.5 py-0.5 leading-none">
              {trialsExpiringSoon.length}
            </span>
          )}
        </div>
        <div className="divide-y divide-stone-100">
          {trialRows.length === 0 ? (
            <p className="px-5 py-4 text-[10px] text-stone-400 font-semibold uppercase tracking-wide">
              None expiring soon
            </p>
          ) : (
            trialRows.map((row) => (
              <div key={row.id} className="px-5 py-3 flex items-center justify-between gap-4">
                <p className="text-sm font-bold text-stone-900 truncate">{row.name}</p>
                <span
                  className={`text-[10px] font-black border px-1.5 py-0.5 leading-none shrink-0 ${
                    row.variant === 'red'
                      ? 'text-red-600 border-red-300 bg-red-50'
                      : 'text-orange-600 border-orange-300 bg-orange-50'
                  }`}
                >
                  {row.badge}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Open Support Tickets */}
      <div className="flex flex-col">
        <div className="px-5 py-3 bg-stone-100 border-b border-stone-300 flex items-center gap-2 flex-shrink-0">
          <Ticket
            className={`h-3.5 w-3.5 flex-shrink-0 ${openTickets.length > 0 ? 'text-stone-600' : 'text-stone-400'}`}
          />
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-600">
            Support Tickets
          </p>
          {openTickets.length > 0 && (
            <span className="ml-auto text-[9px] font-black text-stone-700 border border-stone-300 bg-stone-200 px-1.5 py-0.5 leading-none">
              {openTickets.length}
            </span>
          )}
        </div>
        <div className="divide-y divide-stone-100">
          {openTickets.length === 0 ? (
            <p className="px-5 py-4 text-[10px] text-stone-400 font-semibold uppercase tracking-wide">
              No open tickets
            </p>
          ) : (
            openTickets.map((t) => (
              <div key={t.id} className="px-5 py-3">
                <TicketModal ticket={t} />
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  )
}
