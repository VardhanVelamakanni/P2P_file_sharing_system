"use client";
import React from "react";
import { StickyScroll } from "../component2/sticky-scroll-reveal";

const content = [
  {
    title: "Room-Based Peer Connection",
    description:
      "Users enter the same room ID to establish a private connection. This room ID is used to coordinate signaling between peers using Socket.IO. Once both users are in the room, a secure WebRTC connection is negotiated for real-time, direct data exchange without involving any server-side file storage.",
    content: (
      <div className="flex h-full w-full items-center justify-center">
        <img
          src="/assets/peer.png"
          alt="Room-Based Connection"
          className="h-full w-full object-cover rounded-xl"
        />
      </div>
    ),
  },
  {
    title: "WebRTC for Direct Transfer",
    description:
      "WebRTC handles the actual file transmission between browsers. It creates a peer-to-peer data channel that allows large files to be sent efficiently and securely without uploading to a server. This reduces latency and ensures privacy since files travel directly from one user's device to another’s.",
    content: (
      <div className="flex h-full w-full items-center justify-center">
        <img
          src="/assets/quick.jpg"
          alt="WebRTC Transfer"
          className="h-full w-full object-cover rounded-xl"
        />
      </div>
    ),
  },
  {
    title: "Chunked File Sending",
    description:
      "Files are split into small chunks before being sent over the WebRTC data channel. This helps maintain a smooth transfer, especially for large files, and avoids overloading the connection. Each chunk is reassembled on the receiving side to reconstruct the original file accurately and reliably.",
    content: (
      <div className="flex h-full w-full items-center justify-center">
        <img
          src="/assets/chunks.jpg"
          alt="Chunked Sending"
          className="h-full w-full object-cover rounded-xl"
        />
      </div>
    ),
  },
  {
    title: "Real-Time Communication with Socket.IO",
    description:
      "Socket.IO is used only for the initial signaling process—exchanging metadata like offers, answers, and ICE candidates. It helps both peers find each other and set up the WebRTC connection. Once the connection is established, all file data flows peer-to-peer without relying on the server.",
    content: (
      <div className="flex h-full w-full items-center justify-center">
        <img
          src="/assets/realtime.jpg"
          alt="Socket.IO Signaling"
          className="h-full w-full object-cover rounded-xl"
        />
      </div>
    ),
  },
];

export function StickyScrollRevealDemo() {
  return (
    <div className="w-full py-4">
      <StickyScroll content={content} />
    </div>
  );
}
