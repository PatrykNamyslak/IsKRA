import Link from 'next/link'

export default function AdminInnovationNavLink() {
  return (
    <Link className="iskra-admin-nav-link" href="/panel/innovation-management">
      <span aria-hidden="true">✳</span>
      Szybkie zarządzanie innowacjami
    </Link>
  )
}
