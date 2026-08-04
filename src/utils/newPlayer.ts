export const newPlayer = (index: number): Player => ({
	id: crypto.randomUUID(),
	name: `Player ${index}`,
})
