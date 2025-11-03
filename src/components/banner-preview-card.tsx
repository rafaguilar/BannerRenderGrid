"use client";

import { useEffect, useState } from "react";
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
import { Download, Eye } from "lucide-react";
import type { BannerVariation } from "./banner-buildr";

export const BannerPreviewCard: React.FC<BannerVariation> = ({
  name,
  files,
}) => {
  const [srcDoc, setSrcDoc] = useState("");

  useEffect(() => {

    const indexHtmlPath = Object.keys(files).find(path => path.endsWith('index.html'));
    let finalHtml = indexHtmlPath ? files[indexHtmlPath] : "<html><body>Error: index.html not found in template.</body></html>";
    
    if (!indexHtmlPath) {
      setSrcDoc(finalHtml);
      return;
    }
    
    // Create blobs for CSS and JS files and generate object URLs
    const blobUrls: string[] = [];

    const stylePaths = Object.keys(files).filter(path => path.endsWith('.css'));
    const styleTags = stylePaths.map(path => {
        const blob = new Blob([files[path]], { type: 'text/css' });
        const url = URL.createObjectURL(blob);
        blobUrls.push(url);
        return `<link rel="stylesheet" href="${url}">`;
    }).join('\n');

    if (finalHtml.includes("</head>")) {
      finalHtml = finalHtml.replace("</head>", `${styleTags}\n</head>`);
    } else {
      finalHtml = `<head>${styleTags}</head>${finalHtml}`;
    }

    const scriptPaths = Object.keys(files).filter(path => path.endsWith('.js'));
    const scriptTags = scriptPaths.map(path => {
        const blob = new Blob([files[path]], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        blobUrls.push(url);
        // Ensure Dynamic.js is loaded first if it exists
        if (path.endsWith('Dynamic.js')) {
            return `<script src="${url}" id="Dynamic.js"></script>`;
        }
        return `<script src="${url}"></script>`;
    }).sort((a,b) => a.includes('Dynamic.js') ? -1 : 1).join('\n');

    if (finalHtml.includes("</body>")) {
      finalHtml = finalHtml.replace("</body>", `${scriptTags}\n</body>`);
    } else {
      finalHtml += scriptTags;
    }

    setSrcDoc(finalHtml);

    return () => {
      blobUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [files]);

  const handleDownload = async () => {
    const zip = new JSZip();
    for (const fileName in files) {
       // Get base name of the file
       const baseName = fileName.split('/').pop() || fileName;
       zip.file(baseName, files[fileName]);
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
        <CardDescription>Generated banner variation</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="aspect-video w-full bg-muted rounded-md overflow-hidden border">
          <iframe
            srcDoc={srcDoc}
            title={name}
            sandbox="allow-scripts allow-same-origin"
            className="w-full h-full"
            loading="lazy"
          />
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
