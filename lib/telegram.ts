function escapeHtml(str: string) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export async function sendTelegramMessage(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    })
  } catch {
    console.error('[telegram] Failed to send message')
  }
}

export function errorAlert(context: string, message: string) {
  return `🚨 <b>Error logged</b>\n<b>Context:</b> <code>${escapeHtml(context)}</code>\n<b>Message:</b> ${escapeHtml(message)}`
}

export function signupAlert(name: string, email: string, provider: string, company?: string) {
  const companyLine = company ? `\n<b>Company:</b> ${escapeHtml(company)}` : ''
  return `🎉 <b>New user signed up</b>\n<b>Name:</b> ${escapeHtml(name)}\n<b>Email:</b> ${escapeHtml(email)}${companyLine}\n<b>Provider:</b> ${escapeHtml(provider)}`
}
