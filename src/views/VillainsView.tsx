import { useState } from 'react'
import { villainSets, displayImage } from '../utils/data'
import { Villain } from '../types'
import { ObjectiveCard } from '../components/ObjectiveCard'

import villainObjectives from '../../data/villains.json'

const objectives = villainObjectives as Record<string, Villain>

export const VillainsView: React.FC = () => {
	const [expanded, setExpanded] = useState<string[]>([])

	return (
		<div className="villains-view">
			{villainSets.map((set) => {
				const open = expanded.includes(set.id)

				return (
					<div className="villain-set" key={set.id}>
						<button
							className="round-title villain-set-header"
							onClick={() =>
								setExpanded((current) =>
									current.includes(set.id)
										? current.filter((id) => id !== set.id)
										: [...current, set.id],
								)
							}
						>
							<span>{set.name}</span>
							<span>{open ? '−' : '+'}</span>
						</button>

						{open && (
							<div className="draw-table">
								{set.villains.map((name) => {
									const img = displayImage(name, true)
									const info = objectives[name]

									return (
										<ObjectiveCard
											name={name}
											objective={info.objective}
											iconUrl={img.local}
										/>
									)
								})}
							</div>
						)}
					</div>
				)
			})}
		</div>
	)
}
