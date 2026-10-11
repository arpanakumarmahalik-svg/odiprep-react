import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload'
import TestTypeSelect from './pages/TestTypeSelect'
import TestReview from './pages/TestReview'
import TakeTest from './pages/TakeTest'
import Results from './pages/Results'
import Profile from './pages/Profile'
import TestHistory from './pages/TestHistory'
import Notes from './pages/Notes'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/AppLayout'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Upload />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tests"
        element={
          <ProtectedRoute>
            <AppLayout>
              <TestTypeSelect />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/test/review"
        element={
          <ProtectedRoute>
            <AppLayout>
              <TestReview />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/test/take"
        element={
          <ProtectedRoute>
            <AppLayout>
              <TakeTest />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/results/:test_id"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Results />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Profile />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <AppLayout>
              <TestHistory />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notes"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Notes />
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App