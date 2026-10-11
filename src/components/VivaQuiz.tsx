import { useState } from 'react'
import { CheckCircle2, XCircle, RotateCcw, ArrowLeft } from 'lucide-react'
import type { Question } from '../types'

interface VivaQuizProps {
  subject: string
  questions: Question[]
  onExit: () => void
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D']

export default function VivaQuiz({ subject, questions, onExit }: VivaQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState(false)

  const currentQuestion = questions[currentIndex]

  function handleSelect(optionIndex: number) {
    if (selectedOption !== null) return // already answered this question

    setSelectedOption(optionIndex)
    if (optionIndex === currentQuestion.correct_option) {
      setCorrectCount((c) => c + 1)
    }
  }

  function handleNext() {
    if (currentIndex + 1 >= questions.length) {
      setFinished(true)
      return
    }
    setCurrentIndex((i) => i + 1)
    setSelectedOption(null)
  }

  function handleRetake() {
    setCurrentIndex(0)
    setSelectedOption(null)
    setCorrectCount(0)
    setFinished(false)
  }

  if (finished) {
    const percentage = Math.round((correctCount / questions.length) * 100)
    return (
      <div className="p-4 sm:p-6 max-w-lg mx-auto">
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Quiz Complete</h2>
          <p className="text-sm text-gray-500 mb-6">{subject} — Viva Prep</p>

          <p className="text-4xl font-bold text-gray-900">
            {correctCount}
            <span className="text-xl text-gray-400">/{questions.length}</span>
          </p>
          <span
            className={`inline-block mt-3 text-sm font-medium px-3 py-1 rounded-full ${
              percentage >= 60
                ? 'bg-green-50 text-green-700'
                : percentage >= 40
                ? 'bg-amber-50 text-amber-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {percentage}% correct
          </span>

          <div className="flex gap-3 mt-8">
            <button
              onClick={onExit}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              Back to Dashboard
            </button>
            <button
              onClick={handleRetake}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              <RotateCcw className="w-4 h-4" />
              Retake
            </button>
          </div>
        </div>
      </div>
    )
  }

  const hasAnswered = selectedOption !== null
  const options = currentQuestion.options ?? []

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto">
      <button
        onClick={onExit}
        className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Exit quiz
      </button>

      {/* Progress */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <span className="text-xs font-medium text-gray-500">
          Score: {correctCount}/{currentIndex + (hasAnswered ? 1 : 0)}
        </span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-blue-600 rounded-full transition-all"
          style={{ width: `${((currentIndex + (hasAnswered ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question card */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <p className="text-base font-medium text-gray-900 mb-5">
          {currentQuestion.text}
        </p>

        <div className="space-y-2.5">
          {options.map((option, index) => {
            const isCorrectOption = index === currentQuestion.correct_option
            const isSelected = index === selectedOption

            let style =
              'border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
            if (hasAnswered) {
              if (isCorrectOption) {
                style = 'border-green-400 bg-green-50'
              } else if (isSelected) {
                style = 'border-red-400 bg-red-50'
              } else {
                style = 'border-gray-200 opacity-60'
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleSelect(index)}
                disabled={hasAnswered}
                className={`w-full flex items-center gap-2 sm:gap-3 text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border-2 transition-colors ${style}`}
              >
                <span className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600 shrink-0">
                  {OPTION_LETTERS[index] ?? index + 1}
                </span>
                <span className="text-sm text-gray-800 flex-1">{option}</span>
                {hasAnswered && isCorrectOption && (
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                )}
                {hasAnswered && isSelected && !isCorrectOption && (
                  <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                )}
              </button>
            )
          })}
        </div>

        {hasAnswered && currentQuestion.explanation && (
          <div className="mt-4 bg-blue-50 rounded-lg px-4 py-3">
            <p className="text-xs font-medium text-blue-700 mb-1">Explanation</p>
            <p className="text-sm text-blue-900">{currentQuestion.explanation}</p>
          </div>
        )}

        {hasAnswered && (
          <button
            onClick={handleNext}
            className="w-full mt-5 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            {currentIndex + 1 >= questions.length ? 'Finish Quiz' : 'Next Question'}
          </button>
        )}
      </div>
    </div>
  )
}