export function formatCountdown(lockedUntilIso: string): string {
  const unlockTime = new Date(lockedUntilIso).getTime()
  const now = Date.now()
  const diffMs = unlockTime - now

  if (diffMs <= 0) return '00:00:00'

  const totalSeconds = Math.floor(diffMs / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60

  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':')
}

export function isStillLocked(lockedUntilIso?: string): boolean {
  if (!lockedUntilIso) return false
  return new Date(lockedUntilIso).getTime() > Date.now()
}