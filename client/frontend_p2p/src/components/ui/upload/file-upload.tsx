"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { IconUpload, IconX } from "@tabler/icons-react";
import { cn } from "../../../lib/utils";
import io from "socket.io-client";

const socket = io("http://localhost:5000"); // your backend server

const FileShare = () => {
  const [roomId, setRoomId] = useState<string>("");
  const [joined, setJoined] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);
  const remoteDataChannel = useRef<RTCDataChannel | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get("room");
    if (room) {
      setRoomId(room);
      socket.emit("join-room", room);
      setJoined(true);
    }
  }, []);

  // Setup signaling
  useEffect(() => {
    if (!roomId) return;

    socket.on("offer", async (offer: RTCSessionDescriptionInit) => {
      console.log("Received offer");
      peerConnection.current = createPeer(false);
      await peerConnection.current.setRemoteDescription(offer);
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      socket.emit("answer", { roomId, answer });
    });

    socket.on("answer", async (answer: RTCSessionDescriptionInit) => {
      console.log("Received answer");
      await peerConnection.current?.setRemoteDescription(answer);
    });

    socket.on("ice-candidate", async (candidate: RTCIceCandidateInit) => {
      console.log("Received ICE candidate");
      try {
        await peerConnection.current?.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Error adding received ice candidate", err);
      }
    });

    socket.on("joined-room", async () => {
      console.log("Another peer joined, creating offer");
      peerConnection.current = createPeer(true);
    });

    return () => {
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("joined-room");
    };
  }, [roomId]);

  const createPeer = (isInitiator: boolean): RTCPeerConnection => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { roomId, candidate: event.candidate });
      }
    };

    if (isInitiator) {
      dataChannel.current = pc.createDataChannel("file");
      setupDataChannel(dataChannel.current);
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .then(() => {
          socket.emit("offer", { roomId, offer: pc.localDescription });
        });
    } else {
      pc.ondatachannel = (event) => {
        remoteDataChannel.current = event.channel;
        setupDataChannel(remoteDataChannel.current);
      };
    }

    return pc;
  };

  const setupDataChannel = (channel: RTCDataChannel | null) => {
    if (!channel) return;

    channel.onopen = () => console.log("Data channel open");
    channel.onclose = () => console.log("Data channel closed");
    channel.onmessage = (e) => {
      const received = JSON.parse(e.data);
      const blob = new Blob([Uint8Array.from(received.buffer)], { type: received.type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = received.name;
      a.click();
      URL.revokeObjectURL(url);
    };
  };

  const handleSendFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const buffer = new Uint8Array(reader.result as ArrayBuffer);
      const data = {
        name: file.name,
        size: file.size,
        type: file.type,
        buffer: Array.from(buffer),
      };

      const channel = dataChannel.current || remoteDataChannel.current;
      if (channel?.readyState === "open") {
        channel.send(JSON.stringify(data));
        console.log("File sent");
      } else {
        alert("Connection not ready. Try again after a few seconds.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  };

  const handleRemove = () => {
    setFiles([]);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full px-4 pt-10">
      <div className="mb-4 text-right">
        <p className="text-sm text-neutral-400">Room: {roomId}</p>
      </div>

      <div className="w-full" {...useDropzone({ noClick: true, multiple: false, onDrop: handleDrop }).getRootProps()}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={handleClick}
          className={cn(
            "p-10 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden transition-all duration-200",
            "hover:ring-4 hover:ring-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
          />

          <div
            className="absolute inset-0 bg-cover bg-center z-0"
            style={{
              backgroundImage: "url('/assets/back.jpg')",
              maskImage: "radial-gradient(ellipse at center, white, transparent)",
              WebkitMaskImage: "radial-gradient(ellipse at center, white, transparent)",
            }}
          ></div>

          <div className="relative z-10 flex flex-col items-center justify-center">
            <p className="text-neutral-700 dark:text-neutral-300 font-bold text-base">Upload File</p>
            <p className="text-neutral-400 dark:text-neutral-400 text-base mt-2">
              Drag & drop or click to upload
            </p>

            <div className="relative w-full mt-10 max-w-xl mx-auto">
              {files.length > 0 &&
                files.map((file, idx) => (
                  <motion.div
                    key={idx}
                    className="relative bg-white dark:bg-neutral-900 flex flex-col items-start p-4 mt-4 w-full mx-auto rounded-md shadow-sm"
                  >
                    <button
                      onClick={handleRemove}
                      className="absolute top-2 right-2 z-50 text-white"
                    >
                      <IconX className="w-5 h-5" />
                    </button>

                    <div className="flex justify-between w-full items-center gap-4">
                      <p className="text-base truncate max-w-xs text-neutral-700 dark:text-neutral-300">
                        {file.name}
                      </p>
                      <p className="text-sm rounded-lg px-2 py-1 dark:bg-neutral-800 text-neutral-600 dark:text-white">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>

                    <div className="flex text-sm flex-col md:flex-row items-start md:items-center w-full mt-2 justify-between text-neutral-600 dark:text-neutral-400">
                      <p className="px-1 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800">{file.type}</p>
                      <p>Modified {new Date(file.lastModified).toLocaleDateString()}</p>
                    </div>

                    <button
                      onClick={() => handleSendFile(file)}
                      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1 rounded"
                    >
                      Send
                    </button>
                  </motion.div>
                ))}

              {!files.length && (
                <motion.div
                  layoutId="file-upload"
                  className={cn(
                    "relative group-hover/file:shadow-2xl z-40 flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md",
                    "bg-white/10 backdrop-blur-md border border-white/20 shadow-[0px_10px_50px_rgba(0,0,0,0.1)] dark:border-white/10"
                  )}
                >
                  <IconUpload className="w-10 h-10 text-neutral-300 dark:text-neutral-700" />
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FileShare;
