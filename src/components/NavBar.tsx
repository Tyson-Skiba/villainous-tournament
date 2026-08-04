import {
	Settings,
	LayoutDashboard,
	Trophy,
	Users,
	CloudDownload,
	Sun,
	Moon,
} from 'lucide-react'
import { useState, useEffect } from 'react'

interface NavBarProps {
	onSettings: () => void
	onStats: () => void
	onVillains: () => void
	theme: 'light' | 'dark'
	onTheme: () => void
}

export const NavBar: React.FC<NavBarProps> = ({
	onSettings,
	onStats,
	onVillains,
	theme,
	onTheme,
}) => {
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

						<button
							className="menu-item"
							onClick={() => {
								setOpen(false)
								onVillains()
							}}
						>
							<CloudDownload size={18} />
							Install app
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
