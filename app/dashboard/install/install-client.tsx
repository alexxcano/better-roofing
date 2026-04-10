'use client'

import { useState, useRef } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { Copy, Check, Mail, ChevronDown, ChevronUp, Link as LinkIcon } from 'lucide-react'

interface InstallClientProps {
  contractorId: string
  isPro: boolean
}

export function InstallClient({ contractorId, isPro }: InstallClientProps) {
  const { toast } = useToast()
  const [embedCopied, setEmbedCopied] = useState(false)
  const [tabCopied, setTabCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [showEmbedCode, setShowEmbedCode] = useState(false)
  const [showTabCode, setShowTabCode] = useState(false)
  const embedCodeRef = useRef<HTMLDivElement>(null)
  const tabCodeRef = useRef<HTMLDivElement>(null)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com'
  const directLink = `${appUrl}/embed/${contractorId}`

  const scriptTag = `<!-- BetterRoofing Widget -->
<div id="roof-estimator"></div>
<script src="${appUrl}/widget.js" data-contractor-id="${contractorId}" async></script>`

  const tabScriptTag = `<script src="${appUrl}/tab-widget.js" data-contractor-id="${contractorId}" async></script>`

  const copyEmbed = async () => {
    await navigator.clipboard.writeText(scriptTag)
    setEmbedCopied(true)
    toast({ title: 'Copied!' })
    setTimeout(() => setEmbedCopied(false), 2000)
  }

  const copyTab = async () => {
    await navigator.clipboard.writeText(tabScriptTag)
    setTabCopied(true)
    toast({ title: 'Copied!' })
    setTimeout(() => setTabCopied(false), 2000)
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(directLink)
    setLinkCopied(true)
    toast({ title: 'Link copied!' })
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const emailEmbed = () => {
    const subject = encodeURIComponent('Please add a quote widget to our website')
    const body = encodeURIComponent(
      `Hi,\n\nCan you add an instant roofing estimator to our website? It lets visitors get a quote on their own — no phone call needed.\n\nJust paste this snippet before the closing </body> tag on our homepage (or whichever page you think works best):\n\n${scriptTag}\n\nThat's all it takes. Let me know if you have any questions!\n`
    )
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  const emailTab = () => {
    const subject = encodeURIComponent('Please add a floating quote button to our website')
    const body = encodeURIComponent(
      `Hi,\n\nCan you add a floating "Get Instant Quote" tab to our website? It pins to the edge of every page — visitors click it and a quote form slides in without them leaving.\n\nJust paste this one line before the closing </body> tag:\n\n${tabScriptTag}\n\nThat's it! Let me know if you have any questions.\n`
    )
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-88px)] md:h-[calc(100vh-64px)]">

      {/* Page header */}
      <div className="border-l-4 border-orange-500 pl-4 flex-shrink-0">
        <h1 className="font-barlow font-black text-3xl uppercase text-stone-900 leading-none">Add to Your Website</h1>
        <p className="text-stone-500 text-sm font-semibold mt-1 uppercase tracking-wide">Let visitors get a quote without ever calling you</p>
      </div>

      {/* Side-by-side: preview on the left, options on the right */}
      <div className="flex gap-4 flex-1 min-h-0">

        {/* Left: Live widget preview — fills remaining height */}
        <div className="flex-1 min-w-0 border-2 border-stone-300 bg-white flex flex-col overflow-hidden">
          <div className="px-5 py-3 bg-stone-100 border-b-2 border-stone-300 flex-shrink-0">
            <p className="text-xs font-black uppercase tracking-widest text-stone-600">Your Widget — Try It Out</p>
            <p className="text-xs text-stone-500 font-semibold mt-0.5">This is exactly what your visitors will see once it's on your site</p>
          </div>
          <div className="flex-1 p-4 min-h-0">
            <iframe
              src={`/embed/${contractorId}`}
              className="w-full h-full border-2 border-stone-200"
              title="Widget Preview"
            />
          </div>
        </div>

        {/* Right: Install options */}
        <div className="w-[340px] flex-shrink-0 flex flex-col gap-3 overflow-auto">
          <p className="text-xs font-black uppercase tracking-widest text-stone-500 flex-shrink-0">Choose How It Appears on Your Site</p>

          {/* Embedded widget */}
          <div className="border-2 border-stone-300 bg-white flex flex-col flex-shrink-0">
            <div className="px-5 py-4 border-b-2 border-stone-200 bg-stone-50">
              <p className="font-barlow font-black text-base uppercase text-stone-900 leading-none">Embedded on a Page</p>
              <p className="text-xs text-stone-500 font-semibold mt-1 leading-relaxed">
                Sits inside one page of your site — like your homepage or a "Get a Quote" page.
              </p>
            </div>
            <div className="p-4 flex flex-col gap-2.5">
              <button onClick={emailEmbed} className="btn btn-primary w-full py-2.5">
                <Mail className="h-4 w-4" />
                Email My Developer
              </button>
              <button onClick={() => {
                const next = !showEmbedCode
                setShowEmbedCode(next)
                if (next) setTimeout(() => embedCodeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50)
              }} className="btn btn-ghost w-full py-2">
                {showEmbedCode ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                {showEmbedCode ? 'Hide Code' : 'Install It Myself'}
              </button>
              {showEmbedCode && (
                <div ref={embedCodeRef} className="space-y-2">
                  <pre className="bg-stone-950 text-stone-100 p-3 text-xs overflow-x-auto leading-relaxed font-mono">
                    {scriptTag}
                  </pre>
                  <button onClick={copyEmbed} className="btn btn-ghost w-full py-2">
                    {embedCopied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                    {embedCopied ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Floating tab widget */}
          <div className={`border-2 bg-white flex flex-col relative flex-shrink-0 ${isPro ? 'border-stone-300' : 'border-stone-200'}`}>
            <div className="px-5 py-4 border-b-2 border-stone-200 bg-stone-50 relative">
              <div className={!isPro ? 'pr-16' : ''}>
                <p className="font-barlow font-black text-base uppercase text-stone-900 leading-none">Floating Tab</p>
                <p className="text-xs text-stone-500 font-semibold mt-1 leading-relaxed">
                  An orange tab pinned to the edge of every page — always visible to visitors.
                </p>
              </div>
              {!isPro && (
                <span className="absolute top-4 right-4 inline-flex items-center px-2 py-0.5 text-[10px] font-black uppercase tracking-wide bg-stone-200 text-stone-500">Pro Only</span>
              )}
            </div>
            <div className={`p-4 flex flex-col gap-2.5 ${!isPro ? 'opacity-40 pointer-events-none select-none' : ''}`}>
              <button onClick={emailTab} className="btn btn-primary w-full py-2.5">
                <Mail className="h-4 w-4" />
                Email My Developer
              </button>
              <button onClick={() => {
                const next = !showTabCode
                setShowTabCode(next)
                if (next) setTimeout(() => tabCodeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50)
              }} className="btn btn-ghost w-full py-2">
                {showTabCode ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                {showTabCode ? 'Hide Code' : 'Install It Myself'}
              </button>
              {showTabCode && (
                <div ref={tabCodeRef} className="space-y-2">
                  <pre className="bg-stone-950 text-stone-100 p-3 text-xs overflow-x-auto leading-relaxed font-mono">
                    {tabScriptTag}
                  </pre>
                  <button onClick={copyTab} className="btn btn-ghost w-full py-2">
                    {tabCopied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                    {tabCopied ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
              )}
            </div>
            {!isPro && (
              <div className="absolute inset-0 flex items-center justify-center">
                <a href="/dashboard/billing" className="btn btn-primary px-6 py-3 text-sm font-black uppercase tracking-wide">
                  Upgrade to Pro →
                </a>
              </div>
            )}
          </div>

          {/* Direct / email signature link */}
          <div className="border-2 border-stone-300 bg-white flex flex-col flex-shrink-0">
            <div className="px-5 py-4 border-b-2 border-stone-200 bg-stone-50">
              <p className="font-barlow font-black text-base uppercase text-stone-900 leading-none">Email Signature Link</p>
              <p className="text-xs text-stone-500 font-semibold mt-1 leading-relaxed">
                Share this link in emails or texts — anyone who clicks it lands directly on your quote form, no website needed.
              </p>
            </div>
            <div className="p-4 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 border-2 border-stone-200 bg-stone-50 px-3 py-2">
                <LinkIcon className="h-3.5 w-3.5 text-stone-400 flex-shrink-0" />
                <span className="text-xs font-mono text-stone-600 truncate flex-1">{directLink}</span>
              </div>
              <button onClick={copyLink} className="btn btn-primary w-full py-2.5">
                {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {linkCopied ? 'Copied!' : 'Copy Link'}
              </button>
              <p className="text-[11px] text-stone-400 font-semibold uppercase tracking-wide leading-relaxed">
                Tip: add it as a hyperlink on "Get a free quote" in your email signature
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
