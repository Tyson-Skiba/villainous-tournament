import { StepHeader } from '../components'
import { StatsView } from '../views'

interface StatsScreenProps {}

export const StatsScreen: React.FC<StatsScreenProps> = () => {
	return (
		<section>
			<StepHeader
				step="06 / STATS"
				title="The evil ledger"
				subtitle="See who keeps winning—or which villain does the winning."
			/>
			<StatsView />
		</section>
	)
}
