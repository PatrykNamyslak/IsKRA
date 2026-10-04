import SiteHeader from "@/app/components/SiteHeader";
import AccessibilityControls from "@/app/components/AccessibilityControls";

export default function OrganizerLayoutHeader() {
  return (
    <>
      <SiteHeader audience="organizer" />
      <AccessibilityControls />
    </>
  );
}