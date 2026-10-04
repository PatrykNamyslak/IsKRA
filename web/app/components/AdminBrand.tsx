import Image from 'next/image'
import Link from 'next/link'

export default function AdminBrand() {
  return (
    <Link className="iskra-admin-brand" href="/" aria-label="IsKra Małopolska — strona główna">
      <Image src="/iskra-full.svg" alt="IsKra" width={128} height={39} priority />
      <span className="iskra-admin-brand__wordmark">
        <span>MAŁOPOLSKA · PANEL ADMINISTRACYJNY</span>
      </span>
    </Link>
  )
}
