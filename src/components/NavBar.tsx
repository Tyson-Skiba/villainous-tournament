import {
	Settings,
	LayoutDashboard,
	Trophy,
	Users,
	CloudDownload,
	KeyRound,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { ThemeSelector } from './ThemeSelector'
import { useAppContext } from '../context'

export const NavBar: React.FC = () => {
	const { setOverlay } = useAppContext()
	const [open, setOpen] = useState(false)

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			const menu = document.querySelector('.settings-menu')
			const btn = document.querySelector('.settings-button')
			if (
				menu &&
				!menu.contains(e.target as Node) &&
				!btn?.contains(e.target as Node)
			) {
				setOpen(false)
			}
		}
		document.addEventListener('mousedown', handler)
		return () => document.removeEventListener('mousedown', handler)
	}, [])

	return (
		<nav className="navbar">
			<div className="brand">
				VILLAINOUS <span>TOURNAMENT</span>
			</div>

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
						<button
							className="menu-item"
							onClick={() => setOverlay('collection')}
						>
							<LayoutDashboard size={18} />
							My Collection
						</button>

						<button className="menu-item" onClick={() => setOverlay('stats')}>
							<Trophy size={18} />
							Leaderboard
						</button>

						<button
							className="menu-item"
							onClick={() => {
								setOpen(false)
								setOverlay('villains')
							}}
						>
							<Users size={18} />
							Villains
						</button>

						<button
							className="menu-item"
							onClick={() => {
								setOpen(false)
								setOverlay('login')
							}}
						>
							<KeyRound size={18} />
							My Account
						</button>

						{/*
						<button className="menu-item" onClick={onTheme}>
							{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
							Switch to {theme === 'dark' ? 'light' : 'dark'} mode
						</button>
						*/}

						<ThemeSelector />
					</div>
				)}
			</div>
		</nav>
	)
}
