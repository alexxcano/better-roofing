import { ImageResponse } from 'next/og'

export const alt = 'BetterRoofing — Instant Roof Quote Widget for Roofing Contractors'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

async function fetchFont(family: string, weight: number): Promise<ArrayBuffer> {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`,
    { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }
  ).then((r) => r.text())

  const url = css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/)?.[1]
  if (!url) throw new Error(`Could not find font URL for ${family} ${weight}`)
  return fetch(url).then((r) => r.arrayBuffer())
}

export default async function OgImage() {
  const barlowBlack = await fetchFont('Barlow Condensed', 900)

  return new ImageResponse(
    (
      <div
        style={{
          background: '#1c1917',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '72px 80px',
          position: 'relative',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Orange top bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: '#f97316', display: 'flex' }} />

        {/* Wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '44px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f97316', display: 'flex' }} />
          <span style={{ color: '#f97316', fontSize: '18px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'system-ui' }}>
            BetterRoofing
          </span>
        </div>

        {/* H1 */}
        <div style={{
          color: '#ffffff',
          fontSize: '86px',
          fontWeight: 900,
          lineHeight: 0.92,
          letterSpacing: '-0.01em',
          textTransform: 'uppercase',
          maxWidth: '780px',
          marginBottom: '32px',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Barlow Condensed',
        }}>
          <span>Stop Losing Roofing Jobs</span>
          <span style={{ color: '#f97316' }}>You Never Knew About</span>
        </div>

        {/* Subtext */}
        <div style={{
          color: '#a8a29e',
          fontSize: '22px',
          lineHeight: 1.5,
          maxWidth: '660px',
          display: 'flex',
          fontFamily: 'system-ui',
        }}>
          Add a 60-second quote widget to your site. Get scored leads with AI follow-up already written.
        </div>

        {/* Bottom trust bar */}
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '28px' }}>
          {['Starts at $49/mo', '14-day free trial', 'No setup fee'].map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
              {i > 0 && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#44403c', display: 'flex' }} />}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', display: 'flex' }} />
                <span style={{ color: '#78716c', fontSize: '18px', fontFamily: 'system-ui' }}>{label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Lead card */}
        <div style={{
          position: 'absolute',
          right: '80px',
          bottom: '60px',
          width: '260px',
          background: '#292524',
          border: '1px solid #44403c',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          boxShadow: '-12px 12px 48px rgba(0,0,0,0.5)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#78716c', fontSize: '10px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'system-ui' }}>New Lead</span>
            <span style={{ background: 'rgba(220,38,38,0.15)', color: '#f87171', border: '1px solid rgba(220,38,38,0.3)', fontSize: '10px', padding: '3px 8px', display: 'flex', fontFamily: 'system-ui' }}>🔥 Hot · 9/10</span>
          </div>
          <div style={{ color: '#ffffff', fontSize: '17px', fontWeight: 500, display: 'flex', fontFamily: 'system-ui' }}>Sarah Mitchell</div>
          <div style={{ color: '#57534e', fontSize: '12px', display: 'flex', fontFamily: 'system-ui' }}>1247 Oak Ridge Dr, Austin TX</div>
          <div style={{ height: '1px', background: '#44403c', display: 'flex' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#78716c', fontSize: '12px', fontFamily: 'system-ui' }}>Metal · 28 sq</span>
            <span style={{ color: '#4ade80', fontSize: '14px', fontWeight: 500, fontFamily: 'system-ui' }}>$18,200–$22,400</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Barlow Condensed', data: barlowBlack, weight: 900, style: 'normal' },
      ],
    },
  )
}
