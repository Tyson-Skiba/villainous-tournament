import { Moon, Sun, SunMoon } from 'lucide-react'
import { useAppContext } from '../context'

export const ThemeSelector = () => {
	const { app, setTheme } = useAppContext()
	const { theme } = app

	return (
		<div className="theme-section">
			{theme.charAt(0).toUpperCase() + theme.slice(1)}
			<div className="flex">
				<button
					className="icon-button icon-button-variant-small"
					onClick={() => setTheme('light')}
				>
					<Sun
						size={18}
						color={theme === 'light' ? 'var(--accent)' : 'var(--text)'}
						fill={theme === 'light' ? 'var(--accent)' : 'none'}
					/>
				</button>
				<button
					className="icon-button icon-button-variant-small"
					onClick={() => setTheme('system')}
				>
					<SunMoon
						size={18}
						color={theme === 'system' ? 'var(--accent)' : 'var(--text)'}
						fill={theme === 'system' ? 'var(--accent)' : 'none'}
					/>
				</button>
				<button
					className="icon-button icon-button-variant-small"
					onClick={() => setTheme('dark')}
				>
					<Moon
						size={18}
						color={theme === 'dark' ? 'var(--accent)' : 'var(--text)'}
						fill={theme === 'dark' ? 'var(--accent)' : 'none'}
					/>
				</button>
			</div>
		</div>
	)
}
