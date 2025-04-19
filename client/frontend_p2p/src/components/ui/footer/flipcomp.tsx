"use client";

import { cn } from "../../../lib/utils";
import React, { useEffect, useRef } from "react";

export const InfiniteMovingCards = ({
  items,
  speed = "normal",
  pauseOnHover = false,
  className,
}: {
  items: {
    quote: string;
    name: string;
    title: string;
  }[];
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const scrollerRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!scrollerRef.current) return;

    const scroller = scrollerRef.current;
    const children = Array.from(scroller.children);
    children.forEach((child) => {
      const clone = child.cloneNode(true);
      scroller.appendChild(clone);
    });
  }, []);

  const getDuration = () => {
    if (speed === "fast") return "20s";
    if (speed === "slow") return "50s";
    return "30s"; // normal
  };

  return (
    <div
      className={cn(
        "w-full overflow-hidden relative",
        "[mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]",
        className
      )}
      style={{ "--animation-duration": getDuration() } as React.CSSProperties}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex w-max gap-4 animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
      >
        {items.map((item, idx) => (
          <li
            key={`${item.name}-${idx}`}
            className="w-[220px] lg:w-[280px] shrink-0 rounded-xl border border-zinc-200 bg-gradient-to-b from-zinc-50 to-zinc-100 px-4 py-3 dark:border-zinc-700 dark:from-zinc-800 dark:to-zinc-900"
          >
            <blockquote>
              <span className="block text-sm text-neutral-800 dark:text-neutral-100 leading-relaxed">
                {item.quote}
              </span>
              <footer className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
                <div className="font-semibold">{item.name}</div>
                <div>{item.title}</div>
              </footer>
            </blockquote>
          </li>
        ))}
      </ul>
    </div>
  );
};
