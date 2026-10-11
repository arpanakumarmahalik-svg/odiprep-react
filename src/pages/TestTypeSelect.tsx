import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Clock, Mic, Lock, CheckCircle2 } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import type { TestType, LockStatus } from '../types'
import { formatCountdown, isStillLocked } from '../lib/lockout'

interface TestTypeOption {
  type: TestType
  title: string
  description: string
  marks: string
  duration: string
  proctored: boolean
  icon: React.ReactNode
}

const TEST_TYPES: TestTypeOption[] = [
  {
    type: 'scetvt',
    title: 'SCETVT Semester Exam',
    description: 'Full pattern exam matching the real SCETVT semester test.',
    marks: '70 marks',
    duration: '3 hours',
    proctored: true,
    icon: <FileText className="w-6 h-6 text-blue-600" />,
  },
  {
    type: 'internal',
    title: 'Internal Exam',
    description: 'Shorter test matching your college internal exam pattern.',
    marks: '20 marks',
    duration: '1 hour',
    proctored: true,
    icon: <Clock className="w-6 h-6 text-blue-600" />,
  },
  {
    type: 'viva',
    title: 'Practical Viva Prep',
    description: 'Untimed MCQ practice with instant feedback. No pressure.',
    marks: '15 questions',
    duration: 'Untimed',
    proctored: false,
    icon: <Mic className="w-6 h-6 text-blue-600" />,
  },
]

export default function TestTypeSelect() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [subject, setSubject] = useState<string | null>(null)
  const [fileId, setFileId] = useState<string | null>(null)
  const [lockedSubjects, setLockedSubjects] = useState<Record<string, boolean>>({})
  const [lockedUntil, setLockedUntil] = useState<string | undefined>(undefined)
  const [, forceTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => forceTick((n) => n + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const storedSubject = localStorage.getItem('subject')
    const storedFileId = localStorage.getItem('file_id')
    setSubject(storedSubject)
    setFileId(storedFileId)

    if (!storedSubject || !storedFileId) {
      navigate('/upload')
    }
  }, [navigate])

  useEffect(() => {
    if (!user || !subject) return

    async function checkLock() {
      try {
        const res = await api.get<LockStatus>(`/lock-status/${user!.id}/${subject}`)
        const stillLocked = isStillLocked(res.data.locked_until) || res.data.is_locked
        setLockedSubjects((prev) => ({ ...prev, [subject!]: stillLocked }))
        setLockedUntil(res.data.locked_until)
      } catch {
        // If the lock check fails, don't block the user — assume unlocked
        setLockedSubjects((prev) => ({ ...prev, [subject!]: false }))
      }
    }

    checkLock()
  }, [user, subject])

  function handleSelect(type: TestType) {
    if (lockedSubjects[subject ?? '']) return
    localStorage.setItem('test_type', type)
    navigate('/test/review')
  }

  if (!subject || !fileId) {
    return null
  }

  const isLocked = lockedSubjects[subject] ?? false

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Choose Test Type</h1>
      <p className="text-sm text-gray-600 mb-6">
        Notes uploaded for <span className="font-medium text-gray-900">{subject}</span>.
        Pick how you want to practice.
      </p>

      {isLocked && (
        <div className="mb-5 flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 text-red-700 text-sm">
          <Lock className="w-4 h-4 shrink-0" />
          {subject} is locked due to a proctoring violation.
          {lockedUntil && (
            <>
              {' '}Unlocks in{' '}
              <span className="font-mono font-semibold">{formatCountdown(lockedUntil)}</span>
            </>
          )}
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEST_TYPES.map((option) => {
          const disabled = option.proctored && isLocked
          return (
            <button
              key={option.type}
              onClick={() => handleSelect(option.type)}
              disabled={disabled}
              className={`text-left bg-white border rounded-xl p-5 transition-colors ${
                disabled
                  ? 'border-gray-200 opacity-50 cursor-not-allowed'
                  : 'border-gray-200 hover:border-blue-400 hover:shadow-sm cursor-pointer'
              }`}
            >
              <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
                {option.icon}
              </div>
              <h3 className="font-semibold text-gray-900">{option.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{option.description}</p>

              <div className="flex items-center gap-3 mt-4 text-xs text-gray-500">
                <span>{option.marks}</span>
                <span>&middot;</span>
                <span>{option.duration}</span>
              </div>

              <div className="mt-3">
                {disabled ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                    <Lock className="w-3 h-3" />
                    Locked
                  </span>
                ) : option.proctored ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                    Proctored
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    No pressure
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}