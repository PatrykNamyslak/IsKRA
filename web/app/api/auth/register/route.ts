import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { email, password, role, name } = await req.json();

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Email, hasło oraz rola są wymagane." },
        { status: 400 }
      );
    }

    // Rejestracja jest dozwolona wyłącznie dla testerów (researcher) oraz organizatorów (organization)
    // Admin rejestruje się wyłącznie przez pierwsze logowanie Payload CMS (/panel/create-first-user)
    if (!["organization", "researcher"].includes(role)) {
      return NextResponse.json(
        { error: "Rejestracja jest dostępna wyłącznie dla ról: tester (researcher) oraz organizator (organization)." },
        { status: 400 }
      );
    }

    const payload = await getPayload({ config });

    // Utworzenie użytkownika
    const user = await payload.create({
      collection: "users",
      data: {
        email,
        password,
        role,
        name: name || undefined,
      },
    });

    // Zalogowanie nowo utworzonego użytkownika
    const loginResult = await payload.login({
      collection: "users",
      data: {
        email,
        password,
      },
    });

    // Ustawienie ciasteczka sesji
    if (loginResult.token) {
      const cookieStore = await cookies();
      cookieStore.set("payload-token", loginResult.token, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }

    // Każda rola wchodzi bezpośrednio do natywnego panelu Payload CMS (/panel)
    const redirectTo = "/panel";

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      redirectTo,
    });
  } catch (error: unknown) {
    console.error("Błąd rejestracji:", error);
    const message =
      error instanceof Error ? error.message : "Błąd podczas rejestracji.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
