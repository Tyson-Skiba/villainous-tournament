interface StepHeaderProps {
	step: string
	subtitle?: string
	title: string | (() => JSX.Element)
}

const isString = (val: string | (() => JSX.Element)): val is string =>
	typeof val === 'string'

export const StepHeader: React.FC<StepHeaderProps> = ({
	step,
	title,
	subtitle,
}) => {
	return (
		<header className="step-header">
			<div className="eyebrow">{step}</div>
			{isString(title) ? <h1 className="space-between">{title}</h1> : title()}
			{subtitle && <p>{subtitle}</p>}
		</header>
	)
}
