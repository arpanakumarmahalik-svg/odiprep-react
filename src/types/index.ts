// ---------- Auth ----------
export interface UserProfile {
  id: string
  email: string
  full_name?: string
  branch?: string
  semester?: string
  college?: string
  created_at?: string
}

// ---------- Upload ----------
export interface UploadResponse {
  file_id: string
  subject: string
  filename: string
}

export interface NoteFile {
  file_id: string
  subject: string
  filename: string
  size_bytes?: number
  uploaded_at?: string
  tests_generated?: number
}

// ---------- Test Generation ----------
export type TestType = 'scetvt' | 'internal' | 'viva'

export interface GenerateTestRequest {
  file_id: string
  subject: string
  test_type: TestType
}

export interface GenerateTestResponse {
  test_id: string
}

// ---------- Test Questions ----------
export interface Question {
  id: string
  question_number: number
  text: string
  marks: number
  section?: 'A' | 'B' | 'C'
  options?: string[] // for viva/internal MCQ style
  correct_option?: number // index into options array (viva only)
  explanation?: string // shown after answering (viva only)
}

export interface TestData {
  test_id: string
  subject: string
  test_type: TestType
  duration_seconds: number
  total_marks: number
  questions: Question[]
}

// ---------- Submit Test ----------
export interface SubmitTestRequest {
  test_id: string
  photos: File[]
}

// ---------- Results ----------
export interface QuestionResult {
  id: string
  question_number: number
  text: string
  marks: number
  marks_scored: number
  student_answer: string
  expected_answer?: string
  feedback?: string
}

export interface TestResults {
  test_id: string
  subject: string
  score: number
  total_marks: number
  percentage: number
  section_breakdown?: {
    section: string
    scored: number
    total: number
  }[]
  questions: QuestionResult[]
}

// ---------- Violations / Lockouts ----------
export interface ViolationReport {
  user_id: string
  subject: string
  test_id: string
}

export interface LockStatus {
  subject: string
  is_locked: boolean
  locked_until?: string
}

// ---------- Dashboard ----------
export interface DashboardStats {
  tests_taken: number
  average_score: number
  study_hours: number
  day_streak: number
  score_progress: { date: string; score: number }[]
  section_accuracy: { section: string; accuracy: number }[]
  recent_tests: TestHistoryItem[]
}

// ---------- Test History ----------
export interface TestHistoryItem {
  test_id: string
  subject: string
  test_type: TestType
  date: string
  score?: number
  total_marks?: number
  status: 'completed' | 'evaluating'
}