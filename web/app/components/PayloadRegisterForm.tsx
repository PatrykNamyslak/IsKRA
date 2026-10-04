"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PayloadLogo from "./PayloadLogo";

interface PayloadRegisterFormProps {
  role: "organization";
  nameLabel: string;
  namePlaceholder: string;
  buttonLabel?: string;
}

export default function PayloadRegisterForm({
  role,
  nameLabel,
  namePlaceholder,
  buttonLabel = "Register",
}: PayloadRegisterFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Hasła nie są identyczne.");
      return;
    }

    if (password.length < 6) {
      setError("Hasło musi mieć co najmniej 6 znaków.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Wystąpił błąd podczas rejestracji.");
        setLoading(false);
        return;
      }

      router.push("/panel");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Błąd sieci.");
      setLoading(false);
    }
  }

  return (
    <section className="template-minimal template-minimal--width-normal">
      <div className="template-minimal__wrap">
        {/* Use the same IsKra brand mark as the rest of the site. */}
        <div className="login__brand">
          <Link href="/panel/login">
            <PayloadLogo />
          </Link>
        </div>

        {error && (
          <div className="banner banner--type-error" style={{ marginBottom: "calc(var(--base))" }}>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login__form">
          <div className="login__form__inputWrap">
            {/* Name — use field-type email class since it carries the input styles */}
            <div className="field-type email">
              <label className="field-label" htmlFor="register-name">
                {nameLabel}&nbsp;<span className="required">*</span>
              </label>
              <div className="field-type__wrap">
                <input
                  id="register-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={namePlaceholder}
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email */}
            <div className="field-type email">
              <label className="field-label" htmlFor="register-email">
                Email&nbsp;<span className="required">*</span>
              </label>
              <div className="field-type__wrap">
                <input
                  id="register-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="field-type email">
              <label className="field-label" htmlFor="register-password">
                Password&nbsp;<span className="required">*</span>
              </label>
              <div className="field-type__wrap">
                <input
                  id="register-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="field-type email">
              <label className="field-label" htmlFor="register-confirm-password">
                Confirm Password&nbsp;<span className="required">*</span>
              </label>
              <div className="field-type__wrap">
                <input
                  id="register-confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>

          <Link href="/panel/login" prefetch={false}>
            Already have an account? Login
          </Link>

          <div className="form-submit">
            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="btn btn--style-primary btn--icon-style-without-border btn--size-large"
            >
              <span className="btn__content">
                <span className="btn__label">
                  {loading ? "Registering..." : buttonLabel}
                </span>
              </span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
