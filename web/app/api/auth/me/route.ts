import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { headers } from "next/headers";

export async function GET() {
  try {
    const payload = await getPayload({ config });
    const reqHeaders = await headers();
    const authResult = await payload.auth({ headers: reqHeaders });

    if (!authResult || !authResult.user) {
      return NextResponse.json({ user: null });
    }

    const authUser = authResult.user as {
      id: string | number;
      email?: string;
      role?: string;
      name?: string | null;
    };

    return NextResponse.json({
      user: {
        id: authUser.id,
        email: authUser.email || "",
        role: authUser.role || "user",
        name: authUser.name || null,
      },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
