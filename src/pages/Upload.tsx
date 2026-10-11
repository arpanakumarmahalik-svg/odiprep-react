import { useState, useRef, type DragEvent, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { UploadCloud, FileText, X, Loader2 } from 'lucide-react'
import { api } from '../lib/api'
import type { UploadResponse } from '../types'

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'application/vnd.ms-powerpoint', // .ppt
  'text/plain', // .txt
]

const ACCEPTED_EXTENSIONS = '.pdf,.doc,.docx,.ppt,.pptx,.txt'

export default function Upload() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [subject, setSubject] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  function handleFileSelect(selected: File | null) {
    setError(null)
    if (!selected) return

    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setError('Please upload a PDF, DOCX, PPT, or TXT file.')
      return
    }

    setFile(selected)
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    const dropped = e.dataTransfer.files[0]
    handleFileSelect(dropped ?? null)
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    handleFileSelect(selected ?? null)
  }

  function removeFile() {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function handleSubmit() {
    setError(null)

    if (!subject.trim()) {
      setError('Please enter a subject name.')
      return
    }
    if (!file) {
      setError('Please select a file to upload.')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('subject', subject.trim())

      // Do NOT set a Content-Type header manually here — the browser
      // needs to set it automatically so it includes the boundary string.
      const res = await api.post<UploadResponse>('/upload', formData)

            localStorage.setItem('file_id', res.data.file_id)
      localStorage.setItem('subject', res.data.subject ?? subject.trim())

      // Save this upload into the notes history list
      const existing = JSON.parse(localStorage.getItem('notes_history') || '[]')
      const newEntry = {
        file_id: res.data.file_id,
        subject: res.data.subject ?? subject.trim(),
        filename: file.name,
        size_bytes: file.size,
        uploaded_at: new Date().toISOString(),
      }
      const alreadyExists = existing.some((n: { file_id: string }) => n.file_id === newEntry.file_id)
      const updated = alreadyExists ? existing : [newEntry, ...existing]
      localStorage.setItem('notes_history', JSON.stringify(updated))

      navigate('/tests')
    } catch (err) {
      setError('Upload failed. Please check your connection and try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Upload Your Notes</h1>
      <p className="text-sm text-gray-600 mb-6">
        Upload your study notes and we'll generate a mock test from them.
      </p>

      <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 space-y-5">
        {/* Subject input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject Name
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Data Structures"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Drop zone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes File
          </label>

          {!file ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
            >
              <UploadCloud className="w-10 h-10 text-blue-500 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700">
                Drag and drop your file here, or click to browse
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PDF, DOCX, PPT, or TXT
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_EXTENSIONS}
                onChange={handleInputChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="flex items-center justify-between border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={removeFile}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 shrink-0"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="px-3 py-2 rounded-lg bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading...
            </>
          ) : (
            'Upload and Continue'
          )}
        </button>
      </div>
    </div>
  )
}