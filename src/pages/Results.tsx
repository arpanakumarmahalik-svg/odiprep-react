import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle2, XCircle, MinusCircle, ArrowLeft } from 'lucide-react'
import { api } from '../lib/api'
import type { TestResults, QuestionResult } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorState from '../components/ErrorState'

type FilterType = 'all' | 'cut' | 'full'

export default function Results() {
  const { test_id } = useParams<{ test_id: string }>()
  const navigate = useNavigate()

  const [results, setResults] = useState<TestResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')

    async function fetchResults() {
    if (!test_id) return
    setLoading(true)
    setError(null)
    try {
      const res = await api.get<TestResults>(`/get-results/${test_id}`)
      setResults({
        ...res.data,
        questions: res.data.questions ?? [],
        section_breakdown: res.data.section_breakdown ?? [],
      })
    } catch (err) {
      setError('Results are not ready yet, or could not be loaded. Try again shortly.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResults()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [test_id])

  if (loading) {
    return <LoadingSpinner />
  }

    if (error || !results) {
    return (
      <div className="p-6">
        <ErrorState message={error || 'No results found.'} onRetry={fetchResults} />
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-2 text-sm text-blue-600 hover:underline block text-center w-full"
        >
          Back to dashboard
        </button>
      </div>
    )
  }

  const isPending = results.score == null || results.questions.length === 0

  if (isPending) {
    return (
      <div className="p-4 sm:p-6 max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </button>

        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="font-semibold text-gray-900 mb-1">Evaluating your answers...</h2>
          <p className="text-sm text-gray-500">
            AI is reading your handwritten answers and calculating marks. This
            can take a minute — try refreshing shortly.
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="w-full mt-4 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>
    )
  }

  const filteredQuestions = results.questions.filter((q) => {
    if (filter === 'cut') return q.marks_scored < q.marks
    if (filter === 'full') return q.marks_scored === q.marks
    return true
  })

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to dashboard
      </button>

      {/* Score hero */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 mb-6 text-center">
        <p className="text-sm text-gray-500 truncate">{results.subject}</p>
        <p className="text-3xl sm:text-4xl font-bold text-gray-900 mt-1">
          {results.score}
          <span className="text-xl text-gray-400">/{results.total_marks}</span>
        </p>
        <span
          className={`inline-block mt-3 text-sm font-medium px-3 py-1 rounded-full ${
            results.percentage >= 60
              ? 'bg-green-50 text-green-700'
              : results.percentage >= 40
              ? 'bg-amber-50 text-amber-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {results.percentage}%
        </span>
      </div>

      {/* Section breakdown */}
      {results.section_breakdown && results.section_breakdown.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Section Breakdown</h2>
          <div className="space-y-4">
            {results.section_breakdown.map((s) => {
              const pct = s.total > 0 ? Math.round((s.scored / s.total) * 100) : 0
              return (
                <div key={s.section}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">Section {s.section}</span>
                    <span className="text-gray-500">
                      {s.scored}/{s.total}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Filter chips */}
      <div className="flex items-center gap-2 mb-4">
        <FilterChip label="All questions" active={filter === 'all'} onClick={() => setFilter('all')} />
        <FilterChip label="Marks cut" active={filter === 'cut'} onClick={() => setFilter('cut')} />
        <FilterChip label="Full marks" active={filter === 'full'} onClick={() => setFilter('full')} />
      </div>

      {/* Question list */}
      <div className="space-y-3">
        {filteredQuestions.length === 0 ? (
          <div className="text-center text-sm text-gray-400 py-10">
            No questions match this filter.
          </div>
        ) : (
          filteredQuestions.map((q) => <QuestionResultCard key={q.id} question={q} />)
        )}
      </div>

      <button
        onClick={() => navigate('/dashboard')}
        className="w-full mt-6 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50"
      >
        Back to Dashboard
      </button>
    </div>
  )
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  )
}

function QuestionResultCard({ question }: { question: QuestionResult }) {
  const isFull = question.marks_scored === question.marks
  const isZero = question.marks_scored === 0
  const pillColor = isFull
    ? 'bg-green-50 text-green-700'
    : isZero
    ? 'bg-red-50 text-red-700'
    : 'bg-amber-50 text-amber-700'

  const Icon = isFull ? CheckCircle2 : isZero ? XCircle : MinusCircle
  const iconColor = isFull ? 'text-green-600' : isZero ? 'text-red-600' : 'text-amber-600'

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-gray-900 flex-1">
          <span className="font-semibold">Q{question.question_number}.</span>{' '}
          {question.text}
        </p>
        <span className={`shrink-0 flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${pillColor}`}>
          <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
          {question.marks_scored}/{question.marks}
        </span>
      </div>

      <div className="mt-3 space-y-2">
        <div>
          <p className="text-xs font-medium text-gray-500">Your answer</p>
          <p className="text-sm text-gray-700 mt-0.5">{question.student_answer || '—'}</p>
        </div>

        {!isFull && question.expected_answer && (
          <div>
            <p className="text-xs font-medium text-gray-500">Expected answer</p>
            <p className="text-sm text-gray-700 mt-0.5">{question.expected_answer}</p>
          </div>
        )}

        {!isFull && question.feedback && (
          <div className="bg-gray-50 rounded-lg px-3 py-2">
            <p className="text-xs font-medium text-gray-500 mb-0.5">Why marks were cut</p>
            <p className="text-sm text-gray-700">{question.feedback}</p>
          </div>
        )}
      </div>
    </div>
  )
}