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
    const {
      "index.html": indexHtml,
      "style.css": styleCss,
      "script.js": scriptJs,
      "Dynamic.js": dynamicJs,
      ...rest
    } = files;

    if (!indexHtml) {
      setSrcDoc("<html><body>Error: index.html not found in template.</body></html>");
      return;
    }

    let finalHtml = indexHtml;

    const styleTag = `<style>${styleCss || ""}</style>`;
    if (finalHtml.includes("</head>")) {
      finalHtml = finalHtml.replace("</head>", `${styleTag}\n</head>`);
    } else {
      finalHtml = `<head>${styleTag}</head>${finalHtml}`;
    }

    const allScripts = [
      { id: "Dynamic.js", content: dynamicJs },
      { id: "script.js", content: scriptJs },
      ...Object.entries(rest).map(([fileName, fileContent]) => ({ id: fileName, content: fileContent }))
    ];

    const scriptTags = allScripts
      .filter((s) => s.content)
      .map((s) => `<script id="${s.id}">${s.content}</script>`)
      .join("\n");

    if (finalHtml.includes("</body>")) {
      finalHtml = finalHtml.replace("</body>", `${scriptTags}\n</body>`);
    } else {
      finalHtml += scriptTags;
    }

    setSrcDoc(finalHtml);
  }, [files]);

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
        <CardDescription>Generated banner variation</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="aspect-video w-full bg-muted rounded-md overflow-hidden border">
          <iframe
            srcDoc={srcDoc}
            title={name}
            sandbox="allow-scripts"
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
