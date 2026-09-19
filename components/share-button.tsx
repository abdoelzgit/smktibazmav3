"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

interface ShareButtonProps {
  shareUrl: string;
}

export function ShareButton({ shareUrl }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Fallback for non-https / older browsers
        const textarea = document.createElement("textarea");
        textarea.value = shareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Gagal menyalin tautan:", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          <span>Tautan Disalin!</span>
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          <span>Salin Tautan</span>
        </>
      )}
    </button>
  );
}
