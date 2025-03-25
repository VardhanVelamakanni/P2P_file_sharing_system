import React from "react";
import { FlipWords } from "../footer/flip-words";

export function FlipWordsDemo() {
  const names = [
    "Hemavardhan (writes code)",
    "Ganesh (breaks things)",
    "Avinash (fixes it later)",
    "Koushik (still confused)",
  ];

  return (
    <div className="flex justify-center items-center px-4 py-0 my-0 leading-none h-auto mb-20">
      <div className="text-4xl font-normal text-neutral-600 dark:text-neutral-400 text-center leading-none py-0 my-0">
        This Application Is built by <br />
        <FlipWords words={names} />
      </div>
    </div>
  );
}
