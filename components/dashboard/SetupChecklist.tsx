import Link from 'next/link'
import { Check } from 'lucide-react'

interface SetupChecklistProps {
  pricingCustomized: boolean   // pricing differs from signup defaults
  locationSet: boolean         // at least one location exists
  widgetInstalled: boolean     // at least one lead received
  notificationSet: boolean     // notificationEmail is set
}

export function SetupChecklist({
  pricingCustomized,
  locationSet,
  widgetInstalled,
  notificationSet,
}: SetupChecklistProps) {
  const steps = [
    {
      num: 1,
      title: 'Set your pricing',
      description: 'Enter your price per square so the widget gives homeowners an accurate estimate.',
      href: '/dashboard/settings',
      cta: 'Set pricing',
      done: pricingCustomized,
      doneLabel: 'Pricing is configured.',
    },
    {
      num: 2,
      title: 'Set your service area',
      description: 'Tell us where you work so the widget only accepts leads you can actually serve.',
      href: '/dashboard/locations',
      cta: 'Set service area',
      done: locationSet,
      doneLabel: 'Service area is set.',
    },
    {
      num: 3,
      title: 'Add the widget to your website',
      description: "One line of code. Homeowners can get a quote 24/7 — even when you're off the clock.",
      href: '/dashboard/install',
      cta: 'Get install code',
      done: widgetInstalled,
      doneLabel: 'Widget is live — leads are coming in.',
    },
    {
      num: 4,
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
    <div className="border-2 border-stone-300 bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-stone-900 px-5 py-4 flex items-center justify-between gap-4">
        <div>
          <p className="font-barlow font-black text-xl uppercase text-white leading-none">
            {doneCount === 0 ? "Let's get your first lead" : `${steps.length - doneCount} step${steps.length - doneCount === 1 ? '' : 's'} left`}
          </p>
          <p className="text-stone-400 text-xs font-semibold mt-1 uppercase tracking-wide">
            {doneCount} of {steps.length} steps complete
          </p>
        </div>
        {/* Progress pips */}
        <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
          {steps.map((s) => (
            <div
              key={s.num}
              className={`h-2 w-8 transition-colors duration-500 ${s.done ? 'bg-green-500' : 'bg-stone-700'}`}
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
                  : 'bg-stone-800 border-stone-800'
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

            {/* CTA — uses secondary (stone) to not compete with the orange trial banner */}
            {!step.done && (
              <Link href={step.href} className="btn btn-secondary px-4 py-2 text-xs flex-shrink-0">
                {step.cta} →
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
