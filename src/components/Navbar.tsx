import { Menu } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Logo from './Logo'

interface NavbarProps {
  onMenuClick: () => void
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user, signOut } = useAuth()

  const initials = user?.email ? user.email.charAt(0).toUpperCase() : '?'

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="md:hidden">
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <Logo size={34} />
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-sm text-gray-600">{user?.email}</span>
          <button
            onClick={() => signOut()}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
            title="Sign out"
          >
            {initials}
          </button>
        </div>
      </div>
    </header>
  )
}