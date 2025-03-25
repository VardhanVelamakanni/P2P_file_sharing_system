"use client";

import React, { useState } from "react";
import { Cover } from "./cover";
import FileShare from "../../FileShare";
import { PlaceholdersAndVanishInput } from "../roombar/placeholders-and-vanish-input";

export function CoverDemo() {
  const [joined, setJoined] = useState(false);
  const [roomCode, setRoomCode] = useState("");

  const placeholders = [
    "Room Code,No peeking",
    "Got a Code?",
    "Eg:123,ABC",
    "Ready to Connect?",
    "The Gate needs a CODE",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomCode(e.target.value);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (roomCode.trim()) {
      // Wait 0.75 seconds before joining
      setTimeout(() => {
        // Set URL parameter
        const url = new URL(window.location.href);
        url.searchParams.set("room", roomCode);
        window.history.replaceState({}, "", url.toString());

        setJoined(true);
        console.log("✅ Joined Room:", roomCode);
      }, 750);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start pt-32 relative w-full">
      {/* Main Title */}
      <h1 className="text-xl md:text-4xl lg:text-5xl font-semibold max-w-7xl mx-auto text-center absolute top-8 left-0 right-0 z-20 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-3=800">
  Just Drop: Quick drop,<Cover>Instant pop</Cover>
</h1>


      {/* Room Input */}
      {!joined && (
        <div className="w-full max-w-2xl mx-auto z-20 pt-36">
          <PlaceholdersAndVanishInput
            placeholders={placeholders}
            onChange={handleChange}
            onSubmit={onSubmit}
          />
        </div>
      )}

      {/* Room ID Heading + Upload UI */}
      {joined && (
        
          <FileShare />
       
      )}
    </div>
  );
}
