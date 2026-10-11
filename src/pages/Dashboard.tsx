import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { BookOpen, Target, Clock, Flame, Plus, Lock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import type { DashboardStats, LockStatus } from '../types'
import { formatCountdown, isStillLocked } from '../lib/lockout'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorState from '../components/ErrorState'

const PIE_COLORS = ['#0F52BA', '#A6C5D7', '#D6E6F3']

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lockouts, setLockouts] = useState<LockStatus[]>([])
  const [, forceTick] = useState(0)

    async function fetchStats() {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const res = await api.get<DashboardStats>(`/dashboard-stats/${user.id}`)
      const data = res.data
      setStats({
        tests_taken: data.tests_taken ?? 0,
        average_score: data.average_score ?? 0,
        study_hours: data.study_hours ?? 0,
        day_streak: data.day_streak ?? 0,
        score_progress: data.score_progress ?? [],
        section_accuracy: data.section_accuracy ?? [],
        recent_tests: data.recent_tests ?? [],
      })
    } catch (err) {
      setError('Could not load dashboard stats. The server may still be starting up.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    if (!user) return

    async function fetchLockouts() {
      try {
        const res = await api.get<LockStatus[]>(`/all-lockouts/${user!.id}`)
        const data = res.data ?? []
        setLockouts(data.filter((l) => isStillLocked(l.locked_until)))
      } catch {
        setLockouts([])
      }
    }

    fetchLockouts()
  }, [user])

  // Tick every second so the countdown text stays live
  useEffect(() => {
    const interval = setInterval(() => forceTick((n) => n + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <LoadingSpinner />
  }

    if (error || !stats) {
    return <ErrorState message={error || 'No data available yet.'} onRetry={fetchStats} />
  }
  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={() => navigate('/upload')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Generate New Test
        </button>
      </div>

      {/* Locked subjects */}
      {lockouts.length > 0 && (
        <div className="space-y-2">
          {lockouts.map((lock) => (
            <div
              key={lock.subject}
              className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
            >
              <Lock className="w-4 h-4 text-red-600 shrink-0" />
              <p className="text-sm text-red-700">
                <span className="font-medium">{lock.subject}</span> is locked
                {lock.locked_until && (
                  <>
                    {' '}for{' '}
                    <span className="font-mono font-semibold">
                      {formatCountdown(lock.locked_until)}
                    </span>
                  </>
                )}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          icon={<BookOpen className="w-5 h-5 text-blue-600" />}
          label="Tests Taken"
          value={stats.tests_taken}
        />
        <MetricCard
          icon={<Target className="w-5 h-5 text-blue-600" />}
          label="Average Score"
          value={`${stats.average_score}%`}
        />
        <MetricCard
          icon={<Clock className="w-5 h-5 text-blue-600" />}
          label="Study Hours"
          value={stats.study_hours}
        />
        <MetricCard
          icon={<Flame className="w-5 h-5 text-blue-600" />}
          label="Day Streak"
          value={stats.day_streak}
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Score Progress</h2>
          {stats.score_progress.length === 0 ? (
            <EmptyState text="No tests yet — take a test to see your progress." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={stats.score_progress}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#0F52BA"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Section Accuracy</h2>
          {stats.section_accuracy.length === 0 ? (
            <EmptyState text="No section data yet." />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={stats.section_accuracy}
                  dataKey="accuracy"
                  nameKey="section"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {stats.section_accuracy.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="mt-3 space-y-1">
            {stats.section_accuracy.map((s, i) => (
              <div key={s.section} className="flex items-center gap-2 text-sm text-gray-600">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                />
                Section {s.section}: {s.accuracy}%
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent tests */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Recent Tests</h2>
          <button
            onClick={() => navigate('/history')}
            className="text-sm text-blue-600 hover:underline"
          >
            View all
          </button>
        </div>

        {stats.recent_tests.length === 0 ? (
          <EmptyState text="No tests taken yet. Upload your notes to generate your first test." />
        ) : (
          <div className="divide-y divide-gray-100">
            {stats.recent_tests.map((t) => (
              <div
                key={t.test_id}
                onClick={() => navigate(`/results/${t.test_id}`)}
                className="flex items-center justify-between py-3 cursor-pointer hover:bg-gray-50 px-2 -mx-2 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900 text-sm">{t.subject}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    {t.test_type} &middot; {t.date}
                  </p>
                </div>
                <div>
                  {t.status === 'evaluating' ? (
                    <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
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
    </div>
  )
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4">
      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-50 flex items-center justify-center mb-2 sm:mb-3">
        {icon}
      </div>
      <p className="text-xs text-gray-500 truncate">{label}</p>
      <p className="text-lg sm:text-xl font-bold text-gray-900 mt-0.5">{value}</p>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center h-40 text-sm text-gray-400 text-center px-4">
      {text}
    </div>
  )
}