import { Minus, Plus } from 'lucide-react'

interface CounterProps {
	value: number
	min: number
	max: number
	onChange: (num: number) => void
}

export const Counter: React.FC<CounterProps> = ({
	value,
	min,
	max,
	onChange,
}) => {
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
