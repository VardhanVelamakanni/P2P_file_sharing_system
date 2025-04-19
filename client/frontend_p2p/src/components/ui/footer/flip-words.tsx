"use client";

import React from "react";
import { InfiniteMovingCards } from "../footer/flipcomp";

export function InfiniteMovingCardsDemo() {
  return (
    <div className="h-[20rem] flex flex-col items-center justify-center relative overflow-hidden rounded-md antialiased bg-white dark:bg-black dark:bg-grid-white/[0.1]">
      {/* Remove internal padding/gap above and below */}
      <div className="w-full">
        <InfiniteMovingCards
          items={testimonials}
          
          speed="slow"
        />
      </div>
    </div>
  );
}

const testimonials = [
  {
    quote:
      "Came up with the big idea, led backend wizardry, and even dabbled in frontend spells. Basically the architect who made sure the whole castle didn’t fall apart.",
    name: "Hemavardhan",
    title: "Backend • Frontend • Idea Machine",
  },
  {
    quote:
      "Got sockets talking and WebRTC waving — made real-time feel real. He’s the reason our app doesn’t ghost users on sharing files.",
    name: "Satya Koushik",
    title: "WebSockets • WebRTC • Real-time Whisperer",
  },
  {
    quote:
      "Styled the frontend into a work of art. If you’ve ever admired the UI, you’ve witnessed Avinash’s pixel-perfect sorcery.",
    name: "Avinash Reddy",
    title: "Frontend Developer • Pixel Perfectionist",
  },
  {
    quote:
      "Brought the frontend to life with flair and flair. Made sure users enjoy not just what it does on paper, but how it looks doing it.",
    name: "Ganesh",
    title: "Frontend Developer • Design Enchanter",
  },
  {
    quote:
      "Guided us through bugs and breakdowns. Debugged like a caffeinated senior dev trapped in a chatbot. Always there, never tired.",
    name: "ChatGPT",
    title: "Tech Support • Sanity Saver",
  },
];
