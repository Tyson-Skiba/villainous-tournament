import React from 'react'
import { parseObjective } from '../utils/parseObjective'

interface ObjectiveCardProps {
	name: string
	objective: string
	iconUrl?: string
}

export const ObjectiveCard: React.FC<ObjectiveCardProps> = ({
	name,
	objective,
	iconUrl,
}) => {
	return (
		<div className="draw-row villain-row" key={name}>
			<div className="character-cell">
				{iconUrl && <img src={iconUrl} alt={name} />}
				<div className="character-info">
					<strong
						style={{
							fontSize: '16px',
							marginBottom: '0.5rem',
							marginTop: '0.5rem',
						}}
					>
						{name}
					</strong>
					<div className="objective-text">
						{parseObjective(objective ?? '')}
					</div>
				</div>
			</div>
		</div>
	)
}
