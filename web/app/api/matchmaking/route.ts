import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import {
  createChatCompletion,
  isOpenRouterConfigured,
  DEFAULT_OPENROUTER_MODEL,
} from '@/lib/openrouter'
import fs from 'fs'
import path from 'path'

interface InnovationItem {
  id: string | number
  title: string
  category?: string | null
  patientProblem?: string | null
  proposedSolution?: string | null
  ropsReport?: string | null
  status?: string | null
  availableForTesting?: boolean | null
}

const POLISH_STOPWORDS = new Set([
  'i', 'w', 'na', 'z', 'do', 'o', 'ze', 'za', 'dla', 'jak', 'czy', 'jest',
  'sa', 'sie', 'nie', 'to', 'co', 'go', 'jej', 'jego', 'ich', 'tym', 'ten',
  'ta', 'te', 'mam', 'ma', 'mamy', 'oraz', 'albo', 'lub', 'bardzo', 'potrzebuje',
  'szukam', 'pomocy', 'problemu', 'problem', 'chce', 'chcialbym', 'jakby'
])

function fallbackMatch(query: string, innovations: InnovationItem[]): {
  matched: InnovationItem | null
  confidence: number
  explanation: string
  actionAdvice: string
  gapAnalysis: string
} {
  const normalizedQuery = query.toLowerCase()
  const words = normalizedQuery
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !POLISH_STOPWORDS.has(w))

  let bestMatch: InnovationItem | null = null
  let maxScore = 0

  for (const item of innovations) {
    const haystack = `${item.title} ${item.category || ''} ${item.patientProblem || ''} ${item.proposedSolution || ''}`.toLowerCase()
    let score = 0

    for (const word of words) {
      if (item.title.toLowerCase().includes(word)) {
        score += 30
      } else if (haystack.includes(word)) {
        score += 15
      }
    }

    if (score > maxScore) {
      maxScore = score
      bestMatch = item
    }
  }

  // Próg pewności dla dopasowania semantyczno-tekstowego
  if (bestMatch && maxScore >= 25) {
    return {
      matched: bestMatch,
      confidence: Math.min(95, Math.max(50, maxScore)),
      explanation: `Dopasowano innowację "${bestMatch.title}" w kategorii ${bestMatch.category || 'Ogólna'}, która odpowiada na podane zagadnienie.`,
      actionAdvice: 'Możesz zapoznać się ze specyfikacją tego rozwiązania, pobrać materiały wdrożeniowe lub przekazać swój feedback po przetestowaniu.',
      gapAnalysis: '',
    }
  }

  return {
    matched: null,
    confidence: 0,
    explanation: '',
    actionAdvice: '',
    gapAnalysis: `W bazie nie odnaleziono gotowego rozwiązania dla zapytania: "${query}". Zarejestrowano zapotrzebowanie dla administratorów ROPS.`,
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { problem, contactEmail } = body as { problem?: string; contactEmail?: string }

    if (!problem || !problem.trim()) {
      return NextResponse.json(
        { error: 'Proszę podać opis problemu lub potrzeby.' },
        { status: 400 }
      )
    }

    const payload = await getPayload({ config })

    // 1. Pobierz innowacje z bazy
    let innovationsDoc = await payload.find({
      collection: 'innovations',
      limit: 100,
    })

    // Jeśli baza jest jeszcze pusta, wykonaj bezpieczny auto-seed z dane.json
    if (innovationsDoc.totalDocs === 0) {
      try {
        const rootPath = path.resolve(process.cwd(), '..')
        const danePath = fs.existsSync(path.join(rootPath, 'dane.json'))
          ? path.join(rootPath, 'dane.json')
          : path.resolve(process.cwd(), 'dane.json')

        if (fs.existsSync(danePath)) {
          const rawData = fs.readFileSync(danePath, 'utf-8')
          const categories = JSON.parse(rawData)
          for (const group of categories) {
            for (const item of group.items) {
              await payload.create({
                collection: 'innovations',
                data: {
                  title: item.title,
                  category: group.category as any,
                  patientProblem: `Problem w obszarze: ${group.category}`,
                  proposedSolution: item.description,
                  creatorType: 'application',
                  wantsToImplement: true,
                  status: 'approved',
                  availableForTesting: true,
                },
              })
            }
          }
          innovationsDoc = await payload.find({
            collection: 'innovations',
            limit: 100,
          })
        }
      } catch (seedErr) {
        console.warn('Auto-seed ostrzeżenie:', seedErr)
      }
    }

    const innovationsList: InnovationItem[] = innovationsDoc.docs.map((doc: any) => ({
      id: doc.id,
      title: doc.title,
      category: doc.category,
      patientProblem: doc.patientProblem,
      proposedSolution: doc.proposedSolution,
      ropsReport: doc.ropsReport,
      status: doc.status,
      availableForTesting: doc.availableForTesting,
    }))

    let matchFound = false
    let matchedItem: InnovationItem | null = null
    let confidence = 0
    let aiExplanation = ''
    let actionAdvice = ''
    let gapAnalysis = ''

    // 2. Sprawdź czy mamy dostęp do OpenRouter AI
    if (isOpenRouterConfigured() && innovationsList.length > 0) {
      try {
        const promptCatalog = innovationsList.slice(0, 35).map((inv, idx) => 
          `[ID: ${inv.id}] Tytuł: "${inv.title}" | Kategoria: ${inv.category || 'brak'} | Problem: ${inv.patientProblem?.substring(0, 140)}... | Rozwiązanie: ${inv.proposedSolution?.substring(0, 180)}...`
        ).join('\n')

        const aiResponse = await createChatCompletion({
          model: DEFAULT_OPENROUTER_MODEL,
          temperature: 0.2,
          systemPrompt: `Jesteś ekspertem ds. innowacji społecznych i opiekuńczych ROPS (Regionalny Ośrodek Polityki Społecznej).
Twoim zadaniem jest dopasować problem użytkownika do istniejącej w bazie bazy innowacji (tzw. Matchmaking).
Otrzymasz zapytanie użytkownika oraz katalog innowacji.
Zwróć TYLKO I WYŁĄCZNIE poprawny JSON (bez markdowna, bez \`\`\`json) o schemacie:
{
  "matchFound": true | false,
  "matchedId": "ID z katalogu lub null",
  "confidence": liczba 0-100,
  "aiExplanation": "Dlaczego to rozwiązanie pasuje do problemu (lub dlaczego żadne nie pasuje)",
  "actionAdvice": "Praktyczne kroki jak użytkownik może skorzystać z tego rozwiązania",
  "gapAnalysis": "Jeśli matchFound to false: zwięzła synteza zidentyfikowanej luki dla administratorów ROPS"
}`,
          messages: [
            {
              role: 'user',
              content: `Problem/potrzeba użytkownika: "${problem}"\n\nDostępne innowacje w bazie:\n${promptCatalog}`,
            },
          ],
        })

        const rawContent = (aiResponse.content || '').trim().replace(/^```json/i, '').replace(/```$/i, '').trim()
        const parsed = JSON.parse(rawContent)

        if (parsed.matchFound && parsed.matchedId) {
          const found = innovationsList.find((i) => String(i.id) === String(parsed.matchedId))
          if (found) {
            matchFound = true
            matchedItem = found
            confidence = parsed.confidence || 85
            aiExplanation = parsed.aiExplanation || 'Znaleziono rozwiązanie odpowiadające Twoim potrzebom.'
            actionAdvice = parsed.actionAdvice || 'Zapoznaj się z poniższymi szczegółami rozwiązania.'
          }
        } else {
          matchFound = false
          gapAnalysis = parsed.gapAnalysis || 'Brak innowacji odpowiadającej bezpośrednio na to zgłoszenie.'
        }
      } catch (aiErr) {
        console.warn('OpenRouter API call fallback to heuristic:', aiErr)
        const fb = fallbackMatch(problem, innovationsList)
        matchFound = Boolean(fb.matched)
        matchedItem = fb.matched
        confidence = fb.confidence
        aiExplanation = fb.explanation
        actionAdvice = fb.actionAdvice
        gapAnalysis = fb.gapAnalysis
      }
    } else {
      // Fallback algorytmiczny
      const fb = fallbackMatch(problem, innovationsList)
      matchFound = Boolean(fb.matched)
      matchedItem = fb.matched
      confidence = fb.confidence
      aiExplanation = fb.explanation
      actionAdvice = fb.actionAdvice
      gapAnalysis = fb.gapAnalysis
    }

    // 3. Obsługa Scenariusza A (Rozwiązanie ISTNIEJE)
    if (matchFound && matchedItem) {
      // Pobierz feedbacki dla tego rozwiązania
      let feedbacks: any[] = []
      try {
        const feedbackDocs = await payload.find({
          collection: 'feedbacks',
          where: {
            innovation: { equals: matchedItem.id },
            status: { equals: 'approved' },
          },
          limit: 10,
        })
        feedbacks = feedbackDocs.docs
      } catch (fErr) {
        console.warn('Pobieranie feedbacków:', fErr)
      }

      return NextResponse.json({
        matchFound: true,
        innovation: matchedItem,
        confidence,
        aiExplanation,
        actionAdvice,
        feedbacks,
      })
    }

    // 4. Obsługa Scenariusza B (Rozwiązanie NIE ISTNIEJE)
    // Logujemy zgłoszenie braku rozwiązania do kolekcji unmatched-queries dla Administratorów ROPS
    try {
      await payload.create({
        collection: 'unmatched-queries',
        data: {
          query: problem,
          aiAnalysis: gapAnalysis || `Zgłoszona potrzeba nie posiada odpowiednika w obecnej bazie innowacji.`,
          userContact: contactEmail || undefined,
          status: 'new',
        },
      })
    } catch (saveGapErr) {
      console.warn('Błąd zapisu luki rynkowej:', saveGapErr)
    }

    return NextResponse.json({
      matchFound: false,
      query: problem,
      message: 'Nasz system nie znalazł jeszcze gotowego rozwiązania dla Twojego problemu.',
      gapAnalysis: gapAnalysis || 'W bazie brak bezpośredniego dopasowania. Zarejestrowaliśmy zapotrzebowanie dla ROPS.',
      suggestedTab: 'matchmaking_gap',
    })
  } catch (error: unknown) {
    console.error('Matchmaking error:', error)
    const msg = error instanceof Error ? error.message : 'Wystąpił błąd podczas matchmakingu'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
