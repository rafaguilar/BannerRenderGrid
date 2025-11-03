
"use client";

import { useMemo, useState, useEffect } from "react";
import JSZip from "jszip";
import { Button } from "./ui/button";
import { Download } from "lucide-react";
import type { BannerVariation } from "./banner-buildr";

export const BannerPreviewCard: React.FC<BannerVariation> = ({
  name,
  files,
  bannerId,
  htmlFile,
  width,
  height,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let objectUrl: string | null = null;
    const generatePreview = async () => {
        setIsLoading(true);
        if (bannerId && htmlFile) {
            setPreviewUrl(`/api/preview/${bannerId}/${htmlFile}`);
        } else if (files && htmlFile) {
            try {
                const htmlContentBuffer = files[htmlFile];
                if (!htmlContentBuffer) {
                    throw new Error(`HTML file '${htmlFile}' not found in variation files.`);
                }
                const htmlContent = Buffer.isBuffer(htmlContentBuffer) ? htmlContentBuffer.toString('utf-8') : htmlContentBuffer;

                const blobPromises = Object.entries(files).map(async ([fileName, fileContent]) => {
                    const mimeType = fileName.endsWith('.js') ? 'application/javascript' :
                                   fileName.endsWith('.css') ? 'text/css' :
                                   fileName.endsWith('.html') ? 'text/html' :
                                   'application/octet-stream';

                    const blob = new Blob([fileContent], { type: mimeType });
                    return { fileName, blob };
                });

                const blobs = await Promise.all(blobPromises);
                const blobMap = new Map(blobs.map(({ fileName, blob }) => [fileName, URL.createObjectURL(blob)]));
                
                let finalHtml = htmlContent;

                // Replace all local asset paths with blob URLs
                for (const [fileName, blobUrl] of blobMap.entries()) {
                    // Regex to find src="...", href="..." and url(...)
                    const srcRegex = new RegExp(`src=["'](./)?${fileName}["']`, 'g');
                    const hrefRegex = new RegExp(`href=["'](./)?${fileName}["']`, 'g');
                    
                    finalHtml = finalHtml.replace(srcRegex, `src="${blobUrl}"`);
                    finalHtml = finalHtml.replace(hrefRegex, `href="${blobUrl}"`);
                }

                const finalHtmlBlob = new Blob([finalHtml], { type: 'text/html' });
                objectUrl = URL.createObjectURL(finalHtmlBlob);
                setPreviewUrl(objectUrl);

            } catch (error) {
                console.error("Error creating client-side preview:", error);
                setPreviewUrl("");
            }
        }
        setIsLoading(false);
    };

    generatePreview();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [name, files, bannerId, htmlFile]);


  const handleSingleDownload = async () => {
    if (!Object.keys(files).length) {
      console.warn("No files available for download for this variation.");
      return;
    }

    setIsDownloading(true);
    const zip = new JSZip();
    
    for (const fileName in files) {
       zip.file(fileName, files[fileName]);
    }
    
    const blob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${name}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsDownloading(false);
  };

  const effectiveWidth = width || 300;
  const effectiveHeight = height || 250;

  return (
    <div className="relative group" style={{ width: `${effectiveWidth}px`, height: `${effectiveHeight}px` }}>
      <div className="w-full h-full bg-muted rounded-md overflow-hidden border">
        {isLoading && (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">Loading Preview...</div>
        )}
        {!isLoading && previewUrl ? (
          <iframe
            src={previewUrl}
            title={name}
            sandbox="allow-scripts"
            className="w-full h-full border-0"
            style={{ width: `${effectiveWidth}px`, height: `${effectiveHeight}px` }}
            scrolling="no"
            loading="lazy"
            onLoad={() => setIsLoading(false)}
          />
        ) : (
          !isLoading && <div className="w-full h-full flex items-center justify-center text-muted-foreground text-center p-4">Preview not available</div>
        )}
      </div>
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
        <Button onClick={handleSingleDownload} variant="secondary" size="icon" disabled={isDownloading}>
          <Download />
        </Button>
      </div>
    </div>
  );
};

    