import Image from 'next/image'
import Link from 'next/link'

export default function AdminBrand() {
  return (
    <Link className="iskra-admin-brand" href="/" aria-label="IsKra Małopolska — strona główna">
      <Image src="/iskra-icon.svg" alt="" width={44} height={49} priority />
      <span className="iskra-admin-brand__wordmark">
        <strong>IsKra</strong>
        <span>MAŁOPOLSKA · PANEL ADMINISTRACYJNY</span>
      </span>
    </Link>
  )
}
