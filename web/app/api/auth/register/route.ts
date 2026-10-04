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

    // Rejestracja jest dozwolona dla organizacji
    if (role !== "organization") {
      return NextResponse.json(
        { error: "Rejestracja jest dostępna dla organizacji partnerskich. Testerzy korzystają z systemu publicznie jako goście." },
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

    // Automatyczne powiązanie profilu organizacji z zarejestrowanym kontem
    if (role === "organization") {
      try {
        await payload.create({
          collection: "organizations",
          data: {
            name: name || email,
            user: user.id,
          },
          overrideAccess: true,
        });
      } catch (orgErr) {
        console.warn("Nie udało się powiązać profilu organizacji:", orgErr);
      }
    }

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
