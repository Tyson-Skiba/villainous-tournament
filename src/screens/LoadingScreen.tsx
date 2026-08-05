import { LoaderCircle } from 'lucide-react'

export const LoadingScreen: React.FC = () => {
	return (
		<div className="loader">
			<LoaderCircle size={50} className="spinner" />
		</div>
	)
}
