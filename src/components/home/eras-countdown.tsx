"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

function getErasInfo() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  // ERAS typically opens in September and runs through December
  // If we're in Sep-Dec, ERAS is open for the next match year
  if (month >= 8 && month <= 11) {
    return { open: true, matchYear: year + 1 };
  }

  // Otherwise, count down to next September
  const nextErasOpen = new Date(month < 8 ? year : year + 1, 8, 1); // September 1
  const diffMs = nextErasOpen.getTime() - now.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const matchYear = (month < 8 ? year : year + 1) + 1;

  return { open: false, days, matchYear };
}

export function ErasCountdown() {
  const [info, setInfo] = useState<{ open: boolean; days?: number; matchYear: number } | null>(null);

  useEffect(() => {
    // Client-only time-based seed AFTER hydration. Lazy init would
    // depend on Date.now() at render time, producing slightly different
    // values server vs client and risking hydration mismatch. The
    // current pattern renders nothing on the server (per the `if (!info)
    // return null` guard) and computes the countdown on mount. React 19
    // flags setState-in-effect as a cascading-render risk, but this is
    // the documented client-only-after-mount pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInfo(getErasInfo());
  }, []);

  if (!info) return null;

  return (
    <div className="flex items-center justify-center gap-1.5 border-b border-[#dfd5b8] bg-[#f0e9d3] py-2 text-xs text-[#4a5057] dark:border-[#34373f] dark:bg-[#23262e] dark:text-[#bfc1c9]">
      <Clock className="h-3 w-3 text-[#1a5454] dark:text-[#1a5454]" />
      {info.open ? (
        <span>
          ERAS {info.matchYear} is <span className="font-mono font-semibold text-[#1a5454] dark:text-[#1a5454]">OPEN</span> — apply now
        </span>
      ) : (
        <span>
          <span className="font-mono font-semibold text-[#0d1418] dark:text-[#f7f5ec]">{info.days}</span> days until ERAS {info.matchYear} opens
        </span>
      )}
    </div>
  );
}
