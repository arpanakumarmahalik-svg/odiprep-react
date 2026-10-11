import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Clock, Mic, Loader2 } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import type { TestHistoryItem, TestType } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorState from '../components/ErrorState'

type FilterType = 'all' | TestType | 'evaluating'

const TYPE_ICON: Record<TestType, React.ReactNode> = {
  scetvt: <FileText className="w-5 h-5 text-blue-600" />,
  internal: <Clock className="w-5 h-5 text-blue-600" />,
  viva: <Mic className="w-5 h-5 text-blue-600" />,
}

const TYPE_LABEL: Record<TestType, string> = {
  scetvt: 'SCETVT',
  internal: 'Internal',
  viva: 'Viva',
}

export default function TestHistory() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [tests, setTests] = useState<TestHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')

    async function fetchHistory() {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const res = await api.get<any>(`/test-history/${user.id}`)
      const data = res.data
      const list: any[] = Array.isArray(data?.history) ? data.history : []

      const mapped: TestHistoryItem[] = list.map((item) => ({
        test_id: item.test_id,
        subject: item.subject,
        test_type: item.test_type,
        date: item.created_at
          ? new Date(item.created_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : '',
        score: item.total_score,
        total_marks: item.total_marks,
        status: item.status === 'evaluated' ? 'completed' : 'evaluating',
      }))

      setTests(mapped)
    } catch (err) {
      setError('Could not load test history.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])
  if (loading) {
    return <LoadingSpinner />
  }

  const filteredTests = tests.filter((t) => {
    if (filter === 'all') return true
    if (filter === 'evaluating') return t.status === 'evaluating'
    return t.test_type === filter
  })

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Test History</h1>
      <p className="text-sm text-gray-600 mb-6">
        All the tests you've taken so far.
      </p>

      {/* Filter chips */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <FilterChip label="All" active={filter === 'all'} onClick={() => setFilter('all')} />
        <FilterChip label="SCETVT" active={filter === 'scetvt'} onClick={() => setFilter('scetvt')} />
        <FilterChip label="Internal" active={filter === 'internal'} onClick={() => setFilter('internal')} />
        <FilterChip label="Viva" active={filter === 'viva'} onClick={() => setFilter('viva')} />
        <FilterChip label="Evaluating" active={filter === 'evaluating'} onClick={() => setFilter('evaluating')} />
      </div>

            {error ? (
        <ErrorState message={error} onRetry={fetchHistory} />
      ) : filteredTests.length === 0 ? (
        <div className="text-center text-sm text-gray-400 py-16">
          No tests found for this filter.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTests.map((t) => (
            <div
              key={t.test_id}
              onClick={() => navigate(`/results/${t.test_id}`)}
              className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  {TYPE_ICON[t.test_type]}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {t.subject}
                  </p>
                  <p className="text-xs text-gray-500">
                    {TYPE_LABEL[t.test_type]} &middot; {t.date}
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                {t.status === 'evaluating' ? (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Evaluating
                  </span>
                ) : (
                  <span className="text-sm font-semibold text-gray-900">
                    {t.score}/{t.total_marks}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
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