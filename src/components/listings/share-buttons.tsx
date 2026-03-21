"use client";

import { Share2, Check, Link2 } from "lucide-react";
import { useState } from "react";

interface ShareButtonsProps {
  title: string;
  compact?: boolean;
}

export function ShareButtons({ title, compact }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const share = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(title + " — USCEHub");

    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      reddit: `https://reddit.com/submit?url=${url}&title=${text}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      email: `mailto:?subject=${text}&body=Check%20this%20out:%20${url}`,
    };

    if (platform === "email") {
      window.location.href = urls[platform];
    } else {
      window.open(urls[platform], "_blank", "width=600,height=400");
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const btnClass = compact
    ? "flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700"
    : "flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700";

  const iconSize = compact ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <div>
      {!compact && (
        <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-700">
          <Share2 className="h-4 w-4" />
          Share
        </div>
      )}
      <div className="flex flex-wrap gap-1.5">
        {/* Twitter/X */}
        <button onClick={() => share("twitter")} className={btnClass} aria-label="Share on X" title="Share on X">
          <svg className={iconSize} fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </button>
        {/* Facebook */}
        <button onClick={() => share("facebook")} className={btnClass} aria-label="Share on Facebook" title="Facebook">
          <svg className={iconSize} fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </button>
        {/* WhatsApp */}
        <button onClick={() => share("whatsapp")} className={btnClass} aria-label="Share on WhatsApp" title="WhatsApp">
          <svg className={iconSize} fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </button>
        {/* Reddit */}
        <button onClick={() => share("reddit")} className={btnClass} aria-label="Share on Reddit" title="Reddit">
          <svg className={iconSize} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6.066 13.516c.036.232.054.468.054.708 0 3.612-4.212 6.54-9.408 6.54s-9.408-2.928-9.408-6.54c0-.24.018-.48.054-.708a1.728 1.728 0 01-.66-1.356 1.74 1.74 0 013.132-1.038c1.476-1.014 3.492-1.668 5.736-1.74l1.14-5.1a.36.36 0 01.432-.276l3.576.756a1.2 1.2 0 112.196.66l-3.468-.732-1.02 4.572c2.196.09 4.164.738 5.604 1.728A1.74 1.74 0 0119.8 12.16c0 .528-.234 1.002-.606 1.326a1.64 1.64 0 01-.128.03zM8.4 13.2a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4zm7.2 0a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4zm-6.516 3.804a.36.36 0 01.492-.12c.78.456 1.68.696 2.604.696s1.824-.24 2.604-.696a.36.36 0 01.372.612 5.88 5.88 0 01-2.976.804 5.88 5.88 0 01-2.976-.804.36.36 0 01-.12-.492z" />
          </svg>
        </button>
        {/* LinkedIn */}
        <button onClick={() => share("linkedin")} className={btnClass} aria-label="Share on LinkedIn" title="LinkedIn">
          <svg className={iconSize} fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        </button>
        {/* Email */}
        <button onClick={() => share("email")} className={btnClass} aria-label="Share via Email" title="Email">
          <svg className={iconSize} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </button>
        {/* Copy Link */}
        <button onClick={copyLink} className={btnClass} aria-label="Copy link" title={copied ? "Copied!" : "Copy link"}>
          {copied ? <Check className={iconSize + " text-emerald-500"} /> : <Link2 className={iconSize} />}
        </button>
      </div>
    </div>
  );
}
