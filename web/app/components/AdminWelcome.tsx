import Link from 'next/link'

export default function AdminWelcome() {
  return (
    <section className="iskra-admin-welcome" aria-labelledby="iskra-admin-welcome-title">
      <div className="iskra-admin-welcome__copy">
        <span className="iskra-admin-welcome__eyebrow">IsKRA · ROPS KRAKÓW</span>
        <h1 id="iskra-admin-welcome-title">Centrum innowacji społecznych</h1>
        <p>
          Zarządzaj pomysłami, wspieraj ich wdrażanie i łącz ludzi zmieniających
          lokalne społeczności.
        </p>
      </div>
      <Link className="iskra-admin-welcome__link" href="/">
        Zobacz stronę główną <span aria-hidden="true">↗</span>
      </Link>
      <span className="iskra-admin-welcome__spark" aria-hidden="true">
        ✳
      </span>
    </section>
  )
}
