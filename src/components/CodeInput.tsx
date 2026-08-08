import { useState, useRef } from 'react'

interface CodeInputProps {
	initialValue: string
	onChange: (code: string) => void
}

export const CodeInput: React.FC<CodeInputProps> = ({
	initialValue,
	onChange,
}) => {
	const [code, setCode] = useState(
		initialValue && initialValue.length === 4
			? initialValue.split('')
			: ['', '', '', ''],
	)
	const inputsRef = useRef<HTMLInputElement[]>([])

	return (
		<div className="number-input-container">
			{code.map((digit, index) => (
				<input
					key={index}
					type="number"
					value={digit}
					className="number-input"
					ref={(el) => (inputsRef.current[index] = el!)}
					onChange={(e) => {
						// Only accept numbers
						const value = e.target.value
						if (!/^\d*$/.test(value)) return

						const newCode = [...code]
						// Take only the last character if user types fast
						newCode[index] = value.slice(-1)
						setCode(newCode)

						// Forward the code result if complete
						if (newCode.every((num) => num !== '') && onChange) {
							onChange(newCode.join(''))
						}

						// Auto-focus next input
						if (value && index < 3) {
							inputsRef.current[index + 1].focus()
						}
					}}
					onKeyDown={(e) => {
						if (e.key === 'Backspace' && !code[index] && index > 0) {
							inputsRef.current[index - 1].focus()
						}
					}}
					onPaste={(e) => {
						e.preventDefault()
						const pasteData = e.clipboardData.getData('text').trim()

						// Validate that the pasted text is numeric
						if (!/^\d+$/.test(pasteData)) return

						const pasteValues = pasteData.slice(0, 4).split('')
						const newCode = [...code]

						pasteValues.forEach((char, index) => {
							if (index < 4) newCode[index] = char
						})

						setCode(newCode)

						// Focus the last filled input or the last input slot
						const focusIndex = Math.min(pasteValues.length, 3)
						inputsRef.current[focusIndex].focus()

						// Trigger complete if 4 digits were pasted
						if (pasteValues.length >= 4 && onChange) {
							onChange(pasteValues.slice(0, 4).join(''))
						}
					}}
					placeholder="-"
				/>
			))}
		</div>
	)
}
