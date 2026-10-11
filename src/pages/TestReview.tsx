import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Clock, ListChecks, AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import type { GenerateTestResponse, TestType } from '../types'

interface PatternRow {
  section: string
  questions: string
  attempt: string
  marksEach: string
  total: string
}

interface TestTypeConfig {
  label: string
  totalMarks: number
  durationLabel: string
  questionCount: number
  pattern: PatternRow[] | null
  rules: string[]
}

const CONFIGS: Record<TestType, TestTypeConfig> = {
  scetvt: {
    label: 'SCETVT Semester Exam',
    totalMarks: 70,
    durationLabel: '3 hours',
    questionCount: 21,
    pattern: [
      { section: 'A', questions: '10', attempt: 'All 10', marksEach: '2', total: '20' },
      { section: 'B', questions: '7', attempt: 'Any 6', marksEach: '5', total: '30' },
      { section: 'C', questions: '4', attempt: 'Any 2', marksEach: '10', total: '20' },
    ],
    rules: [
      'Answer Section A completely — all 10 questions are compulsory.',
      'In Section B, attempt any 6 out of 7 questions.',
      'In Section C, attempt any 2 out of 4 questions.',
      'Write your answers on paper and upload photos at the end.',
      'Do not switch tabs or exit fullscreen once the test starts.',
    ],
  },
  internal: {
    label: 'Internal Exam',
    totalMarks: 20,
    durationLabel: '1 hour',
    questionCount: 8,
    pattern: null,
    rules: [
      '8 questions will be shown, attempt any 4.',
      'Each question has 2 options — (a) and (b). Answer either one.',
      'Each question carries 5 marks.',
      'Write your answers on paper and upload photos at the end.',
      'Do not switch tabs or exit fullscreen once the test starts.',
    ],
  },
  viva: {
    label: 'Practical Viva Prep',
    totalMarks: 15,
    durationLabel: 'Untimed',
    questionCount: 15,
    pattern: null,
    rules: [
      '15 multiple choice questions, one at a time.',
      'You will see instant feedback after each answer.',
      'This is for practice — there is no time limit and no proctoring.',
      'You can retake this as many times as you like.',
    ],
  },
}

export default function TestReview() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [subject, setSubject] = useState<string | null>(null)
  const [fileId, setFileId] = useState<string | null>(null)
  const [testType, setTestType] = useState<TestType | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedSubject = localStorage.getItem('subject')
    const storedFileId = localStorage.getItem('file_id')
    const storedTestType = localStorage.getItem('test_type') as TestType | null

    if (!storedSubject || !storedFileId || !storedTestType) {
      navigate('/upload')
      return
    }

    setSubject(storedSubject)
    setFileId(storedFileId)
    setTestType(storedTestType)
  }, [navigate])

  async function handleStartTest() {
    if (!fileId || !subject || !testType) return

    // Fullscreen must be requested directly from a click — this is the last
    // point where we have a real user gesture before navigating away.
    if (testType !== 'viva') {
      const el = document.documentElement
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {})
      }
    }

    setError(null)
    setGenerating(true)

    try {
      const res = await api.post<GenerateTestResponse>('/generate-test', {
        file_id: fileId,
        subject,
        test_type: testType,
        user_id: user?.id,
      })

      localStorage.setItem('test_id', res.data.test_id)
      navigate('/test/take')
    } catch (err) {
      setError('Could not generate the test. Please try again.')
      setGenerating(false)
    }
  }

  if (!subject || !fileId || !testType) {
    return null
  }

  const config = CONFIGS[testType]

  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <h2 className="font-semibold text-gray-900">Generating your test...</h2>
        <p className="text-sm text-gray-500 mt-1">
          This can take 30–60 seconds. Please don't close this page.
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/tests')}
        className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Go back
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">Review &amp; Start</h1>
      <p className="text-sm text-gray-600 mb-6">
        Check the details below before you begin.
      </p>

      {/* Summary card */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4 flex items-start gap-4">
        <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
          <FileText className="w-6 h-6 text-blue-600" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900">{subject}</p>
          <p className="text-sm text-gray-500">Source: uploaded notes</p>
          <span className="inline-block mt-2 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
            {config.label}
          </span>
        </div>
      </div>

      {/* Stat boxes */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatBox icon={<ListChecks className="w-5 h-5 text-blue-600" />} label="Total Marks" value={config.totalMarks} />
        <StatBox icon={<Clock className="w-5 h-5 text-blue-600" />} label="Duration" value={config.durationLabel} />
        <StatBox icon={<FileText className="w-5 h-5 text-blue-600" />} label="Questions" value={config.questionCount} />
      </div>

      {/* Pattern table (SCETVT only) */}
      {config.pattern && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 overflow-x-auto">
          <h2 className="font-semibold text-gray-900 mb-3">Exam Pattern</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="py-2">Section</th>
                <th className="py-2">Questions</th>
                <th className="py-2">Attempt</th>
                <th className="py-2">Marks each</th>
                <th className="py-2">Total</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {config.pattern.map((row) => (
                <tr key={row.section} className="border-b border-gray-50 last:border-0">
                  <td className="py-2 font-medium">{row.section}</td>
                  <td className="py-2">{row.questions}</td>
                  <td className="py-2">{row.attempt}</td>
                  <td className="py-2">{row.marksEach}</td>
                  <td className="py-2">{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Rules */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">Rules</h2>
        <ul className="space-y-2">
          {config.rules.map((rule, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
              {rule}
            </li>
          ))}
        </ul>
      </div>

      {/* Warning box */}
      {testType !== 'viva' && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            This test is timed and proctored. Switching tabs or exiting
            fullscreen will end your test immediately and lock this subject.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => navigate('/tests')}
          className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50"
        >
          Go Back
        </button>
        <button
          onClick={handleStartTest}
          className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          Start Test
        </button>
      </div>
    </div>
  )
}

function StatBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center mx-auto mb-2">
        {icon}
      </div>
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}