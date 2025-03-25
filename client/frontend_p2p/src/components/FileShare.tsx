"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { IconUpload, IconX } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import socket from "../socket";
import { cn } from "../lib/utils";
import { HoverBorderGradient } from "../components/ui/bordergradient/hover-border-gradient";

const FileShare = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [receivedFiles, setReceivedFiles] = useState<{ name: string; url: string }[]>([]);
  const [connectionEstablished, setConnectionEstablished] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [fileSent, setFileSent] = useState(false);

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
    setFileSent(false);
  }, []);

  const handleFileChange = useCallback((newFiles: File[]) => {
    setFiles(newFiles);
    setFileSent(false);
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
    setFileSent(true);

    setTimeout(() => {
      setFileSent(false);
      setFiles([]);
    }, 3000);
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
  });

  return (
    <div className="w-full p-6" {...getRootProps()}>
      <input {...getInputProps()} />
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
      />

      <div className="w-full max-w-xl mx-auto space-y-6">
        {/* Room ID Display */}
        {roomId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="absolute top-4 right-6 bg-neutral-800 text-white text-xs px-3 py-1 rounded-full shadow"
          >
            Room ID: {roomId}
          </motion.div>
        )}

        {/* Upload Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center"
        >
          <HoverBorderGradient
            as="button"
            onClick={handleClick}
            containerClassName="rounded-lg p-[2px] bg-gradient-to-r from-grey-400 via-white-300 to-grey-500"
            className="bg-white dark:bg-black text-black dark:text-white px-8 py-12 w-full text-center space-y-3"
          >
            <IconUpload className="w-8 h-8 mx-auto mb-2" />
            <p className="font-semibold text-lg">Upload File</p>
            <p className="text-sm text-gray-500 dark:text-neutral-400">Upload or Drag your files here</p>
          </HoverBorderGradient>
        </motion.div>

        {/* File Preview & Send */}
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-neutral-900 p-4 rounded-md shadow-sm relative"
          >
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 text-neutral-500 hover:text-red-500"
            >
              <IconX className="w-5 h-5" />
            </button>
            <p className="text-neutral-700 dark:text-neutral-300 font-medium truncate">{files[0].name}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {(files[0].size / (1024 * 1024)).toFixed(2)} MB
            </p>
            <p className="text-sm mt-2 text-neutral-500 dark:text-neutral-400">
              {connectionEstablished ? "Ready to send" : "Waiting for peer..."}
            </p>

            <div className="mt-4 flex justify-center">
              <HoverBorderGradient
                as="button"
                onClick={() => {
                  if (connectionEstablished && !fileSent) sendFile();
                }}
                containerClassName={cn(
                  "rounded-lg p-[2px]",
                  (!connectionEstablished || fileSent) && "opacity-50 cursor-not-allowed"
                )}
                className={cn(
                  "bg-white dark:bg-black text-black dark:text-white px-6 py-3 text-sm font-semibold",
                  "transition-all duration-300 w-full flex items-center justify-center gap-2"
                )}
              >
                {fileSent ? (
                  <>
                    <span>✔️</span>
                    <span>Sent</span>
                  </>
                ) : connectionEstablished ? (
                  "Send File"
                ) : (
                  "Waiting for Peer..."
                )}
              </HoverBorderGradient>
            </div>
          </motion.div>
        )}

        {/* Received Files */}
        {receivedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mt-4"
          >
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
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FileShare;
