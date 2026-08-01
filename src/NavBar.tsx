import { useState, useEffect } from 'react'
import { Settings, LayoutDashboard, Trophy, Moon, Sun } from 'lucide-react'

export function NavBar({
  onSettings,
  onStats,
  theme,
  onTheme,
}: {
  onSettings: () => void
  onStats: () => void
  theme: 'light' | 'dark'
  onTheme: () => void
}) {
  const [open, setOpen] = useState(false)

  // Close menu when clicking outside
  useEffect(() => {
    const close = (e: MouseEvent) => {
      const menu = document.querySelector('.settings-menu')
      const btn = document.querySelector('.settings-button')
      if (menu && !menu.contains(e.target as Node) && !btn?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  return (
    <nav className="navbar">
      {/* Brand on left */}
      <div className="brand">
        VILLAINOUS <span>DRAW</span>
      </div>

      {/* Settings on right */}
      <div className="nav-actions">
        <button
          className="icon-button settings-button"
          aria-label="Settings"
          onClick={() => setOpen(!open)}
        >
          <Settings size={20} />
        </button>

        {open && (
          <div className="settings-menu">
            <button className="menu-item" onClick={onSettings}>
              <LayoutDashboard size={18} />
              My Collection
            </button>

            <button className="menu-item" onClick={onStats}>
              <Trophy size={18} />
              Leaderboard
            </button>

            <button className="menu-item" onClick={onTheme}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              Switch to {theme === 'dark' ? 'light' : 'dark'} mode
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
