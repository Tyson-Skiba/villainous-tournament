export const getCssVariable = (variable: string) =>
	getComputedStyle(document.documentElement).getPropertyValue(variable).trim()
