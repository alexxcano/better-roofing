import Link from 'next/link'
import { Check } from 'lucide-react'

interface SetupChecklistProps {
  widgetInstalled: boolean   // true when totalLeads > 0
  notificationSet: boolean   // true when notificationEmail is set
}

export function SetupChecklist({ widgetInstalled, notificationSet }: SetupChecklistProps) {
  const steps = [
    {
      num: 1,
      title: 'Add the widget to your website',
      description: "Paste one line of code. Homeowners can get a quote 24/7 — even when you're off the clock.",
      href: '/dashboard/install',
      cta: 'Get install code',
      done: widgetInstalled,
      doneLabel: 'Widget is live — leads are coming in.',
    },
    {
      num: 2,
      title: 'Get notified when a lead comes in',
      description: "Enter your email and we'll alert you the moment a homeowner requests a quote.",
      href: '/dashboard/settings',
      cta: 'Set up alerts',
      done: notificationSet,
      doneLabel: 'Lead alerts are on.',
    },
  ]

  const doneCount = steps.filter((s) => s.done).length
  if (doneCount === steps.length) return null

  return (
    <div className="border-2 border-orange-400 bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-stone-900 px-5 py-4 flex items-center justify-between gap-4">
        <div>
          <p className="font-barlow font-black text-xl uppercase text-white leading-none">
            {doneCount === 0 ? "Let's get your first lead" : 'One step left'}
          </p>
          <p className="text-stone-400 text-xs font-semibold mt-1 uppercase tracking-wide">
            {doneCount} of {steps.length} steps complete
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
          {steps.map((s) => (
            <div
              key={s.num}
              className={`h-2.5 w-12 ${s.done ? 'bg-orange-500' : 'bg-stone-700'} transition-colors duration-500`}
            />
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="divide-y divide-stone-200">
        {steps.map((step) => (
          <div
            key={step.num}
            className={`flex items-center gap-4 px-5 py-4 ${step.done ? 'bg-stone-50' : 'bg-white'}`}
          >
            {/* Status badge */}
            <div
              className={`h-8 w-8 flex-shrink-0 flex items-center justify-center border-2 ${
                step.done
                  ? 'bg-green-500 border-green-500'
                  : 'bg-orange-500 border-orange-500'
              }`}
            >
              {step.done ? (
                <Check className="h-4 w-4 text-white" strokeWidth={3} />
              ) : (
                <span className="font-barlow font-black text-white text-sm leading-none">{step.num}</span>
              )}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className={`font-bold text-sm leading-none mb-1 ${step.done ? 'text-stone-400' : 'text-stone-900'}`}>
                {step.title}
              </p>
              <p className="text-xs font-semibold text-stone-500 leading-relaxed">
                {step.done ? step.doneLabel : step.description}
              </p>
            </div>

            {/* CTA */}
            {!step.done && (
              <Link href={step.href} className="btn btn-primary px-4 py-2 text-xs flex-shrink-0">
                {step.cta} →
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
