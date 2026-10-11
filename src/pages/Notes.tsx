import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Search, UploadCloud } from 'lucide-react'
import type { NoteFile } from '../types'

export default function Notes() {
  const navigate = useNavigate()
  const [notes, setNotes] = useState<NoteFile[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('notes_history') || '[]')
    setNotes(stored)
  }, [])

  function formatFileSize(bytes?: number) {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  function formatDate(iso?: string) {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  function handleGenerateAgain(note: NoteFile) {
    localStorage.setItem('file_id', note.file_id)
    localStorage.setItem('subject', note.subject)
    navigate('/tests')
  }

  const filteredNotes = notes.filter((n) =>
    n.subject.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Notes</h1>
          <p className="text-sm text-gray-600">
            Files you've uploaded, ready to generate more tests from.
          </p>
        </div>
        <button
          onClick={() => navigate('/upload')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          <UploadCloud className="w-4 h-4" />
          Upload New Notes
        </button>
      </div>

      {/* Search bar */}
      {notes.length > 0 && (
        <div className="relative mb-5">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by subject..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {notes.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 mb-4">
            You haven't uploaded any notes yet.
          </p>
          <button
            onClick={() => navigate('/upload')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Upload Your First Notes
          </button>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center text-sm text-gray-400 py-16">
          No notes match "{search}".
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.file_id}
              className="bg-white border border-gray-200 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {note.subject}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{note.filename}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatFileSize(note.size_bytes)}
                    {note.size_bytes && note.uploaded_at ? ' · ' : ''}
                    {formatDate(note.uploaded_at)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleGenerateAgain(note)}
                className="w-full mt-3 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg py-2 hover:bg-blue-50"
              >
                Generate Test Again
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}