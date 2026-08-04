import { Check } from 'lucide-react'

interface SetCardProps {
	name: string
	year: number
	selected: boolean
	image?: { local: string | undefined; remote: string | undefined }
	onClick: () => void
}

export const SetCard: React.FC<SetCardProps> = ({
	name,
	year,
	selected,
	image,
	onClick,
}) => (
	<button
		className={`set-card ${selected ? 'selected' : ''}`}
		onClick={onClick}
	>
		<div className="set-image">
			{image?.local && (
				<img
					src={image.local}
					alt=""
					onError={(e) => {
						if (image.remote && e.currentTarget.src !== image.remote)
							e.currentTarget.src = image.remote
						else e.currentTarget.style.display = 'none'
					}}
				/>
			)}
			<div className="image-fallback">
				{name
					.split(' ')
					.map((x) => x[0])
					.slice(0, 3)
					.join('')}
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
