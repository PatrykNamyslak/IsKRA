import Image from "next/image";

export default function PayloadLogo() {
  return (
    <Image
      className="graphic-logo"
      src="/iskra-full.svg"
      alt="IsKra Małopolska"
      width={220}
      height={67}
      priority
    />
  );
}
