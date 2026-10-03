'use client'

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Dropdown,
  Label,
  Button,
} from "@heroui/react";

export default function PageIndex() {
  const router = useRouter();

  return (
    <>
      <nav className="flex items-center justify-between bg-yellow-300 px-8 py-4 shadow-md">
        <Link
          href="/"
          className="text-xl px-5 py-3 font-bold tracking-tight text-gray-900 transition-colors hover:text-yellow-700 bg-yellow-400"
        >
          STRONA GŁÓWNA
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/form"
            className="rounded-lg px-4 py-2 font-medium text-gray-800 transition-all hover:bg-yellow-400 hover:text-gray-950"
          >
            FORMULARZ
          </Link>

          <Link
            href="/innovations"
            className="rounded-lg px-4 py-2 font-medium text-gray-800 transition-all hover:bg-yellow-400 hover:text-gray-950"
          >
            PRZEGLĄDAJ INNOWACJE
          </Link>

          <Dropdown>
            <Button className="rounded-lg px-4 py-2 font-medium text-gray-800 transition-all hover:bg-yellow-400 hover:text-gray-950 cursor-pointer">
              Strefy / Logowanie ▾
            </Button>
            <Dropdown.Popover>
              <Dropdown.Menu onAction={(key) => {
                if (key === "register-organizer") router.push("/register/organizer");
                else if (key === "register-tester") router.push("/register/tester");
                else if (key === "login-panel") router.push("/panel/login");
                else router.push("/panel");
              }}>
                <Dropdown.Item id="login-panel" textValue="Logowanie do Panelu">
                  <Label>🔑 Logowanie (Wszyscy) ➔ /panel/login</Label>
                </Dropdown.Item>
                <Dropdown.Item id="register-organizer" textValue="Rejestracja Organizatora">
                  <Label>🏥 Rejestracja Organizatora ➔ /register/organizer</Label>
                </Dropdown.Item>
                <Dropdown.Item id="register-tester" textValue="Rejestracja Testera">
                  <Label>🔬 Rejestracja Testera / Badacza ➔ /register/tester</Label>
                </Dropdown.Item>
                <Dropdown.Item id="panel-admin" textValue="Otwórz Panel">
                  <Label>↳ Otwórz Panel CMS (/panel)</Label>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>

        </div>
      </nav>
    </>
  );
}