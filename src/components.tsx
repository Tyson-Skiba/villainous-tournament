import { useState, useEffect, Fragment } from 'react'
import { Moon, Sun, Trophy, RefreshCw, Plus, Minus, Users, X, Check, LayoutDashboard, Settings } from 'lucide-react'
import type { ReactNode } from 'react'

export function Button({
  children, onClick, disabled = false, variant = 'primary', icon,
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  icon?: ReactNode
}) {
  return (
    <button className={`button ${variant}`} disabled={disabled} onClick={onClick}>
      {icon}{children}
    </button>
  )
}

export function NavBar({
  onSettings,
  onStats,
  onVillains,
  theme,
  onTheme,
}: {
  onSettings: () => void
  onStats: () => void
  onVillains: () => void
  theme: 'light' | 'dark'
  onTheme: () => void
}) {
  const [open, setOpen] = useState(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const menu = document.querySelector('.settings-menu')
      const btn = document.querySelector('.settings-button')
      if (menu && !menu.contains(e.target as Node) && !btn?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <nav className="navbar">
      {/* Brand on left */}
      <div className="brand">
        VILLAINOUS <span>TOURNAMENT</span>
      </div>

      {/* Settings on right */}
      <div className="nav-actions" style={{ position: 'relative' }}>
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

            <button
              className="menu-item"
              onClick={() => {
                setOpen(false)
                onVillains()
              }}
            >
              <Users size={18} />
              Villains
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

export function SetCard({
  name, year, selected, image, onClick,
}: {
  name: string; year: number; selected: boolean; image?: { local: string | undefined; remote: string | undefined}; onClick: () => void
}) {
  return (
    <button className={`set-card ${selected ? 'selected' : ''}`} onClick={onClick}>
      <div className="set-image">
        {image?.local && (
          <img
            src={image.local}
            alt=""
            onError={(e) => {
              if (image.remote && e.currentTarget.src !== image.remote) e.currentTarget.src = image.remote
              else e.currentTarget.style.display = 'none'
            }}
          />
        )}
        <div className="image-fallback">
          {name.split(' ').map(x => x[0]).slice(0, 3).join('')}
        </div>
      </div>
      {selected && (
        <span className="check">
          <Check size={18} strokeWidth={3} />
        </span>
      )}
      <div className="set-name">{name}</div>
      <div className="set-year">{year}</div>
    </button>
  )
}

export function Counter({
  value, min, max, onChange,
}: { value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="counter">
      <button
        className="icon-button"
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        <Minus size={18} />
      </button>
      <strong>{value}</strong>
      <button
        className="icon-button"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        <Plus size={18} />
      </button>
    </div>
  )
}

export function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="close-button" aria-label="Close" onClick={onClick}>
      <X size={22} />
    </button>
  )
}

export function PrimaryButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return <Button onClick={onClick}>{children}</Button>
}

export function SecondaryButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return <Button variant='secondary' onClick={onClick}>{children}</Button>
}

export function RefreshButton({ disabled, onClick }: { disabled?: boolean; onClick: () => void }) {
  return (
    <button
      className="refresh-button"
      aria-label="Refresh character"
      disabled={disabled}
      onClick={onClick}
    >
      <RefreshCw size={19} />
    </button>
  )
}
