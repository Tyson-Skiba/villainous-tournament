import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()

const ASSETS_FILE = path.join(ROOT, 'data/assets.json')
const OUTPUT_DIR = path.join(ROOT, 'public/assets/faces/')

const API = 'https://disneyemojiblitz.fandom.com/api.php'

const assets = JSON.parse(
  await fs.readFile(ASSETS_FILE, 'utf8')
)

await fs.mkdir(OUTPUT_DIR, { recursive: true })

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

function filename(asset) {
  return `${slugify(asset.assetId)}.png`
}

const ALIASES = {
  'Queen of Hearts': 'The Queen of Hearts',
  'Evil Queen': 'The Evil Queen (Animated)',
  'Maleficent': 'Maleficent (Animated)',
  'Ratigan': 'Professor Ratigan',
  'Cruella De Vil': 'Cruella de Vil',
  'Pete': 'Winter Pete', // TODO: Re-colour
  'Horned King': 'The Horned King',
  'Sanderson Sisters': 'Young Winifred',
  'Ernesto de la Cruz': 'Ernesto',
  'Lady Tremaine': 'Lady Tremaine (Animated)'
}

async function getEmojiImage(title) {
  const page = ALIASES[title] ?? title

  const params = new URLSearchParams({
    action: 'query',
    titles: page,
    prop: 'pageimages',
    pithumbsize: 512,
    format: 'json',
    origin: '*',
  })

  const response = await fetch(`${API}?${params}`)

  if (!response.ok) {
    throw new Error('Failed to fetch page')
  }

  const json = await response.json()

  const wikiPage = Object.values(json.query.pages)[0]

  if (wikiPage.missing !== undefined) {
    throw new Error('Page not found')
  }

  return wikiPage.thumbnail?.source ?? null
}

async function download(url, destination) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Download failed (${response.status})`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())

  await fs.writeFile(destination, buffer)
}

let downloaded = 0
let skipped = 0
let failed = 0
const missed = []

for (const asset of assets) {
  if (asset.type !== 'villain') continue

  const destination = path.join(
    OUTPUT_DIR,
    filename(asset)
  )

  try {
    await fs.access(destination)
    skipped++
    console.log(`↪ ${asset.assetId}`)
    continue
  } catch {}

  try {
    console.log(`↓ ${asset.assetId}`)

    const imageUrl = await getEmojiImage(asset.assetId)

    if (!imageUrl) {
      throw new Error('No image URL')
    }

    await download(imageUrl, destination)

    downloaded++

    console.log(`✓ ${asset.assetId}`)
  } catch (err) {
    failed++
    console.log(`✗ ${asset.assetId}: ${err.message}`)
    missed.push(asset.assetId)
  }
}

console.log()
console.log('Downloaded:', downloaded)
console.log('Skipped:   ', skipped)
console.log('Failed:    ', failed)

console.log()
if (missed.length) console.log('Could not find faces for')
missed.forEach(z => console.log(z))