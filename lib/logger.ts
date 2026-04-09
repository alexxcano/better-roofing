import { prisma } from '@/lib/prisma'

type LogLevel = 'error' | 'warn'

interface LogOptions {
  userId?: string
  meta?: Record<string, unknown>
}

async function sendTelegramAlert(context: string, message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return

  const text = `🚨 *Error logged*\n*Context:* \`${context}\`\n*Message:* ${message}`

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
    })
  } catch {
    console.error('[logger] Failed to send Telegram alert')
  }
}

async function log(level: LogLevel, context: string, error: unknown, options: LogOptions = {}) {
  const message = error instanceof Error ? error.message : String(error)
  const stack = error instanceof Error ? error.stack : undefined

  // Always write to console so local dev and platform logs still work
  if (level === 'error') {
    console.error(`[${context}]`, message, options.meta ?? '')
  } else {
    console.warn(`[${context}]`, message, options.meta ?? '')
  }

  try {
    await prisma.errorLog.create({
      data: {
        level,
        context,
        message,
        stack,
        userId: options.userId,
        meta: options.meta ? JSON.stringify(options.meta) : null,
      },
    })
  } catch {
    // Don't let logger failures crash the caller
    console.error('[logger] Failed to write error log to DB')
  }

  if (level === 'error') {
    await sendTelegramAlert(context, message)
  }
}

export const logger = {
  error: (context: string, error: unknown, options?: LogOptions) =>
    log('error', context, error, options),
  warn: (context: string, error: unknown, options?: LogOptions) =>
    log('warn', context, error, options),
}
