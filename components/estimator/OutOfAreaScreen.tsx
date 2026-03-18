import { MapPin } from 'lucide-react'

interface OutOfAreaScreenProps {
  distanceMiles: number
}

export function OutOfAreaScreen({ distanceMiles }: OutOfAreaScreenProps) {
  return (
    <div className="space-y-6 text-center py-4">
      <div className="h-14 w-14 bg-stone-100 border-2 border-stone-200 flex items-center justify-center mx-auto">
        <MapPin className="h-7 w-7 text-stone-400" />
      </div>

      <div>
        <h2 className="font-barlow font-black text-2xl uppercase text-stone-900 leading-none mb-2">
          Outside Our Service Area
        </h2>
        <p className="text-stone-500 text-sm leading-relaxed max-w-xs mx-auto">
          Your address is <span className="font-bold text-stone-700">{distanceMiles} miles</span> from our nearest
          location — further than we currently service.
        </p>
      </div>

      <div className="border-2 border-stone-200 bg-stone-50 px-5 py-4 text-left space-y-2">
        <p className="text-xs font-black uppercase tracking-widest text-stone-500">What you can do</p>
        <ul className="space-y-2">
          {[
            'Call us directly — we may be able to refer you to a trusted contractor nearby',
            'Check back later as we expand our service area',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-stone-600">
              <span className="text-orange-500 font-black mt-0.5 flex-shrink-0">→</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

    </div>
  )
}
