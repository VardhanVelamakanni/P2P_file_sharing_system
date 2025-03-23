// CoverDemo.tsx
"use client";
import React, { useState } from "react";
import { Cover } from "./cover";
import { FileUpload } from "../upload/file-upload";

export function CoverDemo() {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileUpload = (files: File[]) => {
    setFiles(files);
    console.log(files);
  };

  return (
    <div className="flex flex-col items-center justify-start pt-32 relative w-full">
      {/* Main Title */}
      <h1 className="text-4xl md:text-4xl lg:text-6xl font-semibold max-w-7xl mx-auto text-center absolute top-8 left-0 right-0 z-20 bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-700 dark:from-neutral-800">
        Share files at <Cover>warp speed</Cover>
      </h1>


      {/* Subtitle with upload prompt */}
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium max-w-4xl mx-auto text-center relative z-20 pb-10 bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-700 dark:from-neutral-800">
        Upload your files or content
      </h2>

      {/* File Upload Component */}
      <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg z-20">
        <FileUpload onChange={handleFileUpload} />
      </div>
    </div>
  );
}
