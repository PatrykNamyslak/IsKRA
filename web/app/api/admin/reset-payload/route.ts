import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const payload = await getPayload({ config });
    const results: Record<string, number> = {};

    // 1. Czyszczenie users
    try {
      const users = await payload.find({ collection: "users", limit: 1000 });
      for (const u of users.docs) {
        await payload.delete({ collection: "users", id: u.id });
      }
      results.users = users.docs.length;
    } catch (e: unknown) {
      results.usersError = e instanceof Error ? 1 : 0;
    }

    // 2. Czyszczenie organizations
    try {
      const orgs = await payload.find({ collection: "organizations", limit: 1000 });
      for (const o of orgs.docs) {
        await payload.delete({ collection: "organizations", id: o.id });
      }
      results.organizations = orgs.docs.length;
    } catch (e: unknown) {
      results.organizationsError = e instanceof Error ? 1 : 0;
    }

    // 3. Czyszczenie research-studies
    try {
      const studies = await payload.find({ collection: "research-studies", limit: 1000 });
      for (const s of studies.docs) {
        await payload.delete({ collection: "research-studies", id: s.id });
      }
      results.researchStudies = studies.docs.length;
    } catch (e: unknown) {
      results.researchStudiesError = e instanceof Error ? 1 : 0;
    }

    // 4. Wyczyszczenie ciasteczka sesyjnego
    try {
      const cookieStore = await cookies();
      cookieStore.delete("payload-token");
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Baza danych Payload CMS została pomyślnie wyzerowana.",
      deleted: results,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Błąd resetowania bazy";
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
