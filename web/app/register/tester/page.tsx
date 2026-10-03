import PayloadRegisterForm from "@/app/components/PayloadRegisterForm";

export default function RegisterTesterPage() {
  return (
    <PayloadRegisterForm
      role="researcher"
      nameLabel="Full Name / Affiliation"
      namePlaceholder="Dr. Jane Doe"
      buttonLabel="Register as Tester"
    />
  );
}
