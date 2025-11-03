
"use client";

import { useEffect, useState, useMemo } from "react";
import JSZip from "jszip";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Download } from "lucide-react";
import type { BannerVariation } from "./banner-buildr";

export const BannerPreviewCard: React.FC<BannerVariation> = ({
  name,
  files,
}) => {
  const [srcDoc, setSrcDoc] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Memoize the files object to prevent re-renders unless it changes
  const memoizedFiles = useMemo(() => files, [files]);

  useEffect(() => {
    setIsLoading(true);
    let blobUrls: string[] = [];

    const generateSrcDoc = async () => {
      // Find index.html case-insensitively
      const indexHtmlPath = Object.keys(memoizedFiles).find(p => p.toLowerCase() === 'index.html');

      if (!indexHtmlPath) {
        setSrcDoc("<html><body>Error: index.html not found in template.</body></html>");
        setIsLoading(false);
        return;
      }
      
      let finalHtml = memoizedFiles[indexHtmlPath];
      
      const fileProcessingPromises = Object.keys(memoizedFiles).map(async path => {
        const fileContent = memoizedFiles[path];
        const lowerCasePath = path.toLowerCase();
        const isJS = lowerCasePath.endsWith('.js');
        const isCSS = lowerCasePath.endsWith('.css');
        const isSVG = lowerCasePath.endsWith('.svg');
        const isJPG = lowerCasePath.endsWith('.jpg') || lowerCasePath.endsWith('.jpeg');
        const isPNG = lowerCasePath.endsWith('.png');
        const isGIF = lowerCasePath.endsWith('.gif');
        const isImage = isJPG || isPNG || isGIF || isSVG;

        if (isJS || isCSS || isImage) {
          let mimeType = 'application/octet-stream';
          if (isJS) mimeType = 'application/javascript';
          else if (isCSS) mimeType = 'text/css';
          else if (isSVG) mimeType = 'image/svg+xml';
          else if (isJPG) mimeType = 'image/jpeg';
          else if (isPNG) mimeType = 'image/png';
          else if (isGIF) mimeType = 'image/gif';
          
          // JSZip provides content as a string. For binary files like images, this can be an issue.
          // Assuming JSZip provides a base64 string for images if they were added that way, or we get raw text.
          // For now, creating blob from the provided content. This works for text-based assets.
          // For binary assets, we might need to adjust how zip is read if issues persist.
           const blob = new Blob([fileContent], { type: mimeType });
           const url = URL.createObjectURL(blob);
          blobUrls.push(url);

          // Regex to replace relative paths (./, / or just the filename)
          const pathRegex = new RegExp(`(src|href)=["'](./)?${path.replace('.', '\\.')}["']`, 'g');
          finalHtml = finalHtml.replace(pathRegex, `$1="${url}"`);
        }
      });

      await Promise.all(fileProcessingPromises);
      setSrcDoc(finalHtml);
      setIsLoading(false);
    };

    generateSrcDoc();

    return () => {
      blobUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [memoizedFiles]);

  const handleDownload = async () => {
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
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline truncate">{name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="aspect-video w-full bg-muted rounded-md overflow-hidden border">
          {isLoading ? (
             <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                Loading Preview...
             </div>
          ) : (
            <iframe
              srcDoc={srcDoc}
              title={name}
              sandbox="allow-scripts allow-same-origin"
              className="w-full h-full"
              loading="lazy"
            />
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleDownload} className="w-full" variant="secondary">
          <Download className="mr-2" />
          Download ZIP
        </Button>
      </CardFooter>
    </Card>
  );
};
