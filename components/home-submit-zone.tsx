"use client";

import { useRouter } from "next/navigation";
import { SubmitZone } from "@/components/submit-zone";

export function HomeSubmitZone() {
  const router = useRouter();
  return (
    <SubmitZone
      onSubmitted={async () => {
        router.refresh();
      }}
    />
  );
}
