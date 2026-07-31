import sets from '../data/sets.json'
import assets from '../data/assets.json'
import type { Asset, VillainSet } from './types'

export const villainSets = sets as VillainSet[]
export const villainAssets = assets as Asset[]

export const assetMap = new Map(villainAssets.map((asset) => [asset.assetId, asset]))

export function displayImage(assetId: string, face: boolean = false) {
  const asset = assetMap.get(assetId)

  return {
    local: asset ? `/assets/${(face ? 'faces/' : '')}${asset.filename}` : undefined,
    remote: asset?.wikiPage,
  }
}

export function selectedVillains(ownedSetIds: string[]) {
  return villainSets
    .filter((set) => ownedSetIds.includes(set.id))
    .flatMap((set) => set.villains)
}

export function villainCounts(ownedSetIds: string[]) {
  const counts = new Map<string, number>()
  for (const villain of selectedVillains(ownedSetIds)) {
    counts.set(villain, (counts.get(villain) ?? 0) + 1)
  }
  return counts
}

export function findSetForCharacter(character: string) {
  const match = sets.find(s => s.villains.includes(character))
  return match ? match.name : 'Unknown'
}

