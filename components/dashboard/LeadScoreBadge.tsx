import { cn } from '@/lib/utils'

interface LeadScoreBadgeProps {
  score: number
  outOfArea?: boolean
  showScore?: boolean
}

const TIER_STYLES = {
  hot:  'bg-red-100 text-red-700 border-red-200',
  warm: 'bg-orange-100 text-orange-700 border-orange-200',
  cool: 'bg-blue-100 text-blue-700 border-blue-200',
  cold: 'bg-slate-100 text-slate-600 border-slate-200',
}

function scoreTier(score: number): { tier: keyof typeof TIER_STYLES; label: string; emoji: string } {
  if (score >= 8) return { tier: 'hot',  label: 'Hot',  emoji: '🔥' }
  if (score >= 5) return { tier: 'warm', label: 'Warm', emoji: '⚡' }
  if (score >= 3) return { tier: 'cool', label: 'Cool', emoji: '👍' }
  return               { tier: 'cold', label: 'Cold', emoji: '🧊' }
}

export function LeadScoreBadge({ score, outOfArea = false, showScore = false }: LeadScoreBadgeProps) {
  const { tier, label, emoji } = scoreTier(outOfArea ? Math.min(score, 4) : score)

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
