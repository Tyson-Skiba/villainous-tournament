import { CloseButton, StepHeader, SetCard, Button } from '../components'
import { useAppContext, useGameContext } from '../context'
import { villainSets, displayImage, selectedVillains } from '../utils/data'

export const CollectionView: React.FC = () => {
	const { app, commit, setOverlay } = useAppContext()
	const { draftOwned, setDraftOwned } = useGameContext()

	// TODO: Convert to use useOverlay hook
	return (
		<div className="overlay" role="dialog" aria-modal="true">
			<div className="drawer large">
				<CloseButton onClick={() => setOverlay(undefined)} />

				<StepHeader
					step="COLLECTION"
					title="My Collection"
					subtitle="Select every Villainous box you own."
				/>

				<div className="set-grid">
					{villainSets.map((set) => (
						<SetCard
							key={set.id}
							name={set.name}
							year={set.year}
							image={displayImage(set.id)}
							selected={draftOwned.includes(set.id)}
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
						onClick={() => {
							commit({
								...app,
								ownedSetIds: draftOwned,
							})

							setOverlay('collection')
						}}
					>
						Save Collection
					</Button>
				</div>
			</div>
		</div>
	)
}
