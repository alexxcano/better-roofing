'use client'

import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { Copy, Check, Mail } from 'lucide-react'

interface InstallClientProps {
  contractorId: string
}

export function InstallClient({ contractorId }: InstallClientProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com'
  const scriptTag = `<!-- BetterRoofing Widget -->
<div id="roof-estimator"></div>
<script src="${appUrl}/widget.js" data-contractor-id="${contractorId}" async></script>`

  const copy = async () => {
    await navigator.clipboard.writeText(scriptTag)
    setCopied(true)
    toast({ title: 'Copied!', description: 'Paste this code into your website.' })
    setTimeout(() => setCopied(false), 2000)
  }

  const emailCode = () => {
    const subject = encodeURIComponent('BetterRoofing Widget — Installation Code')
    const body = encodeURIComponent(
      `Hi,\n\nCan you add this widget to our website? It's an instant roofing estimator that lets visitors get a quote directly from our site.\n\nJust paste the snippet below before the closing </body> tag on whichever page you want it to appear (our homepage or a dedicated "Get a Quote" page would work great):\n\n${scriptTag}\n\nNo other setup needed — it loads automatically.\n`
    )
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Page header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h1 className="font-barlow font-black text-3xl uppercase text-stone-900 leading-none">Install Widget</h1>
        <p className="text-stone-500 text-sm font-semibold mt-1 uppercase tracking-wide">Embed the instant quote estimator on your website</p>
      </div>

      {/* Code snippet */}
      <div className="border-2 border-stone-300 bg-white">
        <div className="px-5 py-3 bg-stone-100 border-b-2 border-stone-300 flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-widest text-stone-600">Installation Code</p>
          <div className="flex items-center gap-2">
            <button onClick={emailCode} className="btn btn-ghost px-3 py-1.5">
              <Mail className="h-3.5 w-3.5" />
              Email
            </button>
            <button onClick={copy} className="btn btn-ghost px-3 py-1.5">
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
        <div className="p-5">
          <pre className="bg-stone-950 text-stone-100 p-4 text-sm overflow-x-auto leading-relaxed font-mono">
            {scriptTag}
          </pre>
          <p className="text-xs text-stone-400 font-semibold mt-3 uppercase tracking-wide">
            Paste this snippet before the closing &lt;/body&gt; tag on any page where you want the estimator to appear.
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="border-2 border-stone-300 bg-white">
        <div className="px-5 py-3 bg-stone-100 border-b-2 border-stone-300">
          <p className="text-xs font-black uppercase tracking-widest text-stone-600">Installation Steps</p>
        </div>
        <div className="divide-y divide-stone-200">
          {[
            {
              n: '01',
              title: 'Copy the code',
              desc: 'Hit the Copy button above — or use Email to send it straight to your web developer.',
            },
            {
              n: '02',
              title: 'Paste it on your site',
              desc: 'Drop it before the closing </body> tag — or email it to your web developer.',
            },
            {
              n: '03',
              title: 'You\'re live',
              desc: 'The widget appears instantly. No extra setup, no styling needed.',
            },
          ].map((step) => (
            <div key={step.n} className="flex items-start gap-4 px-5 py-4">
              <span className="font-barlow font-black text-2xl text-orange-500 leading-none w-8 flex-shrink-0">{step.n}</span>
              <div>
                <p className="font-bold text-stone-900 text-sm uppercase tracking-wide">{step.title}</p>
                <p className="text-sm text-stone-500 mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live preview */}
      <div className="border-2 border-stone-300 bg-white">
        <div className="px-5 py-3 bg-stone-100 border-b-2 border-stone-300">
          <p className="text-xs font-black uppercase tracking-widest text-stone-600">Live Preview</p>
          <p className="text-xs text-stone-400 font-semibold mt-0.5">This is exactly what your visitors will see</p>
        </div>
        <div className="p-5">
          <iframe
            src={`/embed/${contractorId}`}
            className="w-full border-2 border-stone-200"
            style={{ height: '520px' }}
            title="Widget Preview"
          />
        </div>
      </div>
    </div>
  )
}
