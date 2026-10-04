import SiteHeader from "@/app/components/SiteHeader";
import AccessibilityControls from "@/app/components/AccessibilityControls";

export default function UserLayoutHeader() {
  return (
    <>
      <SiteHeader audience="user" />
      <AccessibilityControls />
    </>
  );
}