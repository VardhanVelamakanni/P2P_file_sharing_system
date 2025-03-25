import React from "react";
import { FlipWords } from "../footer/flip-words";

export function FlipWordsDemo() {
  const names = [
    "Name 1 (writes code)",
    "Name 2 (breaks things)",
    "Name 3 (fixes it later)",
    "Name 4 (says 'it works')",
    "Name 5 (still confused)",
  ];

  return (
    <div className="flex justify-center items-center px-4 py-0 my-0 leading-none h-auto mb-20">
      <div className="text-4xl font-normal text-neutral-600 dark:text-neutral-400 text-center leading-none py-0 my-0">
        This project was built by <br />
        <FlipWords words={names} />
      </div>
    </div>
  );
}
