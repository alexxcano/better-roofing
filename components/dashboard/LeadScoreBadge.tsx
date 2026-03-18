import { calculateLeadScore } from '@/lib/leadScore'
import { cn } from '@/lib/utils'

interface LeadScoreBadgeProps {
  isHomeowner: string
  projectType: string
  urgency: string
  outOfArea?: boolean
  showScore?: boolean
}

const TIER_STYLES = {
  hot: 'bg-red-100 text-red-700 border-red-200',
  warm: 'bg-orange-100 text-orange-700 border-orange-200',
  cool: 'bg-blue-100 text-blue-700 border-blue-200',
  cold: 'bg-slate-100 text-slate-600 border-slate-200',
}

export function LeadScoreBadge({ isHomeowner, projectType, urgency, outOfArea = false, showScore = false }: LeadScoreBadgeProps) {
  const { score, tier, label, emoji } = calculateLeadScore({ isHomeowner, projectType, urgency, outOfArea })

  if (showScore) {
    return (
      <div className={cn(
        'inline-flex flex-col items-center justify-center px-2 py-1 border text-xs font-semibold leading-tight',
        TIER_STYLES[tier]
      )}>
        <span className="flex items-center gap-0.5">
          <span>{emoji}</span>
          <span>{label}</span>
        </span>
        <span className="opacity-60 text-[10px]">{score}/10</span>
      </div>
    )
  }

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 border text-xs font-semibold',
      TIER_STYLES[tier]
    )}>
      <span>{emoji}</span>
      <span>{label}</span>
    </span>
  )
}
