// src/components/ui/cover/BackgroundWrapper.tsx

import React from "react";
import { ShootingStars } from "./shooting-stars";
import { StarsBackground } from "./stars-background";

export function BackgroundWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <ShootingStars />
      <StarsBackground />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
