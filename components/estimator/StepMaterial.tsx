'use client'

interface StepMaterialProps {
  materialType: string | null
  enabledMaterials: string[]
  onComplete: (data: { materialType: string }) => void
}

const ALL_MATERIALS = [
  {
    id: 'asphalt',
    label: 'Asphalt Shingles',
    description: 'Most popular · 20–30 year lifespan',
    emoji: '🏠',
  },
  {
    id: 'metal',
    label: 'Metal Roofing',
    description: 'Durable · 40–70 year lifespan',
    emoji: '🔩',
  },
  {
    id: 'tile',
    label: 'Tile Roofing',
    description: 'Premium look · 50+ year lifespan',
    emoji: '🏛️',
  },
  {
    id: 'flat',
    label: 'Flat / TPO',
    description: 'Low-slope · EPDM, TPO, mod bitumen',
    emoji: '▱',
  },
]

export function StepMaterial({ materialType: initialMaterial, enabledMaterials, onComplete }: StepMaterialProps) {
  const materials = ALL_MATERIALS.filter((m) => enabledMaterials.includes(m.id))

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-stone-900 leading-tight">What roofing material are you looking for?</h2>
      </div>
      <div className="space-y-3">
        {materials.map((material) => (
          <button
            key={material.id}
            type="button"
            onClick={() => onComplete({ materialType: material.id })}
            className="w-full flex items-center gap-4 px-5 py-4 border-2 border-stone-200 hover:border-orange-500 hover:bg-orange-50 text-left transition-all group"
          >
            <span className="text-2xl leading-none">{material.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-stone-900 group-hover:text-orange-700">{material.label}</p>
              <p className="text-sm text-stone-500 mt-0.5">{material.description}</p>
            </div>
            <span className="text-stone-300 group-hover:text-orange-500 font-bold text-lg flex-shrink-0">›</span>
          </button>
        ))}
      </div>
    </div>
  )
}
