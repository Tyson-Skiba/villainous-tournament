import { useState, useCallback, useMemo } from 'react'
import { CloseButton } from '../components/Button'

interface OverlayState {
	overlay: string
	setOverlay: (val: string) => void
}

interface OverlayProps {
	height: number
	children: React.ReactNode
}

const Overlay: React.FC<OverlayProps & OverlayState> = ({
	height,
	overlay,
	children,
	setOverlay,
}) => {
	return (
		<div
			className="overlay"
			role="dialog"
			aria-modal="true"
			style={{ background: 'none' }}
			onClick={() => setOverlay('')}
		>
			<div
				className="drawer"
				style={{
					top: `${100 - height}%`,
					height: `${height}%`,
				}}
				onClick={(evt) => {
					evt.preventDefault()
					evt.stopPropagation()
				}}
			>
				<CloseButton onClick={() => setOverlay('')} />
				{children}
			</div>
		</div>
	)
}

export const useOverlay = (): [
	string,
	(val: string) => void,
	React.FC<OverlayProps>,
] => {
	const [overlay, setOverlayInner] = useState('')

	const setOverlay = useCallback(
		(ovly: string) => {
			if (!ovly) document.body.classList.remove('no-scroll')
			else document.body.classList.add('no-scroll')

			setOverlayInner(ovly)
		},
		[setOverlayInner],
	)

	const OverlayWrapper: React.FC<OverlayProps> = useMemo(() => {
		const WrappedOverlay: React.FC<OverlayProps> = ({ height, children }) => {
			if (!overlay) return null

			return (
				<Overlay height={height} overlay={overlay} setOverlay={setOverlay}>
					{children}
				</Overlay>
			)
		}

		WrappedOverlay.displayName = 'OverlayWrapper'
		return WrappedOverlay
	}, [overlay, setOverlay])

	return [overlay, setOverlay, OverlayWrapper]
}
