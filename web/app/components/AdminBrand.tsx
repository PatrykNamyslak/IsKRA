import Image from 'next/image'
import Link from 'next/link'

export default function AdminBrand() {
  return (
    <Link className="iskra-admin-brand" href="/" aria-label="IsKRA ROPS — strona główna">
      <Image src="/iskra.svg" alt="" width={38} height={42} priority />
      <span className="iskra-admin-brand__wordmark">
        <strong>IsKRA</strong>
        <span>ROPS · PANEL ADMINISTRACYJNY</span>
      </span>
    </Link>
  )
}
