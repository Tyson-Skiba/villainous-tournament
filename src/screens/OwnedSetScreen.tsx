import { StepHeader, SetCard, Button } from '../components'
import { useAppContext, useGameContext } from '../context'
import { villainSets, displayImage, selectedVillains } from '../data'

interface OwnedSetProps {}

export const OwnedSetScreen: React.FC<OwnedSetProps> = () => {
	const { app, commit, setScreen } = useAppContext()
	const { draftOwned, setDraftOwned } = useGameContext()

	return (
		<section>
			<StepHeader
				step="01 / SETS"
				title="What do you own?"
				subtitle="Select every Villainous box you have. Duplicate villains across boxes count as separate copies."
			/>
			<div className="set-grid">
				{villainSets.map((set) => (
					<SetCard
						key={set.id}
						name={set.name}
						year={set.year}
						selected={draftOwned.includes(set.id)}
						image={displayImage(set.id)}
						onClick={() =>
							setDraftOwned((prev) =>
								prev.includes(set.id)
									? prev.filter((id) => id !== set.id)
									: [...prev, set.id],
							)
						}
					/>
				))}
			</div>
			<div className="sticky-action">
				<div className="selection-summary">
					{selectedVillains(draftOwned).length} character copies available
				</div>
				<Button
					disabled={!draftOwned.length}
					onClick={() => {
						commit({ ...app, ownedSetIds: draftOwned })
						setScreen('players')
					}}
				>
					Save sets
				</Button>
			</div>
		</section>
	)
}
