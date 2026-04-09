import { prisma } from '@/lib/prisma'
import { ErrorLogList } from './ErrorLogList'

export async function ErrorsTab() {
  const [errors, counts] = await Promise.all([
    prisma.errorLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
    prisma.errorLog.groupBy({
      by: ['context'],
      _count: { _all: true },
      orderBy: { _count: { context: 'desc' } },
    }),
  ])

  const openCount     = errors.filter((e) => e.status === 'open').length
  const resolvedCount = errors.filter((e) => e.status === 'resolved').length
  const errorCount    = errors.filter((e) => e.level === 'error' && e.status === 'open').length
  const warnCount     = errors.filter((e) => e.level === 'warn'  && e.status === 'open').length

  return (
    <div className="space-y-6">

      {/* Summary */}
      <div className="grid grid-cols-4 border border-stone-300 bg-white divide-x divide-stone-200">
        <div className="px-6 py-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">Open</p>
          <p className={`font-barlow font-black text-4xl leading-none ${openCount > 0 ? 'text-red-600' : 'text-stone-900'}`}>
            {openCount}
          </p>
        </div>
        <div className="px-6 py-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">Errors (open)</p>
          <p className={`font-barlow font-black text-4xl leading-none ${errorCount > 0 ? 'text-red-600' : 'text-stone-900'}`}>
            {errorCount}
          </p>
        </div>
        <div className="px-6 py-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">Warnings (open)</p>
          <p className={`font-barlow font-black text-4xl leading-none ${warnCount > 0 ? 'text-orange-500' : 'text-stone-900'}`}>
            {warnCount}
          </p>
        </div>
        <div className="px-6 py-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">Resolved</p>
          <p className={`font-barlow font-black text-4xl leading-none ${resolvedCount > 0 ? 'text-green-600' : 'text-stone-900'}`}>
            {resolvedCount}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-6 items-start">

        {/* Error log — client component handles filtering + actions */}
        <ErrorLogList errors={errors} />

        {/* Context breakdown */}
        <div className="border border-stone-300 bg-white">
          <div className="px-5 py-3 bg-stone-100 border-b border-stone-300">
            <p className="text-xs font-black uppercase tracking-widest text-stone-600">By Context</p>
          </div>
          {counts.length === 0 ? (
            <p className="px-5 py-4 text-xs text-stone-400 font-semibold uppercase tracking-wide">No data</p>
          ) : (
            <div className="divide-y divide-stone-100">
              {counts.map((c) => (
                <div key={c.context} className="px-5 py-3 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-stone-600 border border-stone-200 bg-stone-50 px-1.5 py-0.5">
                    {c.context}
                  </span>
                  <span className="font-barlow font-black text-lg text-stone-900">{c._count._all}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
