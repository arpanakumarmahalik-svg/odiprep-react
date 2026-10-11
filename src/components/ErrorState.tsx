import { AlertCircle, RotateCcw } from 'lucide-react'

interface ErrorStateProps {
  message: string
  onRetry: () => void
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
      <p className="text-sm text-gray-600 max-w-sm mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
      >
        <RotateCcw className="w-4 h-4" />
        Retry
      </button>
    </div>
  )
}