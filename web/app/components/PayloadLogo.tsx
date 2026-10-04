import Image from "next/image";

export default function PayloadLogo() {
  return (
    <span className="flex items-center justify-center gap-3 text-left">
      <Image src="/iskra-icon.svg" alt="" width={48} height={53} priority />
      <span className="grid gap-0.5">
        <strong className="text-xl font-bold tracking-tight text-gray-900">IsKra</strong>
        <span className="text-[9px] font-bold tracking-[0.14em] text-gray-500">MAŁOPOLSKA</span>
      </span>
    </span>
  );
}
