import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { RopsCategory } from '@/lib/categories'
import { slugify } from '@/lib/slugify'
import { scrapeRopsInnovations } from '@/lib/rops-scraper'

export async function GET(req: NextRequest) {
  return handleSeed(req)
}

export async function POST(req: NextRequest) {
  return handleSeed(req)
}

async function handleSeed(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    console.log('[SEEDER] Rozpoczęcie seedowania bazy danych...')

    // Scrape first so source failures cannot leave the database partially cleaned.
    const rawCategories = await scrapeRopsInnovations()
    const scrapedCount = rawCategories.reduce((count, group) => count + group.items.length, 0)
    console.log(`[SEEDER] Pobrano ${scrapedCount} innowacji z ${rawCategories.length} kategorii ROPS`)

    const payload = await getPayload({ config })

    // 0. Naprawa typu kolumny assigned_tester w PostgreSQL (usunięcie starego typu integer po rename)
    try {
      const adapter = payload.db as any
      if (adapter?.pool?.query) {
        await adapter.pool.query(`
          ALTER TABLE "innovations" DROP CONSTRAINT IF EXISTS "innovations_assigned_researcher_id_users_id_fk";
          ALTER TABLE "innovations" DROP COLUMN IF EXISTS "assigned_researcher_id" CASCADE;
          ALTER TABLE "innovations" DROP COLUMN IF EXISTS "assigned_tester" CASCADE;
          ALTER TABLE "innovations" ADD COLUMN "assigned_tester" varchar;
          UPDATE "users" SET "role" = 'tester' WHERE "role" = 'researcher';
          ALTER TABLE "innovations" DROP COLUMN IF EXISTS "category" CASCADE;
          ALTER TABLE "unmatched_queries" DROP COLUMN IF EXISTS "category" CASCADE;
        `)
        console.log('[SEEDER] Pomyślnie zsynchronizowano strukturę bazy danych')
      }
    } catch (colErr) {
      console.warn('[SEEDER] Ostrzeżenie przy synchronizacji struktury:', colErr)
    }

    // 1. Zawsze czyścimy stare rekordy testowe, chyba że jawnie podano ?clean=false
    const skipClean = searchParams.get('clean') === 'false'
    if (!skipClean) {
      console.log('[SEEDER] Czyszczenie starych rekordów...')
      try {
        const fbs = await payload.find({ collection: 'feedbacks', limit: 1000, overrideAccess: true })
        for (const f of fbs.docs) await payload.delete({ collection: 'feedbacks', id: f.id, overrideAccess: true })

        const uqs = await payload.find({ collection: 'unmatched-queries', limit: 1000, overrideAccess: true })
        for (const q of uqs.docs) await payload.delete({ collection: 'unmatched-queries', id: q.id, overrideAccess: true })

        const invs = await payload.find({ collection: 'innovations', limit: 1000, overrideAccess: true })
        for (const i of invs.docs) await payload.delete({ collection: 'innovations', id: i.id, overrideAccess: true })

        const cats = await payload.find({ collection: 'categories', limit: 1000, overrideAccess: true })
        for (const c of cats.docs) await payload.delete({ collection: 'categories', id: c.id, overrideAccess: true })

        const orgs = await payload.find({ collection: 'organizations', limit: 1000, overrideAccess: true })
        for (const o of orgs.docs) await payload.delete({ collection: 'organizations', id: o.id, overrideAccess: true })
      } catch (cleanErr) {
        console.warn('[SEEDER] Ostrzeżenie przy czyszczeniu kolekcji:', cleanErr)
      }
    }

    // 2. Naprawa istniejących użytkowników i seedowanie kont organizacji w kolekcji users
    const sampleOrgUsers = [
      {
        email: 'szpital.krakow@example.com',
        password: 'password123',
        role: 'organization' as const,
        name: 'Szpital Uniwersytecki w Krakowie',
      },
      {
        email: 'dps.wieliczka@example.com',
        password: 'password123',
        role: 'organization' as const,
        name: 'Dom Pomocy Społecznej w Wieliczce',
      },
      {
        email: 'fundacja.aktywni@example.com',
        password: 'password123',
        role: 'organization' as const,
        name: 'Fundacja Aktywności Społecznej',
      },
      {
        email: 'cus.tarnow@example.com',
        password: 'password123',
        role: 'organization' as const,
        name: 'Centrum Usług Społecznych w Tarnowie',
      },
    ]

    const createdUserMap: Record<string, number> = {}
    for (const orgUser of sampleOrgUsers) {
      try {
        const found = await payload.find({
          collection: 'users',
          where: { email: { equals: orgUser.email } },
          limit: 1,
          overrideAccess: true,
        })
        if (found.totalDocs > 0) {
          createdUserMap[orgUser.email] = found.docs[0].id
        } else {
          const created = await payload.create({
            collection: 'users',
            data: orgUser,
            overrideAccess: true,
          })
          createdUserMap[orgUser.email] = created.id
        }
      } catch (userErr) {
        console.warn(`[SEEDER] Nie udało się utworzyć usera ${orgUser.email}:`, userErr)
      }
    }

    // 3. Seedowanie 10 organizacji w kolekcji organizations (w tym powiązanie z kontami użytkowników)
    const sampleOrganizationsData = [
      {
        name: 'Szpital Uniwersytecki w Krakowie',
        description: 'Wiodąca placówka kliniczna prowadząca innowacyjne terapie geriatryczne i neurologiczne.',
        userEmail: 'szpital.krakow@example.com',
      },
      {
        name: 'Dom Pomocy Społecznej "Złoty Wiek"',
        description: 'Ośrodek opieki całodobowej dla osób starszych oraz z chorobami otępiennymi.',
        userEmail: 'dps.wieliczka@example.com',
      },
      {
        name: 'Fundacja Aktywności i Integracji Społecznej',
        description: 'Organizacja pozarządowa wspierająca powrót na rynek pracy osób wykluczonych.',
        userEmail: 'fundacja.aktywni@example.com',
      },
      {
        name: 'Centrum Usług Społecznych w Tarnowie',
        description: 'Miejska jednostka koordynująca pomoc środowiskową i opiekę wytchnieniową.',
        userEmail: 'cus.tarnow@example.com',
      },
      {
        name: 'Małopolskie Stowarzyszenie Terapii i Rozwoju',
        description: 'Eksperci w dziedzinie integracji sensorycznej i pracy z młodzieżą z autyzmem.',
      },
      {
        name: 'Hospicjum Domowe im. Św. Łazarza',
        description: 'Zapewnianie profesjonalnej asysty medycznej i psychologicznej w warunkach domowych.',
      },
      {
        name: 'Instytut Badań i Włączenia Cyfrowego',
        description: 'Twórcy rozwiązań ułatwiających osobom z niepełnosprawnościami dostęp do e-usług.',
      },
      {
        name: 'Fundacja Pomocy Dzieciom i Młodzieży "Promyk"',
        description: 'Działania na rzecz podopiecznych placówek opiekuńczo-wychowawczych.',
      },
      {
        name: 'Krakowski Związek Niewidomych i Słabowidzących',
        description: 'Stowarzyszenie wdrażające pomoce tyflologiczne i systemy orientacji przestrzennej.',
      },
      {
        name: 'Ośrodek Pomocy Osobom w Kryzysie Bezdomności',
        description: 'Placówka reintegracji społeczno-zawodowej i opieki doraźnej.',
      },
    ]

    const createdOrganizations: any[] = []
    for (const orgData of sampleOrganizationsData) {
      try {
        const userId = orgData.userEmail ? createdUserMap[orgData.userEmail] : undefined
        const org = await payload.create({
          collection: 'organizations',
          data: {
            name: orgData.name,
            description: orgData.description,
            user: userId,
          },
          overrideAccess: true,
        })
        createdOrganizations.push(org)
      } catch (orgErr) {
        console.warn(`[SEEDER] Błąd tworzenia organizacji ${orgData.name}:`, orgErr)
      }
    }
    console.log(`[SEEDER] Utworzono organizacji: ${createdOrganizations.length}`)

    // 4a. Seedowanie kolekcji categories z danych pobranych z ROPS
    const createdCategoryMap: Record<string, number> = {}
    for (const group of rawCategories) {
      const catName = group.category || 'Dla seniorów'
      if (!createdCategoryMap[catName]) {
        try {
          const found = await payload.find({
            collection: 'categories',
            where: { name: { equals: catName } },
            limit: 1,
            overrideAccess: true,
          })
          if (found.totalDocs > 0) {
            createdCategoryMap[catName] = found.docs[0].id
          } else {
            const catDoc = await payload.create({
              collection: 'categories',
              data: {
                name: catName,
                description: `Oficjalny obszar innowacji społecznych ROPS: ${catName}`,
              },
              overrideAccess: true,
            })
            createdCategoryMap[catName] = catDoc.id
          }
        } catch (catErr) {
          console.warn(`[SEEDER] Błąd tworzenia kategorii ${catName}:`, catErr)
        }
      }
    }
    console.log(`[SEEDER] Zaseedowano kategorii w kolekcji categories: ${Object.keys(createdCategoryMap).length}`)

    // 4b. Seedowanie innowacji z powiązaniem do ID kategorii
    const createdInnovations: any[] = []
    let orgIdx = 0

    for (const group of rawCategories) {
      const categoryName = group.category || 'Dla seniorów'
      const categoryId = createdCategoryMap[categoryName]

      for (const item of group.items) {
        const assignedOrg = createdOrganizations.length > 0
          ? createdOrganizations[orgIdx % createdOrganizations.length]?.id
          : undefined

        try {
          const inv = await payload.create({
            collection: 'innovations',
            overrideAccess: true,
            context: { disableEmailNotifications: true },
            data: {
              slug: slugify(item.title),
              title: item.title,
              category: categoryId,
              creatorType: 'application',
              wantsToImplement: true,
              patientProblem: `Problem w obszarze: ${categoryName}. Zgłoszenie beneficjentów dotyczące braku adekwatnych rozwiązań wspierających samodzielność.`,
              proposedSolution: item.description,
              ropsReport: [
                item.project ? `Program: ${item.project}` : undefined,
                item.license ? `Licencja: ${item.license}` : undefined,
                `Źródło: ${item.sourceUrl}`,
              ]
                .filter(Boolean)
                .join('\n'),
              organization: assignedOrg,
              status: 'approved',
              availableForTesting: true,
              assignedTester: 'Marek Wiśniewski (Tester gość)',
            },
          })
          createdInnovations.push(inv)
          orgIdx++
        } catch (invErr) {
          console.warn(`[SEEDER] Błąd tworzenia innowacji ${item.title}:`, invErr)
        }
      }
    }
    console.log(`[SEEDER] Utworzono innowacji: ${createdInnovations.length}`)

    // 5. Seedowanie 10 wyników dla kolekcji feedbacks
    const sampleFeedbacksData = [
      {
        rating: 5,
        comment: 'Innowacja przetestowana w warunkach pilotażowych w DPS. Bardzo wysoka skuteczność terapeutyczna, pensjonariusze chętnie z niej korzystają.',
        authorName: 'Marta Kowalska',
        authorEmail: 'marta.k@example.com',
        role: 'tester' as const,
      },
      {
        rating: 5,
        comment: 'Znakomite ułatwienie codziennego funkcjonowania. Prosta i intuicyjna w użyciu nawet dla osób z ograniczeniami ruchowymi.',
        authorName: 'Piotr Zieliński',
        authorEmail: 'piotr.z@example.com',
        role: 'user' as const,
      },
      {
        rating: 4,
        comment: 'Rozwiązanie spełnia swoje zadanie. Warto w kolejnej iteracji pomyśleć o lżejszym materiale ramy.',
        authorName: 'Tomasz Lewandowski',
        authorEmail: 'tomek.l@example.com',
        role: 'tester' as const,
      },
      {
        rating: 5,
        comment: 'Jako opiekunka osoby po udarze widzę kolosalną różnicę w zaangażowaniu podopiecznego. Polecam każdemu.',
        authorName: 'Barbara Wójcik',
        authorEmail: 'barbara.w@example.com',
        role: 'caregiver' as const,
      },
      {
        rating: 4,
        comment: 'Dobre rezultaty podczas zajęć integracyjnych. Dzieci szybko zrozumiały zasady i chętnie brały udział.',
        authorName: 'Krzysztof Kamiński',
        authorEmail: 'krzysztof.k@example.com',
        role: 'specialist' as const,
      },
      {
        rating: 5,
        comment: 'Testowaliśmy przez 3 tygodnie na oddziale geriatrycznym. Personel zaobserwował wyraźną poprawę nastroju pacjentów.',
        authorName: 'Dr Joanna Dąbrowska',
        authorEmail: 'joanna.d@example.com',
        role: 'tester' as const,
      },
      {
        rating: 5,
        comment: 'Idealna innowacja na spacery i wyjazdy. Płaszcz nie krępuje ruchów i idealnie chroni wózek przed deszczem.',
        authorName: 'Marcin Kozłowski',
        authorEmail: 'marcin.k@example.com',
        role: 'user' as const,
      },
      {
        rating: 4,
        comment: 'Ciekawe narzędzie terapeutyczne. Wymaga krótkiego instruktażu wstępnego, ale efekty są bardzo zadowalające.',
        authorName: 'Agnieszka Jankowska',
        authorEmail: 'agnieszka.j@example.com',
        role: 'specialist' as const,
      },
      {
        rating: 5,
        comment: 'Pomogło mojemu tacie w ćwiczeniu pamięci i koncentracji. Duże i czytelne elementy są ogromnym plusem.',
        authorName: 'Ewa Mazur',
        authorEmail: 'ewa.m@example.com',
        role: 'caregiver' as const,
      },
      {
        rating: 5,
        comment: 'Metodyka wdrożenia opisana bardzo klarownie. Gotowe do upowszechnienia w kolejnych placówkach opiekuńczych.',
        authorName: 'Rafał Krawczyk',
        authorEmail: 'rafal.k@example.com',
        role: 'tester' as const,
      },
    ]

    let createdFeedbacksCount = 0
    if (createdInnovations.length > 0) {
      for (let i = 0; i < sampleFeedbacksData.length; i++) {
        const targetInnovationId = createdInnovations[i % createdInnovations.length].id
        try {
          await payload.create({
            collection: 'feedbacks',
            overrideAccess: true,
            data: {
              innovation: targetInnovationId,
              rating: sampleFeedbacksData[i].rating,
              comment: sampleFeedbacksData[i].comment,
              authorName: sampleFeedbacksData[i].authorName,
              authorEmail: sampleFeedbacksData[i].authorEmail,
              role: sampleFeedbacksData[i].role,
              status: 'approved',
            },
          })
          createdFeedbacksCount++
        } catch (fbErr) {
          console.warn('[SEEDER] Błąd seedowania feedbacku:', fbErr)
        }
      }
    }
    console.log(`[SEEDER] Utworzono opinii: ${createdFeedbacksCount}`)

    // 6. Seedowanie 10 wyników dla kolekcji unmatched-queries (Niezaspokojone potrzeby)
    const sampleUnmatchedQueriesData: Array<{
      query: string
      category: RopsCategory
      aiAnalysis: string
      userContact: string
      status: 'new' | 'under_review' | 'call_opened' | 'closed'
    }> = [
      {
        query: 'Mobilna asysta nocna dla samotnych seniorów z podejrzeniem majaczenia starczego',
        category: 'Dla seniorów',
        aiAnalysis: 'Brak w bazie innowacji dedykowanej opiece interwencyjnej w godzinach nocnych w domu seniora. Sugerowane otwarcie naboru na innowacje asystenckie.',
        userContact: 'kontakt.senior@example.com',
        status: 'new',
      },
      {
        query: 'Wypożyczalnia adaptacyjnych wózków terenowych dla dzieci z MPD umożliwiających wycieczki górskie',
        category: 'Dla osób o ograniczonej mobilności',
        aiAnalysis: 'Wysokie zapotrzebowanie rodzin z dziećmi z niepełnosprawnościami na aktywność turystyczną. Brak odpowiednika w obecnym katalogu.',
        userContact: 'rodzina.mpd@example.com',
        status: 'under_review',
      },
      {
        query: 'System tłumaczenia na żywo języka migowego PJM zintegrowany z wideodomofonami w blokach mieszkalnych',
        category: 'Dla osób z niepełnosprawnością sensoryczną',
        aiAnalysis: 'Istotna bariera dostępności architektonicznej i komunikacyjnej dla osób g/Głuchych. Projekt ma duży potencjał technologiczny.',
        userContact: 'dostepnosc.pjm@example.com',
        status: 'call_opened',
      },
      {
        query: 'Asystent powrotu do aktywności zawodowej dla osób po długotrwałej hospitalizacji psychiatrycznej',
        category: 'Dla rynku pracy',
        aiAnalysis: 'Potrzeba wsparcia pomostowego pomiędzy oddziałem dziennym a otwartym rynkiem pracy.',
        userContact: 'reintegracja@example.com',
        status: 'new',
      },
      {
        query: 'Aplikacja z piktogramami ułatwiająca załatwianie spraw w aptece dla dzieci w spektrum autyzmu',
        category: 'Dla dzieci, młodzieży i rodziny',
        aiAnalysis: 'Ułatwienie komunikacji w sytuacjach nagłych i stresujących w placówkach ochrony zdrowia.',
        userContact: 'terapeuta.asd@example.com',
        status: 'under_review',
      },
      {
        query: 'Mobilna pralnia i przechowalnia dokumentów dla osób doświadczających bezdomności w mniejszych miastach',
        category: 'Dla osób w kryzysie bezdomności',
        aiAnalysis: 'Usługa higieniczna połączona z ochroną dokumentów tożsamości – kluczowa do podjęcia zatrudnienia.',
        userContact: 'pomoc.doraźna@example.com',
        status: 'new',
      },
      {
        query: 'Dwujęzyczny przewodnik audio zintegrowany z kodami QR po procedurach leczenia onkologicznego',
        category: 'Dla cudzoziemców',
        aiAnalysis: 'Bariera językowa w krytycznych procedurach medycznych. Rekomendacja wdrożenia pilotażu.',
        userContact: 'zdrowie.cudzoziemcy@example.com',
        status: 'call_opened',
      },
      {
        query: 'Zestaw sensorycznych narzędzi kuchennych z blokadami bezpieczeństwa dla osób z niepełnosprawnością intelektualną',
        category: 'Dla osób z niepełnosprawnością intelektualną',
        aiAnalysis: 'Wsparcie samodzielnego przygotowywania posiłków w mieszkaniach chronionych i treningowych.',
        userContact: 'warsztaty.wtz@example.com',
        status: 'under_review',
      },
      {
        query: 'Pulpit zdalnego monitorowania parametrów życiowych dla pacjentów ze stwardnieniem zanikowym bocznym (SLA)',
        category: 'Dla zdrowia i medycyny',
        aiAnalysis: 'Pilna potrzeba wczesnego wykrywania spadku wydolności oddechowej u chorych w domach.',
        userContact: 'neurologia.sla@example.com',
        status: 'closed',
      },
      {
        query: 'Grupy wsparcia i platforma wymiany opieki wzajemnej dla opiekunów osób z chorobą Alzheimera',
        category: 'Dla seniorów',
        aiAnalysis: 'Przeciwdziałanie skrajnemu wyczerpaniu fizycznemu i psychicznemu opiekunów domowych.',
        userContact: 'opiekunowie.alz@example.com',
        status: 'new',
      },
    ]

    let createdQueriesCount = 0
    for (const q of sampleUnmatchedQueriesData) {
      try {
        const categoryId = createdCategoryMap[q.category] || Object.values(createdCategoryMap)[0]
        await payload.create({
          collection: 'unmatched-queries',
          overrideAccess: true,
          data: {
            query: q.query,
            category: categoryId,
            aiAnalysis: q.aiAnalysis,
            userContact: q.userContact,
            status: q.status,
          },
        })
        createdQueriesCount++
      } catch (qErr) {
        console.warn('[SEEDER] Błąd seedowania niezaspokojonej potrzeby:', qErr)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Pomyślnie zaseedowano bazę danych: ${createdOrganizations.length} organizacji, ${createdInnovations.length} innowacji z ROPS, ${createdFeedbacksCount} opinii, ${createdQueriesCount} niezaspokojonych potrzeb oraz konta organizacji.`,
      stats: {
        organizationsCreated: createdOrganizations.length,
        innovationsCreated: createdInnovations.length,
        feedbacksCreated: createdFeedbacksCount,
        unmatchedQueriesCreated: createdQueriesCount,
        orgUsersEnsured: sampleOrgUsers.length,
      },
    })
  } catch (error: unknown) {
    console.error('Błąd seeder:', error)
    const msg = error instanceof Error ? error.message : 'Błąd podczas seedowania bazy'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
