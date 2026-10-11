import { useEffect, useState } from 'react'

export default function LoadingSpinner() {
  const [showColdStartNote, setShowColdStartNote] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowColdStartNote(true), 5000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-screen px-4 text-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      {showColdStartNote && (
        <p className="text-sm text-gray-400 mt-4 max-w-xs">
          Still loading... the server may be waking up. This can take up to 30 seconds.
        </p>
      )}
    </div>
  )
}