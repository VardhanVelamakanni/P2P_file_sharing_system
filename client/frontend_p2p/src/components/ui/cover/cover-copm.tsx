"use client";

import React, { useEffect, useState } from "react";
import { Cover } from "./cover";
import FileShare from "../../FileShare"; // Adjust path if needed

export function CoverDemo() {
  const [roomCode, setRoomCode] = useState("");
  const [joined, setJoined] = useState(false);

  // ✅ Auto-join if URL has ?room=xyz
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomFromURL = params.get("room");

    if (roomFromURL) {
      setRoomCode(roomFromURL);
      setJoined(true);
      console.log("✅ Auto-joined room from URL:", roomFromURL);
    }
  }, []);

  const handleJoinRoom = () => {
    if (roomCode.trim()) {
      setJoined(true);

      // ✅ Add ?room=xyz to URL so FileShare can use it
      const url = new URL(window.location.href);
      url.searchParams.set("room", roomCode);
      window.history.replaceState({}, "", url.toString());

      console.log("✅ Manually joined room:", roomCode);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start pt-32 relative w-full">
      {/* Main Title */}
      <h1 className="text-4xl md:text-4xl lg:text-6xl font-semibold max-w-7xl mx-auto text-center absolute top-8 left-0 right-0 z-20 bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-700 dark:from-neutral-800">
        Share files at <Cover>warp speed</Cover>
      </h1>

      {/* Subtitle */}
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium max-w-4xl mx-auto text-center relative z-20 pb-10 bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-700 dark:from-neutral-800">
        {joined ? `Room: ${roomCode}` : "Join a Room to Share Files"}
      </h2>

      {/* Room Join Input (only if not joined yet) */}
      {!joined && (
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto z-20 pb-10">
          <input
            type="text"
            placeholder="Enter Room Code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-black text-black dark:text-white placeholder-gray-500"
          />
          <button
            onClick={handleJoinRoom}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-neutral-800 transition-colors"
          >
            Join
          </button>
        </div>
      )}

      {/* FileShare appears after joining */}
      {joined && (
        <div className="w-full max-w-4xl mx-auto z-20">
          <FileShare />
        </div>
      )}
    </div>
  );
}
