import Link from 'next/link'

export default function AdminWelcome() {
  return (
    <section className="iskra-admin-welcome" aria-labelledby="iskra-admin-welcome-title">
      <div className="iskra-admin-welcome__copy">
        <span className="iskra-admin-welcome__eyebrow">ISKRA MAŁOPOLSKA · ROPS KRAKÓW</span>
        <h1 id="iskra-admin-welcome-title">Centrum innowacji społecznych</h1>
        <p>
          Zarządzaj pomysłami, wspieraj ich wdrażanie i łącz ludzi zmieniających
          lokalne społeczności.
        </p>
        <Link className="iskra-admin-welcome__manage" href="/panel/innovation-management">
          Otwórz szybkie zarządzanie <span aria-hidden="true">→</span>
        </Link>
      </div>
      <span className="iskra-admin-welcome__spark" aria-hidden="true">
        ✳
      </span>
    </section>
  )
}
