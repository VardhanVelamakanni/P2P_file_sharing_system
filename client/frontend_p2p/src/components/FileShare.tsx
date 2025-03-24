"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { IconUpload, IconX } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";
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
  const incomingFileBuffer = useRef<Uint8Array[]>([]);
  const incomingFileName = useRef<string | null>(null);
  const incomingFileSize = useRef<number>(0);
  const receivedSize = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get("room");
    if (room) setRoomId(room);
  }, []);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleRemove = useCallback(() => {
    setFiles([]);
  }, []);

  const handleFileChange = useCallback((newFiles: File[]) => {
    setFiles(newFiles);
  }, []);

  const sendFile = useCallback(async () => {
    const file = files[0];
    if (!file || !dataChannel.current || dataChannel.current.readyState !== "open") return;

    const chunkSize = 16 * 1024;
    const buffer = await file.arrayBuffer();
    const totalChunks = Math.ceil(buffer.byteLength / chunkSize);

    dataChannel.current.send(JSON.stringify({ type: "metadata", name: file.name, size: buffer.byteLength }));

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(buffer.byteLength, start + chunkSize);
      const chunk = buffer.slice(start, end);
      dataChannel.current.send(chunk);
    }

    console.log("✅ File sent successfully");
  }, [files]);

  const setupDataChannelListeners = (channel: RTCDataChannel) => {
    channel.binaryType = "arraybuffer";

    channel.onopen = () => {
      console.log("📡 Data channel open");
      setConnectionEstablished(true);
    };

    channel.onmessage = (event) => {
      if (typeof event.data === "string") {
        try {
          const message = JSON.parse(event.data);
          if (message.type === "metadata") {
            incomingFileName.current = message.name;
            incomingFileSize.current = message.size;
            incomingFileBuffer.current = [];
            receivedSize.current = 0;
          }
        } catch (err) {
          console.error("Invalid JSON:", err);
        }
      } else {
        incomingFileBuffer.current.push(new Uint8Array(event.data));
        receivedSize.current += event.data.byteLength;

        if (receivedSize.current === incomingFileSize.current) {
          const receivedBlob = new Blob(incomingFileBuffer.current);
          const url = URL.createObjectURL(receivedBlob);
          setReceivedFiles((prev) => [
            ...prev,
            { name: incomingFileName.current || "unknown", url },
          ]);
          console.log("📥 File received and assembled");
        }
      }
    };
  };

  useEffect(() => {
    if (!roomId) return;

    const pc = new RTCPeerConnection();
    peerConnection.current = pc;

    const createDataChannel = () => {
      dataChannel.current = pc.createDataChannel("file");
      setupDataChannelListeners(dataChannel.current);
    };

    pc.ondatachannel = (event) => {
      dataChannel.current = event.channel;
      setupDataChannelListeners(dataChannel.current);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { roomId, candidate: event.candidate });
      }
    };

    socket.emit("join-room", roomId);

    socket.on("user-joined", () => {
      createDataChannel();
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .then(() => {
          socket.emit("offer", { roomId, offer: pc.localDescription });
        });
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
        console.error("Error adding ICE candidate:", err);
      }
    });

    return () => {
      socket.off("user-joined");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      pc.close();
    };
  }, [roomId]);

  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    noClick: true,
    onDrop: handleFileChange,
    onDropRejected: (error) => console.error("Drop rejected:", error),
    onDragEnter: () => setIsHovering(true),
    onDragLeave: () => setIsHovering(false),
    onDragOver: () => setIsHovering(true),
  });

  return (
    <div className="w-full p-6" {...getRootProps()}>
      <div
        className={cn(
          "p-10 rounded-lg cursor-pointer w-full relative overflow-hidden group transition-all duration-200",
          isHovering ? "ring-4 ring-blue-400 bg-blue-50 dark:bg-blue-950" : ""
        )}
        onClick={(e) => {
          const el = e.target as Element;
          const isInteractive = el.closest("button") || el.closest("svg") || el.closest("a");
          if (!isInteractive) handleClick();
        }}
      >
        <input {...getInputProps()} />
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
        />

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

                  <p className="text-sm mt-2 text-neutral-500 dark:text-neutral-400">
                    {connectionEstablished ? "Ready to send" : "Waiting for peer..."}
                  </p>

                  {connectionEstablished && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        sendFile();
                      }}
                      className="mt-4 px-4 py-1.5 text-sm font-medium rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-all"
                    >
                      Send
                    </button>
                  )}
                </div>
              ))}

            {!files.length && (
              <div
                onClick={handleClick}
                className="bg-white dark:bg-neutral-900 flex flex-col items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md shadow-lg transition-all hover:shadow-xl hover:ring-2 hover:ring-blue-400"
              >
                <IconUpload className="w-10 h-10 text-neutral-300 dark:text-neutral-700" />
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">Browse</p>
              </div>
            )}
          </div>

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
