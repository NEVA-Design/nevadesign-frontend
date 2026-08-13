"use client";

import { useEffect, useState } from "react";

/* Horloge de Paris — le studio a toujours une heure locale. */
export default function LocalTime({ prefix = "Paris" }: { prefix?: string }) {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    function tick() {
      setTime(
        new Intl.DateTimeFormat("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Europe/Paris",
        }).format(new Date())
      );
    }
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className="font-mono text-[11px] tracking-[0.14em] text-dusk" suppressHydrationWarning>
      {prefix} — {time || "··:··"}
    </span>
  );
}
