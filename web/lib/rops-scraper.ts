import { ROPS_CATEGORIES, type RopsCategory } from '@/lib/categories'
import { slugify } from '@/lib/slugify'

const ROPS_LIBRARY_URL =
  'https://rops.krakow.pl/innowacje-spoleczne/biblioteka-innowacji-spolecznych'
const ROPS_HOST = new URL(ROPS_LIBRARY_URL).host

export interface ScrapedInnovation {
  title: string
  description: string
  project?: string
  license?: string
  sourceUrl: string
}

export interface ScrapedCategory {
  category: RopsCategory
  items: ScrapedInnovation[]
}

const namedEntities: Record<string, string> = {
  amp: '&',
  apos: "'",
  bull: '•',
  copy: '©',
  hellip: '…',
  laquo: '«',
  ldquo: '“',
  lsquo: '‘',
  mdash: '—',
  nbsp: ' ',
  ndash: '–',
  raquo: '»',
  rdquo: '”',
  reg: '®',
  rsquo: '’',
  quot: '"',
  aogon: 'ą',
  Aogon: 'Ą',
  cacute: 'ć',
  Cacute: 'Ć',
  eogon: 'ę',
  Eogon: 'Ę',
  lstroke: 'ł',
  Lstroke: 'Ł',
  nacute: 'ń',
  Nacute: 'Ń',
  oacute: 'ó',
  Oacute: 'Ó',
  sacute: 'ś',
  Sacute: 'Ś',
  zacute: 'ź',
  Zacute: 'Ź',
  zdot: 'ż',
  Zdot: 'Ż',
  lt: '<',
  gt: '>',
}

function decodeHtml(value: string): string {
  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, code: string) => {
    if (code.startsWith('#x') || code.startsWith('#X')) {
      return String.fromCodePoint(Number.parseInt(code.slice(2), 16))
    }
    if (code.startsWith('#')) {
      return String.fromCodePoint(Number.parseInt(code.slice(1), 10))
    }
    return namedEntities[code] ?? entity
  })
}

function htmlToText(value: string): string {
  return decodeHtml(
    value
      .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
      .replace(/<br\b[^>]*>/gi, ' ')
      .replace(/<\/(?:p|div|li|h[1-6])\s*>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim()
}

function attributeValue(attributes: string, name: string): string | undefined {
  const match = attributes.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, 'i'))
  return match ? decodeHtml(match[1]) : undefined
}

function getLicense(descriptionHtml: string): string | undefined {
  const licenseLink = descriptionHtml.match(
    /href=["'][^"']*creativecommons\.org\/licenses\/([^/"']+)(?:\/([^/"']+))?[^"']*["']/i,
  )

  if (licenseLink) {
    const licenseName = licenseLink[1].toUpperCase().replace(/-/g, '-')
    return `CC ${licenseName}${licenseLink[2] ? ` ${licenseLink[2]}` : ''}`
  }

  const images = [...descriptionHtml.matchAll(/<img\b([^>]*)>/gi)]
  for (const image of images) {
    const src = attributeValue(image[1], 'src') ?? ''
    if (/cc[_-]?by/i.test(src)) return 'CC BY'
    if (/copyright|symbol-c/i.test(src)) return 'Copyright'
  }

  return undefined
}

function getProject(descriptionHtml: string): string | undefined {
  for (const match of descriptionHtml.matchAll(/<strong\b[^>]*>([\s\S]*?)<\/strong>/gi)) {
    const text = htmlToText(match[1])
    if (/INNOWACJA WYBRANA DO UPOWSZECHNIANIA/i.test(text)) return text
  }

  return undefined
}

function getDescription(descriptionHtml: string): string {
  const paragraph = descriptionHtml.match(/<p\b[^>]*>([\s\S]*?)<\/p\s*>/i)
  const text = htmlToText(paragraph?.[1] ?? descriptionHtml.replace(/<table\b[\s\S]*?<\/table\s*>/gi, ''))
  const projectStart = text.search(/INNOWACJA WYBRANA DO UPOWSZECHNIANIA/i)
  return (projectStart >= 0 ? text.slice(0, projectStart) : text).trim()
}

function getDetailDescription(html: string): string {
  const solution = html.match(
    /<h[1-6]\b[^>]*>\s*(?:1\.\s*)?Na czym polega rozwiązanie\?\s*<\/h[1-6]>\s*<p\b[^>]*>([\s\S]*?)<\/p\s*>/i,
  )
  return solution ? htmlToText(solution[1]) : ''
}

async function parseCategoryPage(html: string, category: RopsCategory): Promise<ScrapedInnovation[]> {
  const anchors = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a\s*>/gi)]
    .filter((match) => {
      const className = attributeValue(match[1], 'class') ?? ''
      return className.split(/\s+/).includes('news-list__title')
    })

  const categoryPath = `${new URL(ROPS_LIBRARY_URL).pathname}/${slugify(category)},`
  const items: ScrapedInnovation[] = []

  for (let index = 0; index < anchors.length; index++) {
    const anchor = anchors[index]
    const sourcePath = attributeValue(anchor[1], 'href')
    if (!sourcePath) throw new Error(`ROPS item in "${category}" has no source link`)

    const sourceUrl = new URL(sourcePath, ROPS_LIBRARY_URL)
    if (sourceUrl.host !== ROPS_HOST || !sourceUrl.pathname.startsWith(categoryPath)) {
      throw new Error(`Unexpected ROPS item URL for "${category}": ${sourceUrl.href}`)
    }

    const nextAnchorIndex = anchors[index + 1]?.index ?? html.length
    const cardHtml = html.slice(anchor.index, nextAnchorIndex)
    const descriptionTag = cardHtml.match(
      /<p\b[^>]*class=["'][^"']*\bnews-list__desc\b[^"']*["'][^>]*>/i,
    )
    if (!descriptionTag) {
      throw new Error(`ROPS item "${htmlToText(anchor[2])}" has no description`)
    }

    const descriptionStart = descriptionTag.index! + descriptionTag[0].length
    const readMoreIndex = cardHtml.search(/<a\b[^>]*class=["'][^"']*\bbtn-read-more\b/i)
    const descriptionHtml = cardHtml.slice(
      descriptionStart,
      readMoreIndex >= descriptionStart ? readMoreIndex : cardHtml.length,
    )
    const title = htmlToText(anchor[2])
    const description = getDescription(descriptionHtml)
    if (!title) {
      throw new Error(`ROPS item in "${category}" has no title`)
    }

    items.push({
      title,
      description,
      project: getProject(descriptionHtml),
      license: getLicense(descriptionHtml),
      sourceUrl: sourceUrl.href,
    })
  }

  await Promise.all(
    items.map(async (item) => {
      if (item.description) return

      const response = await fetch(item.sourceUrl, {
        cache: 'no-store',
        headers: { 'User-Agent': 'INNO-MOST innovation catalog importer' },
        signal: AbortSignal.timeout(30_000),
      })
      if (!response.ok) {
        throw new Error(`ROPS item "${item.title}" returned HTTP ${response.status}`)
      }

      item.description = getDetailDescription(await response.text())
      if (!item.description) {
        throw new Error(`ROPS item "${item.title}" in "${category}" has no description on its detail page`)
      }
    }),
  )

  if (items.length === 0) {
    throw new Error(`ROPS category "${category}" returned no innovation records`)
  }

  return items
}

async function scrapeCategory(category: RopsCategory): Promise<ScrapedCategory> {
  const url = `${ROPS_LIBRARY_URL}/${slugify(category)}`
  const response = await fetch(url, {
    cache: 'no-store',
    headers: { 'User-Agent': 'INNO-MOST innovation catalog importer' },
    signal: AbortSignal.timeout(30_000),
  })
  if (!response.ok) {
    throw new Error(`ROPS category "${category}" returned HTTP ${response.status}`)
  }

  const html = await response.text()
  return { category, items: await parseCategoryPage(html, category) }
}

export async function scrapeRopsInnovations(): Promise<ScrapedCategory[]> {
  return Promise.all(ROPS_CATEGORIES.map(scrapeCategory))
}
