"use client";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { IconUpload, IconX } from "@tabler/icons-react";
import { cn } from "../../../lib/utils";

type FileUploadProps = {
  files?: File[];
  setFiles?: React.Dispatch<React.SetStateAction<File[]>>;
  onChange?: (files: File[]) => void;
  onSend?: (file: File) => void;
};

const mainVariant = {
  initial: { x: 0, y: 0 },
  animate: { x: 20, y: -20, opacity: 0.9 },
};

const FileUpload: React.FC<FileUploadProps> = ({
  files: controlledFiles,
  setFiles: setControlledFiles,
  onChange,
  onSend,
}) => {
  const [internalFiles, setInternalFiles] = useState<File[]>([]);
  const files = controlledFiles ?? internalFiles;
  const setFiles = setControlledFiles ?? setInternalFiles;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setFiles([]);
    onChange?.([]);
  };

  const handleFileChange = (newFiles: File[]) => {
    setFiles(newFiles);
    onChange?.(newFiles);
  };

  const { getRootProps } = useDropzone({
    multiple: false,
    noClick: true,
    onDrop: handleFileChange,
    onDropRejected: (error) => console.log(error),
  });

  return (
    <div className="w-full" {...getRootProps()}>
      <motion.div
        whileHover="animate"
        className="p-10 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden"
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
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
                  layoutId={`file-upload-${idx}`}
                  className={cn(
                    "relative z-40 bg-white dark:bg-neutral-900 flex flex-col items-start p-4 mt-4 w-full mx-auto rounded-md shadow-sm"
                  )}
                >
                  <button
                    onClick={handleRemove}
                    className="absolute top-2 right-2 z-50 text-white"
                  >
                    <IconX className="w-5 h-5" />
                  </button>

                  <div className="flex justify-between w-full items-center gap-4">
                    <motion.p className="text-base truncate max-w-xs text-neutral-700 dark:text-neutral-300">
                      {file.name}
                    </motion.p>
                    <motion.p className="text-sm rounded-lg px-2 py-1 dark:bg-neutral-800 text-neutral-600 dark:text-white">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </motion.p>
                  </div>

                  <div className="flex text-sm flex-col md:flex-row items-start md:items-center w-full mt-2 justify-between text-neutral-600 dark:text-neutral-400">
                    <motion.p className="px-1 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800">
                      {file.type}
                    </motion.p>
                    <motion.p>
                      Modified {new Date(file.lastModified).toLocaleDateString()}
                    </motion.p>
                  </div>

                  {onSend && (
                    <button
                      onClick={() => onSend(file)}
                      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1 rounded"
                    >
                      Send
                    </button>
                  )}
                </motion.div>
              ))}

            {!files.length && (
              <motion.div
                layoutId="file-upload"
                variants={mainVariant}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={cn(
                  "relative group-hover/file:shadow-2xl z-40 bg-white dark:bg-neutral-900 flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md",
                  "shadow-[0px_10px_50px_rgba(0,0,0,0.1)]"
                )}
              >
                <IconUpload className="w-10 h-10 text-neutral-300 dark:text-neutral-700" />
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FileUpload;
