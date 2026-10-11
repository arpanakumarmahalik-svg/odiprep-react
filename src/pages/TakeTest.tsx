import { useEffect, useState, useRef, useCallback, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, X, Plus, Loader2 } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import type { TestData, TestType, Question } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorState from '../components/ErrorState'
import Timer from '../components/Timer'
import VivaQuiz from '../components/VivaQuiz'

const DURATION_SECONDS: Record<TestType, number> = {
  scetvt: 3 * 60 * 60,
  internal: 1 * 60 * 60,
  viva: 0, // untimed
}

interface AnswerPage {
  id: string
  file: File
  previewUrl: string
}

export default function TakeTest() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [testId, setTestId] = useState<string | null>(null)
  const [testData, setTestData] = useState<TestData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [locked, setLocked] = useState(false)

  const [pages, setPages] = useState<AnswerPage[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const violationReported = useRef(false)

  useEffect(() => {
    const storedTestId = localStorage.getItem('test_id')
    if (!storedTestId) {
      navigate('/upload')
      return
    }
    setTestId(storedTestId)
  }, [navigate])

  async function fetchTest() {
    if (!testId) return
    setLoading(true)
    setError(null)
    try {
      const res = await api.get<TestData>(`/get-test/${testId}`)
      setTestData({
        ...res.data,
        questions: res.data.questions ?? [],
      })
    } catch (err) {
      setError('Could not load the test. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTest()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId])

  const reportViolation = useCallback(async () => {
    if (violationReported.current) return
    if (!testData || !user || !testId) return
    if (testData.test_type === 'viva') return

    violationReported.current = true
    setLocked(true)

    try {
      await api.post('/report-violation', {
        user_id: user.id,
        subject: testData.subject,
        test_id: testId,
      })
    } catch {
      // Even if this fails, we still lock the UI on the frontend.
    }

    localStorage.removeItem(`test_end_time_${testId}`)
  }, [testData, user, testId])

  useEffect(() => {
    if (!testData || testData.test_type === 'viva') return

    const el = document.documentElement
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {})
    }
  }, [testData])

  useEffect(() => {
    if (!testData || testData.test_type === 'viva') return

    function handleVisibilityChange() {
      if (document.hidden) {
        reportViolation()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [testData, reportViolation])

  // Clean up preview URLs on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      pages.forEach((p) => URL.revokeObjectURL(p.previewUrl))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleAddPhotos(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newPages: AnswerPage[] = Array.from(files).map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }))

    setPages((prev) => [...prev, ...newPages])
    setSubmitError(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function removePage(id: string) {
    setPages((prev) => {
      const target = prev.find((p) => p.id === id)
      if (target) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((p) => p.id !== id)
    })
  }

  async function handleSubmitTest() {
    if (!testId) return

    if (pages.length === 0) {
      setSubmitError('Please add at least one photo of your answer sheet.')
      return
    }

    setSubmitError(null)
    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('test_id', testId)
      pages.forEach((p) => {
        formData.append('photos', p.file)
      })

      // Do NOT set a Content-Type header manually here — the browser
      // needs to set it automatically so it includes the boundary string.
      await api.post('/submit-test', formData)

      localStorage.removeItem(`test_end_time_${testId}`)
      navigate(`/results/${testId}`)
    } catch (err) {
      setSubmitError('Submission failed. Please check your connection and try again.')
      setSubmitting(false)
    }
  }

  function handleTimeUp() {
    // Auto-submit whatever photos have been added so far when time runs out.
    handleSubmitTest()
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error || !testData) {
    return <ErrorState message={error || 'No test data found.'} onRetry={fetchTest} />
  }

  if (locked) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-sm w-full text-center">
          <h2 className="font-bold text-lg text-gray-900 mb-2">
            Test Ended — Violation Detected
          </h2>
          <p className="text-sm text-gray-600 mb-5">
            You switched tabs or exited fullscreen during a proctored test.
            This subject has been temporarily locked.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (testData.questions.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-amber-50 text-amber-700 text-sm rounded-lg p-4">
          This test has no questions yet. Your backend's /get-test endpoint may
          not be returning questions correctly.
        </div>
      </div>
    )
  }

  // Viva Prep uses a completely different, untimed, one-question-at-a-time UI
  if (testData.test_type === 'viva') {
    return (
      <VivaQuiz
        subject={testData.subject}
        questions={testData.questions}
        onExit={() => navigate('/dashboard')}
      />
    )
  }

  const durationSeconds = DURATION_SECONDS[testData.test_type]
  const sections = groupBySection(testData.questions)

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header with timer */}
      <div className="sticky top-0 z-10 bg-gray-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 mb-6 flex items-center justify-between flex-wrap gap-3 border-b border-gray-200">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{testData.subject}</h1>
          <p className="text-xs sm:text-sm text-gray-500 capitalize">{testData.test_type} exam</p>
        </div>
        {testId && (
          <Timer
            testId={testId}
            durationSeconds={durationSeconds}
            onTimeUp={handleTimeUp}
          />
        )}
      </div>

      {/* Questions grouped by section */}
      <div className="space-y-8">
        {sections.map(({ section, questions }) => (
          <div key={section ?? 'all'}>
            {section && (
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Section {section}
              </h2>
            )}
            <div className="space-y-3">
              {questions.map((q) => (
                <QuestionCard key={q.id} question={q} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Answer sheet photo upload */}
      <div className="mt-8 bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold text-gray-900 mb-1">Upload Your Answer Sheets</h2>
        <p className="text-sm text-gray-500 mb-4">
          Take clear photos of each page of your handwritten answers, in order.
        </p>

        {pages.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 mb-4">
            {pages.map((page, index) => (
              <div key={page.id} className="relative group">
                <img
                  src={page.previewUrl}
                  alt={`Page ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
                <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                  Page {index + 1}
                </span>
                <button
                  onClick={() => removePage(page.id)}
                  className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-300 rounded-lg py-4 text-sm font-medium text-gray-600 hover:border-blue-400 hover:bg-blue-50"
        >
          <Camera className="w-4 h-4" />
          <Plus className="w-4 h-4" />
          Add Page
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg"
          multiple
          onChange={handleAddPhotos}
          className="hidden"
        />

        {submitError && (
          <div className="mt-4 px-3 py-2 rounded-lg bg-red-50 text-red-700 text-sm">
            {submitError}
          </div>
        )}

        <button
          onClick={handleSubmitTest}
          disabled={submitting}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Test'
          )}
        </button>
      </div>
    </div>
  )
}

function QuestionCard({ question }: { question: Question }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-gray-900">
          <span className="font-semibold">Q{question.question_number}.</span>{' '}
          {question.text}
        </p>
        <span className="shrink-0 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
          {question.marks} marks
        </span>
      </div>

      {question.options && question.options.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {question.options.map((opt, i) => (
            <p key={i} className="text-sm text-gray-600 pl-4">
              {String.fromCharCode(97 + i)}) {opt}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

function groupBySection(questions: Question[]) {
  const hasSections = questions.some((q) => q.section)

  if (!hasSections) {
    return [{ section: null as string | null, questions }]
  }

  const order: ('A' | 'B' | 'C')[] = ['A', 'B', 'C']
  return order
    .map((section) => ({
      section,
      questions: questions.filter((q) => q.section === section),
    }))
    .filter((group) => group.questions.length > 0)
}