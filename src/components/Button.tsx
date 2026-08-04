import { RefreshCw, X } from 'lucide-react'

interface ButtonProps {
	children: React.ReactNode
	onClick?: () => void
	disabled?: boolean
	variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
	icon?: React.ReactNode
}

interface RefreshProps {
	disabled?: boolean
	onClick: () => void
}

interface CloseProps {
	onClick: () => void
}

export const Button: React.FC<ButtonProps> = ({
	children,
	onClick,
	disabled = false,
	variant = 'primary',
	icon,
}) => {
	return (
		<button
			className={`button ${variant}`}
			disabled={disabled}
			onClick={onClick}
		>
			{icon}
			{children}
		</button>
	)
}

export const CloseButton: React.FC<CloseProps> = ({ onClick }) => (
	<button className="close-button" aria-label="Close" onClick={onClick}>
		<X size={22} />
	</button>
)

export const RefreshButton: React.FC<RefreshProps> = ({
	disabled,
	onClick,
}) => {
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
