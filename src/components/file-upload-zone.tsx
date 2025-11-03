"use client";

import { cn } from "@/lib/utils";
import React, { useRef, useState } from "react";
import { Button } from "./ui/button";

interface FileUploadZoneProps {
  onFileUpload: (file: File) => void;
  title: string;
  description: string;
  accept: string;
  Icon: React.ElementType;
  className?: string;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFileUpload,
  title,
  description,
  accept,
  Icon,
  className,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={cn(
        "relative w-full text-center p-8 border-2 border-dashed rounded-lg transition-colors duration-200",
        isDragActive ? "border-primary bg-primary/10" : "border-border",
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        id="file-upload"
        className="hidden"
        accept={accept}
        onChange={handleChange}
      />
      <div className="flex flex-col items-center gap-4">
        <div className="bg-secondary p-4 rounded-full">
            <Icon className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold font-headline">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
        <Button onClick={onButtonClick} variant="outline">
          Select File
        </Button>
      </div>
    </div>
  );
};
