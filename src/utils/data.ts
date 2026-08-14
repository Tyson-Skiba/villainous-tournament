import sets from '../../data/sets.json'
import assets from '../../data/assets.json'
import type { Asset, VillainSet } from '../types'

export const villainSets = sets as VillainSet[]
export const villainAssets = assets as Asset[]

export const assetMap = new Map(
	villainAssets.map((asset) => [asset.assetId, asset]),
)

export const displayImage = (assetId: string, face: boolean = false) => {
	const asset = assetMap.get(assetId)

	return {
		local: asset
			? `/assets/${face ? 'faces/' : ''}${asset.filename}`
			: undefined,
		remote: asset?.wikiPage,
	}
}

export const selectedVillains = (ownedSetIds: string[]) => {
	return villainSets
		.filter((set) => ownedSetIds.includes(set.id))
		.flatMap((set) => set.villains)
}

export const villainCounts = (ownedSetIds: string[]) => {
	const counts = new Map<string, number>()
	for (const villain of selectedVillains(ownedSetIds)) {
		counts.set(villain, (counts.get(villain) ?? 0) + 1)
	}
	return counts
}

export const findSetForCharacter = (character: string) => {
	const match = sets.find((s) => s.villains.includes(character))
	return match ? match.name : 'Unknown'
}

export const shuffle = <T>(items: T[]) => {
	const copy = [...items]
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[copy[i], copy[j]] = [copy[j], copy[i]]
	}
	return copy
}
