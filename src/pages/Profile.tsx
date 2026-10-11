import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Trash2, Save, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { applyTheme, isDarkTheme } from '../lib/theme'

interface ProfileFields {
  full_name: string
  branch: string
  semester: string
  college: string
  email_notifications: boolean
  dark_mode: boolean
}

const DEFAULT_FIELDS: ProfileFields = {
  full_name: '',
  branch: '',
  semester: '',
  college: '',
  email_notifications: true,
  dark_mode: false,
}

export default function Profile() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const [fields, setFields] = useState<ProfileFields>({
    ...DEFAULT_FIELDS,
    dark_mode: isDarkTheme(),
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [newPassword, setNewPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    async function fetchProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .maybeSingle()

      if (!error && data) {
        setFields({
          full_name: data.full_name ?? '',
          branch: data.branch ?? '',
          semester: data.semester ?? '',
          college: data.college ?? '',
          email_notifications: data.email_notifications ?? true,
          dark_mode: isDarkTheme(),
        })
      }
      setLoading(false)
    }

    fetchProfile()
  }, [user])

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setSaveMessage(null)
    setError(null)

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      full_name: fields.full_name,
      branch: fields.branch,
      semester: fields.semester,
      college: fields.college,
      email_notifications: fields.email_notifications,
      dark_mode: fields.dark_mode,
    })

    setSaving(false)

    if (error) {
      setError('Could not save changes. Please try again.')
      return
    }

    setSaveMessage('Profile updated successfully.')
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault()

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.')
      return
    }

    setPasswordSaving(true)
    setPasswordError(null)
    setPasswordMessage(null)

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    setPasswordSaving(false)

    if (error) {
      setPasswordError(error.message)
      return
    }

    setPasswordMessage('Password updated successfully.')
    setNewPassword('')
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This cannot be undone.'
    )
    if (!confirmed) return

    // Actual account deletion requires a backend admin call (Supabase service role key
    // cannot be used from the frontend safely). Wire this to a real backend endpoint later.
    alert('Account deletion requires a backend endpoint. Please contact support for now.')
  }

  const initials = user?.email ? user.email.charAt(0).toUpperCase() : '?'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profile &amp; Settings</h1>

      {/* Profile card */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-semibold shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">
            {fields.full_name || 'Your Name'}
          </p>
          <p className="text-sm text-gray-500 truncate">{user?.email}</p>
          {(fields.branch || fields.semester || fields.college) && (
            <span className="inline-block mt-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              {[fields.branch, fields.semester, fields.college].filter(Boolean).join(' · ')}
            </span>
          )}
        </div>
      </div>

      {/* Account section */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Account</h2>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fields.full_name}
                onChange={(e) => setFields((f) => ({ ...f, full_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch
              </label>
              <input
                type="text"
                value={fields.branch}
                onChange={(e) => setFields((f) => ({ ...f, branch: e.target.value }))}
                placeholder="e.g. Information Technology"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Semester
              </label>
              <input
                type="text"
                value={fields.semester}
                onChange={(e) => setFields((f) => ({ ...f, semester: e.target.value }))}
                placeholder="e.g. 4th Semester"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                College
              </label>
              <input
                type="text"
                value={fields.college}
                onChange={(e) => setFields((f) => ({ ...f, college: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {saveMessage && (
            <div className="px-3 py-2 rounded-lg bg-green-50 text-green-700 text-sm">
              {saveMessage}
            </div>
          )}
          {error && (
            <div className="px-3 py-2 rounded-lg bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </form>

        <div className="border-t border-gray-100 mt-6 pt-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Change Password</h3>
          <form onSubmit={handleChangePassword} className="flex flex-col sm:flex-row gap-3">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              minLength={6}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={passwordSaving}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-60 whitespace-nowrap"
            >
              {passwordSaving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
          {passwordMessage && (
            <p className="text-sm text-green-700 mt-2">{passwordMessage}</p>
          )}
          {passwordError && (
            <p className="text-sm text-red-700 mt-2">{passwordError}</p>
          )}
        </div>
      </div>

      {/* Preferences section */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Preferences</h2>
        <div className="space-y-4">
          <ToggleRow
            label="Email Notifications"
            description="Get notified about test results and reminders."
            checked={fields.email_notifications}
            onChange={(val) => setFields((f) => ({ ...f, email_notifications: val }))}
          />
          <ToggleRow
            label="Dark Mode"
            description="Switch the app to a dark color theme."
            checked={fields.dark_mode}
            onChange={(val) => {
              setFields((f) => ({ ...f, dark_mode: val }))
              applyTheme(val)
            }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-4">
          Dark mode changes instantly. Click "Save Changes" above to keep your other changes.
        </p>
      </div>

      {/* Danger zone */}
      <div className="bg-white border border-red-200 rounded-xl p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Account Actions</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              signOut()
              navigate('/')
            }}
            className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
          <button
            onClick={handleDeleteAccount}
            className="flex items-center justify-center gap-2 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (val: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
          checked ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </div>
  )
}