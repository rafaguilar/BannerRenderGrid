
"use client";

import { useState, useMemo } from "react";
import { Button } from "./ui/button";
import { Download, Info } from "lucide-react";
import type { BannerVariation } from "./banner-render-grid";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"

export const BannerPreviewCard: React.FC<BannerVariation> = ({
  name,
  bannerId,
  htmlFile,
  width,
  height,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const previewUrl = useMemo(() => {
    if (bannerId && htmlFile) {
        return `/api/preview/${bannerId}/${htmlFile}`;
    }
    return "";
  }, [bannerId, htmlFile]);
  

  const handleSingleDownload = async () => {
    if (!bannerId) {
      console.warn("No bannerId available for download for this variation.");
      return;
    }
    setIsDownloading(true);
    try {
        const response = await fetch(`/api/download/${bannerId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch banner for download');
        }
        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${name}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch(e) {
        console.error("Download failed", e);
    } finally {
        setIsDownloading(false);
    }
  };

  const effectiveWidth = width || 300;
  const effectiveHeight = height || 250;

  return (
     <div className="relative group border rounded-lg shadow-sm flex flex-col items-center p-2 bg-card">
        <div style={{ width: `${effectiveWidth}px`, height: `${effectiveHeight}px` }}>
            <div className="w-full h-full bg-muted rounded-md overflow-hidden border">
                {previewUrl ? (
                <iframe
                    src={previewUrl}
                    title={name}
                    sandbox="allow-scripts allow-same-origin"
                    className="w-full h-full border-0"
                    style={{ width: `${effectiveWidth}px`, height: `${effectiveHeight}px` }}
                    scrolling="no"
                    loading="lazy"
                />
                ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-center p-4">Preview not available</div>
                )}
            </div>
             <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                <Button onClick={handleSingleDownload} variant="secondary" size="icon" disabled={isDownloading}>
                    <Download />
                </Button>
            </div>
        </div>
        <div className="p-2 text-center w-full">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <p className="text-sm font-medium truncate text-foreground">{name}</p>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{name}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    </div>
  );
};
