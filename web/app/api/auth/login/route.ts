import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { cookies } from "next/headers";
import type { User } from "@/payload-types";

export async function POST(req: NextRequest) {
  try {
    const { email, password, expectedRole } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email oraz hasło są wymagane." },
        { status: 400 }
      );
    }

    const payload = await getPayload({ config });

    const loginResult = await payload.login({
      collection: "users",
      data: {
        email,
        password,
      },
    });

    const user = loginResult.user as User;

    // Jeśli oczekiwano konkretnej roli (np. logowanie na podstronie organizatora)
    if (expectedRole && user.role !== "admin" && user.role !== expectedRole) {
      return NextResponse.json(
        {
          error: `Konto nie posiada uprawnień do strefy: ${expectedRole}. Twoja rola to: ${user.role}.`,
        },
        { status: 403 }
      );
    }

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

    // Każda rola wchodzi bezpośrednio do natywnego panelu Payload CMS (/panel),
    // gdzie widzi swoje dedykowane kolekcje zgodnie z uprawnieniami
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
    console.error("Błąd logowania:", error);
    const message =
      error instanceof Error ? error.message : "Nieprawidłowe dane logowania.";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
