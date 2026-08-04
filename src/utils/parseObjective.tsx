import React from 'react'

export function parseObjective(text: string): React.ReactNode[] {
	if (!text) return []

	const paragraphs = text
		.split(/\n\n+/)
		.map((p) => p.trim())
		.filter(Boolean)

	return paragraphs.map((para, index) => {
		const lines = para
			.split('\n')
			.map((l) => l.trim())
			.filter(Boolean)

		const isList = lines.every(
			(line) => line.startsWith('* ') || line.startsWith('- '),
		)

		if (isList) {
			return (
				<ul key={index} className="objective-steps">
					{lines.map((line, i) => (
						<li key={i}>{line.slice(2)}</li>
					))}
				</ul>
			)
		}

		return <p key={index}>{para}</p>
	})
}
