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
            <Button className="rounded-lg px-4 py-2 font-medium text-gray-800 transition-all hover:bg-yellow-400 hover:text-gray-950">
              Actions
            </Button>
            <Dropdown.Popover>
              <Dropdown.Menu onAction={(key) => {
                if (key === "login-organizer") {
                  router.push("/login/organizer");
                }

                if (key === "login-tester") {
                  router.push("/login/tester");
                }
              }}>
                <Dropdown.Item id="login-organizer" textValue="Login Organizer">
                  <Label>Login Organizer</Label>
                </Dropdown.Item>
                <Dropdown.Item id="login-tester" textValue="Login Tester">
                  <Label>Login Tester</Label>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>
      </nav>
    </>
  );
}