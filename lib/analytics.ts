declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

type EventParams = Record<string, string | number | boolean>

export function trackEvent(name: string, params?: EventParams) {
  if (typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', name, params)
}
