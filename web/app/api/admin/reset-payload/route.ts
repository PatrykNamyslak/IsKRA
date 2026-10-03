import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const payload = await getPayload({ config });
    const results: Record<string, number> = {};

    // 1. Czyszczenie feedbacks
    try {
      const feedbacks = await payload.find({ collection: "feedbacks", limit: 1000 });
      for (const f of feedbacks.docs) {
        await payload.delete({ collection: "feedbacks", id: f.id });
      }
      results.feedbacks = feedbacks.docs.length;
    } catch (e: unknown) {
      results.feedbacksError = e instanceof Error ? 1 : 0;
    }

    // 2. Czyszczenie unmatched-queries
    try {
      const queries = await payload.find({ collection: "unmatched-queries", limit: 1000 });
      for (const q of queries.docs) {
        await payload.delete({ collection: "unmatched-queries", id: q.id });
      }
      results.unmatchedQueries = queries.docs.length;
    } catch (e: unknown) {
      results.unmatchedQueriesError = e instanceof Error ? 1 : 0;
    }

    // 3. Czyszczenie innovations
    try {
      const innovations = await payload.find({ collection: "innovations", limit: 1000 });
      for (const i of innovations.docs) {
        await payload.delete({ collection: "innovations", id: i.id });
      }
      results.innovations = innovations.docs.length;
    } catch (e: unknown) {
      results.innovationsError = e instanceof Error ? 1 : 0;
    }

    // 3b. Czyszczenie categories
    try {
      const cats = await payload.find({ collection: "categories", limit: 1000 });
      for (const c of cats.docs) {
        await payload.delete({ collection: "categories", id: c.id });
      }
      results.categories = cats.docs.length;
    } catch (e: unknown) {
      results.categoriesError = e instanceof Error ? 1 : 0;
    }

    // 4. Czyszczenie organizations
    try {
      const orgs = await payload.find({ collection: "organizations", limit: 1000 });
      for (const o of orgs.docs) {
        await payload.delete({ collection: "organizations", id: o.id });
      }
      results.organizations = orgs.docs.length;
    } catch (e: unknown) {
      results.organizationsError = e instanceof Error ? 1 : 0;
    }

    // 5. Czyszczenie users
    try {
      const users = await payload.find({ collection: "users", limit: 1000 });
      for (const u of users.docs) {
        await payload.delete({ collection: "users", id: u.id });
      }
      results.users = users.docs.length;
    } catch (e: unknown) {
      results.usersError = e instanceof Error ? 1 : 0;
    }

    // 6. Wyczyszczenie ciasteczka sesyjnego
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
