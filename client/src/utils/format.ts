export function formatDuration(seconds?: number | null): string {
  if (seconds == null || seconds <= 0) return ''
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  let out = ''
  if (h > 0) out += `${h}h `
  if (m > 0 || h > 0) out += `${m}m `
  if (s > 0 && h === 0) out += `${s}s`
  return out.trim()
} 