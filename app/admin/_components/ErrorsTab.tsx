import { prisma } from '@/lib/prisma'
import { AlertTriangle, AlertCircle } from 'lucide-react'

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

  const errorCount = errors.filter((e) => e.level === 'error').length
  const warnCount = errors.filter((e) => e.level === 'warn').length

  return (
    <div className="space-y-6">

      {/* Summary */}
      <div className="grid grid-cols-3 border border-stone-300 bg-white divide-x divide-stone-200">
        <div className="px-6 py-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">Total (last 200)</p>
          <p className="font-barlow font-black text-4xl leading-none text-stone-900">{errors.length}</p>
        </div>
        <div className="px-6 py-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">Errors</p>
          <p className={`font-barlow font-black text-4xl leading-none ${errorCount > 0 ? 'text-red-600' : 'text-stone-900'}`}>
            {errorCount}
          </p>
        </div>
        <div className="px-6 py-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">Warnings</p>
          <p className={`font-barlow font-black text-4xl leading-none ${warnCount > 0 ? 'text-orange-500' : 'text-stone-900'}`}>
            {warnCount}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-6 items-start">

        {/* Error log */}
        <div className="border border-stone-300 bg-white">
          <div className="px-5 py-3 bg-stone-100 border-b border-stone-300">
            <p className="text-xs font-black uppercase tracking-widest text-stone-600">Recent Errors</p>
          </div>
          {errors.length === 0 ? (
            <p className="px-5 py-8 text-sm text-stone-400 font-semibold uppercase tracking-wide text-center">
              No errors logged
            </p>
          ) : (
            <div className="divide-y divide-stone-100">
              {errors.map((log) => {
                const isError = log.level === 'error'
                const meta = log.meta ? (() => { try { return JSON.parse(log.meta) } catch { return null } })() : null

                return (
                  <div key={log.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        {isError
                          ? <AlertCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                          : <AlertTriangle className="h-3.5 w-3.5 text-orange-400 flex-shrink-0" />
                        }
                        <span className={`text-[10px] font-black uppercase tracking-widest border px-1.5 py-0.5 flex-shrink-0 ${
                          isError
                            ? 'text-red-600 border-red-200 bg-red-50'
                            : 'text-orange-600 border-orange-200 bg-orange-50'
                        }`}>
                          {log.level}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-stone-500 border border-stone-200 bg-stone-50 px-1.5 py-0.5 flex-shrink-0">
                          {log.context}
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-400 font-semibold flex-shrink-0">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <p className="text-sm font-semibold text-stone-800 mb-1">{log.message}</p>

                    {meta && (
                      <div className="flex flex-wrap gap-2 mb-1.5">
                        {Object.entries(meta).map(([k, v]) => (
                          <span key={k} className="text-[10px] font-semibold text-stone-500">
                            <span className="font-black text-stone-400 uppercase">{k}:</span> {String(v)}
                          </span>
                        ))}
                      </div>
                    )}

                    {log.userId && (
                      <p className="text-[10px] text-stone-400 font-semibold">user: {log.userId}</p>
                    )}

                    {log.stack && (
                      <details className="mt-2">
                        <summary className="text-[10px] font-black uppercase tracking-widest text-stone-400 cursor-pointer hover:text-stone-600">
                          Stack trace
                        </summary>
                        <pre className="mt-1.5 text-[10px] text-stone-500 bg-stone-50 border border-stone-200 p-3 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                          {log.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

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
