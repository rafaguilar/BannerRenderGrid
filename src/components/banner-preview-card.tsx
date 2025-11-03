
"use client";

import { useMemo, useState } from "react";
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
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // For generated variations, we need a way to serve them.
  // This is a placeholder for a more complex implementation.
  const [previewContent, setPreviewContent] = useState<string | null>(null);

  const previewUrl = useMemo(() => {
    // If it's the original uploaded banner, use the API route
    if (bannerId && htmlFile) {
      return `/api/preview/${bannerId}/${htmlFile}`;
    }
    // If it's a client-generated variation, create a blob URL
    if (previewContent) {
        const blob = new Blob([previewContent], { type: 'text/html' });
        return URL.createObjectURL(blob);
    }
    return "";
  }, [bannerId, htmlFile, previewContent]);

  // Effect to create client-side previews for generated banners
  useMemo(() => {
    if (!bannerId && files && Object.keys(files).length > 0) {
        // This is a simplified preview. For a full preview, we'd need to
        // bundle all assets, which is complex on the client.
        // Here, we just use the HTML content.
        const html = files['index.html'] || files[Object.keys(files).find(f => f.endsWith('.html'))!] || '<html><body>Preview not available</body></html>'
        
        // This is a rough way to handle local assets for preview
        const modifiedHtml = html.replace(/src="([^"]+)"/g, (match, src) => {
            if (src.startsWith('http') || src.startsWith('data:')) {
                return match;
            }
            // A more robust solution would be needed here for complex banners
            return `src="/api/preview/${name}/${src}"`
        });

        setPreviewContent(html);
    }
  }, [files, bannerId, name]);

  const handleSingleDownload = async () => {
    if (!Object.keys(files).length) {
      console.warn("No files available for download for this variation.");
      return;
    }

    setIsDownloading(true);
    const zip = new JSZip();
    
    // In a real scenario, for the original banner, we'd need to fetch all assets from the server
    // For generated banners, we only have the modified Dynamic.js
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
        {previewUrl ? (
          <iframe
            src={previewUrl}
            title={name}
            sandbox="allow-scripts allow-same-origin"
            className="w-full h-full border-0"
            style={{ width: `${effectiveWidth}px`, height: `${effectiveHeight}px` }}
            scrolling="no"
            loading="lazy"
            onLoad={() => setIsLoading(false)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            {isLoading ? "Loading Preview..." : "Preview not available."}
          </div>
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

    