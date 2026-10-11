import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

interface TimerProps {
  testId: string
  durationSeconds: number
  onTimeUp: () => void
}

function formatTime(totalSeconds: number) {
  const clamped = Math.max(0, totalSeconds)
  const h = Math.floor(clamped / 3600)
  const m = Math.floor((clamped % 3600) / 60)
  const s = clamped % 60
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':')
}

function getEndTimeKey(testId: string) {
  return `test_end_time_${testId}`
}

export default function Timer({ testId, durationSeconds, onTimeUp }: TimerProps) {
  const [remaining, setRemaining] = useState<number>(durationSeconds)

  useEffect(() => {
    const key = getEndTimeKey(testId)
    let endTime = localStorage.getItem(key)

    if (!endTime) {
      const newEndTime = Date.now() + durationSeconds * 1000
      localStorage.setItem(key, String(newEndTime))
      endTime = String(newEndTime)
    }

    const endTimeMs = Number(endTime)

    function tick() {
      const secondsLeft = Math.round((endTimeMs - Date.now()) / 1000)
      setRemaining(secondsLeft)

      if (secondsLeft <= 0) {
        clearInterval(interval)
        localStorage.removeItem(key)
        onTimeUp()
      }
    }

    tick()
    const interval = setInterval(tick, 1000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId, durationSeconds])

  const isLow = remaining <= 10 * 60

  return (
    <div
      className={`flex items-center gap-2 border rounded-lg px-3 py-2 ${
        isLow
          ? 'bg-red-50 border-red-200 text-red-700'
          : 'bg-white border-gray-200 text-gray-900'
      }`}
    >
      <Clock className="w-4 h-4" />
      <span className="font-mono font-semibold text-sm">
        {formatTime(remaining)}
      </span>
    </div>
  )
}