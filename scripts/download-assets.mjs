import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const ASSETS_FILE = path.join(ROOT, 'data/assets.json')
const OUTPUT_DIR = path.join(ROOT, 'public/assets')

const API_URL =
  'https://disney-villainous.fandom.com/api.php'

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

function getFilename(asset) {
  // Prefer an explicitly supplied filename.
  if (asset.filename) {
    return asset.filename
  }

  // Otherwise generate one from the asset ID.
  return `${slugify(asset.assetId)}.jpg`
}

function getWikiTitle(asset) {
  if (asset.wikiPage) {
    const url = new URL(asset.wikiPage)
    return decodeURIComponent(
      url.pathname.split('/wiki/')[1]
    )
  }

  return asset.assetId.replaceAll(' ', '_')
}

async function getPageImage(title) {
  const params = new URLSearchParams({
    action: 'query',
    prop: 'pageimages',
    piprop: 'original',
    titles: title,
    format: 'json',
    origin: '*',
  })

  const response = await fetch(
    `${API_URL}?${params.toString()}`,
    {
      headers: {
        'User-Agent':
          'Disney-Villainous-Tournament-Asset-Downloader/1.0',
      },
    }
  )

  if (!response.ok) {
    throw new Error(
      `API returned ${response.status} ${response.statusText}`
    )
  }

  const data = await response.json()

  const pages = Object.values(data.query?.pages ?? {})

  if (!pages.length || pages[0].missing !== undefined) {
    throw new Error('Wiki page not found')
  }

  return pages[0].original?.source ?? null
}

async function downloadImage(url, destination) {
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Disney-Villainous-Tournament-Asset-Downloader/1.0',
      Referer:
        'https://disney-villainous.fandom.com/',
    },
  })

  if (!response.ok) {
    throw new Error(
      `Image returned ${response.status} ${response.statusText}`
    )
  }

  const contentType =
    response.headers.get('content-type') ?? ''

  if (!contentType.startsWith('image/')) {
    throw new Error(
      `Expected image but received ${contentType || 'unknown'}`
    )
  }

  const buffer = Buffer.from(
    await response.arrayBuffer()
  )

  if (buffer.length < 100) {
    throw new Error(
      `Image is suspiciously small (${buffer.length} bytes)`
    )
  }

  await fs.writeFile(destination, buffer)
}

let downloaded = 0
let skipped = 0
let failed = 0

console.log(
  `Checking ${assets.length} assets...\n`
)

for (const asset of assets) {
  const filename = getFilename(asset)
  const destination = path.join(
    OUTPUT_DIR,
    filename
  )

  // --------------------------------------------------
  // IMPORTANT:
  // If the file already exists, do absolutely nothing.
  // --------------------------------------------------

  try {
    await fs.access(destination)

    console.log(
      `↪ ${asset.assetId} — already exists`
    )

    skipped++
    continue
  } catch {
    // File doesn't exist, continue.
  }

  const title = getWikiTitle(asset)

  try {
    console.log(
      `↓ ${asset.assetId} — looking up ${title}`
    )

    const imageUrl = await getPageImage(title)

    if (!imageUrl) {
      throw new Error(
        'Wiki page has no page image'
      )
    }

    await downloadImage(
      imageUrl,
      destination
    )

    console.log(
      `✓ ${asset.assetId} -> public/assets/${filename}`
    )

    downloaded++
  } catch (error) {
    console.error(
      `✗ ${asset.assetId}: ${error.message}`
    )

    failed++
  }
}

console.log('\n------------------------------')
console.log('Asset download complete')
console.log('------------------------------')
console.log(`Downloaded: ${downloaded}`)
console.log(`Skipped:    ${skipped}`)
console.log(`Failed:     ${failed}`)
console.log(`Total:      ${assets.length}`)
console.log('------------------------------')