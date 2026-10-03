import React from "react";
import PayloadRegisterForm from "@/app/components/PayloadRegisterForm";

export default function RegisterOrganizerPage() {
  return (
    <PayloadRegisterForm
      role="organization"
      nameLabel="Organization Name"
      namePlaceholder="City General Hospital"
      buttonLabel="Register as Organization"
    />
  );
}
