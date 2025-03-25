"use client";

import React, { useState } from "react";
import { Cover } from "./cover";
import FileShare from "../../FileShare";
import { PlaceholdersAndVanishInput } from "../roombar/placeholders-and-vanish-input";

export function CoverDemo() {
  const [joined, setJoined] = useState(false);
  const [roomCode, setRoomCode] = useState("");

  const placeholders = [
    "Enter Room Code",
    "Your secret warp key",
    "Room ID please...",
    "Drop a room code to enter",
    "Where are we sending files?",
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
      <h1 className="text-4xl md:text-4xl lg:text-6xl font-semibold max-w-7xl mx-auto text-center absolute top-8 left-0 right-0 z-20 bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-700 dark:from-neutral-800">
        Share files at <Cover>warp speed</Cover>
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
