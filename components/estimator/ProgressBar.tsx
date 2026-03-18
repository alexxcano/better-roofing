interface ProgressBarProps {
  currentStep: number
  totalSteps: number
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const pct = Math.round(((currentStep - 1) / (totalSteps - 1)) * 100)
  return (
    <div className="w-full">
      <div className="h-1 bg-stone-100">
        <div
          className="h-full bg-orange-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
