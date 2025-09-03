"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewInterview() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/vapi/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "technical",
            role: "software engineer",
            level: "junior",
            techstack: "react,typescript",
            amount: 5,
          }),
        });
        const data = await res.json().catch(() => ({} as any));
        if (!res.ok || !data?.success) {
          setError("Failed to generate interview");
          return;
        }
        router.push("/");
      } catch {
        setError("Failed to generate interview");
      }
    };
    run();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p>{error ?? "Generating your interview..."}</p>
    </div>
  );
}
