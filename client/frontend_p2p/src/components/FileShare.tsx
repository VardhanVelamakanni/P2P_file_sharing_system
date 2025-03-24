"use client";

import React, { useEffect, useRef, useState } from "react";
import { IconUpload, IconX } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import socket from "../socket";
import { cn } from "../lib/utils";

const FileShare = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [receivedFiles, setReceivedFiles] = useState<{ name: string; url: string }[]>([]);
  const [connectionEstablished, setConnectionEstablished] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const incomingFileBuffer = useRef<Uint8Array[]>([]);
  const incomingFileName = useRef<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get("room");
    if (room) setRoomId(room);
  }, []);

  const handleClick = () => fileInputRef.current?.click();
  const handleRemove = () => setFiles([]);
  const handleFileChange = (newFiles: File[]) => setFiles(newFiles);

  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    noClick: true,
    onDrop: handleFileChange,
    onDropRejected: (error) => console.error("❌ Drop rejected:", error),
    onDragEnter: () => setIsHovering(true),
    onDragLeave: () => setIsHovering(false),
    onDragOver: () => setIsHovering(true),
  });

  const sendFile = async (file: File) => {
    if (!file || !roomId) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("roomId", roomId);

    try {
      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        console.log("✅ File uploaded and shared:", data);
      } else {
        console.error("❌ Upload error:", data.error);
      }
    } catch (err) {
      console.error("❌ Upload failed:", err);
    }
  };

  useEffect(() => {
    socket.on("file-shared", (fileInfo) => {
      const fileUrl = `http://localhost:5000${fileInfo.path}`;
      setReceivedFiles((prev) => [...prev, { name: fileInfo.originalname, url: fileUrl }]);
      console.log("📥 Received file info:", fileInfo);
    });

    return () => {
      socket.off("file-shared");
    };
  }, []);

  useEffect(() => {
    if (!roomId) return;

    const pc = new RTCPeerConnection();
    peerConnection.current = pc;

    dataChannel.current = pc.createDataChannel("chat");
    dataChannel.current.onopen = () => {
      console.log("📡 Data channel open");
      setConnectionEstablished(true);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { roomId, candidate: event.candidate });
      }
    };

    socket.emit("join-room", roomId);

    socket.on("user-joined", async () => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("offer", { roomId, offer });
    });

    socket.on("offer", async (offer) => {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", { roomId, answer });
    });

    socket.on("answer", async (answer) => {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("❌ Error adding ICE candidate:", err);
      }
    });

    return () => {
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("user-joined");
      pc.close();
    };
  }, [roomId]);

  return (
    <div className="w-full p-6" {...getRootProps()}>
      <div
        className={cn(
          "p-10 rounded-lg cursor-pointer w-full relative overflow-hidden group transition-all duration-200",
          isHovering ? "ring-4 ring-blue-400 bg-blue-50 dark:bg-blue-950" : ""
        )}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (!target.closest("button") && !target.closest("svg") && !target.closest("a")) {
            handleClick();
          }
        }}
      >
        <input ref={fileInputRef} type="file" onChange={(e) => handleFileChange(Array.from(e.target.files || []))} className="hidden" />
        <input {...getInputProps()} />

        {/* No zoom bg */}
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: "url('/assets/back.jpg')",
            maskImage: "radial-gradient(ellipse at center, white, transparent)",
            WebkitMaskImage: "radial-gradient(ellipse at center, white, transparent)",
          }}
        />

        <div className="relative z-10 flex flex-col items-center justify-center">
          <p className="text-neutral-700 dark:text-neutral-300 font-bold text-base">Upload File</p>
          <p className="text-neutral-400 dark:text-neutral-400 text-base mt-2">
            Drag & drop or click to upload
          </p>

          {/* File Preview */}
          <div className="relative w-full mt-10 max-w-xl mx-auto">
            {files.length > 0 &&
              files.map((file, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-neutral-900 flex flex-col items-start p-4 mt-4 w-full mx-auto rounded-md shadow-sm relative"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove();
                    }}
                    className="absolute top-2 right-2 text-white"
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
                    <p className="px-1 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800">
                      {file.type}
                    </p>
                    <p>
                      Modified {new Date(file.lastModified).toLocaleDateString()}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sendFile(file);
                    }}
                    disabled={!connectionEstablished}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1 rounded disabled:opacity-50"
                  >
                    {connectionEstablished ? "Send" : "Waiting..."}
                  </button>
                </div>
              ))}

            {!files.length && (
              <div
                onClick={handleClick}
                className="bg-white dark:bg-neutral-900 flex flex-col items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md shadow-lg transition-all hover:shadow-xl"
              >
                <IconUpload className="w-10 h-10 text-neutral-300 dark:text-neutral-700" />
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">Browse</p>
              </div>
            )}
          </div>

          {/* Received Files */}
          {receivedFiles.length > 0 && (
            <div className="mt-8 w-full max-w-xl">
              <h3 className="text-center text-lg font-semibold mb-2 text-neutral-700 dark:text-neutral-200">
                Received Files
              </h3>
              {receivedFiles.map((file, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-neutral-800 p-3 rounded shadow my-2 flex justify-between items-center"
                >
                  <span className="truncate max-w-[70%] text-sm dark:text-white">{file.name}</span>
                  <a
                    href={file.url}
                    download={file.name}
                    className="text-blue-500 text-sm hover:underline"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileShare;
