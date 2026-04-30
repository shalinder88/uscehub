"use client";

import { useState } from "react";
import { Share2, X, Check, Link2 } from "lucide-react";

export function ShareWidget() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const share = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent("USCEHub — The Largest IMG Opportunities Database");

    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      reddit: `https://reddit.com/submit?url=${url}&title=${text}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      email: `mailto:?subject=${decodeURIComponent(text)}&body=Check%20this%20out:%20${url}`,
    };

    if (platform === "email") {
      // Use the method form rather than assigning window.location.href —
      // satisfies react-hooks/immutability without behavior change.
      window.location.assign(urls[platform]);
    } else {
      window.open(urls[platform], "_blank", "width=600,height=400");
    }
    setOpen(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => { setCopied(false); setOpen(false); }, 1500);
  };

  const platforms = [
    { key: "twitter", label: "X / Twitter", icon: <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg> },
    { key: "facebook", label: "Facebook", icon: <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg> },
    { key: "whatsapp", label: "WhatsApp", icon: <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg> },
    { key: "reddit", label: "Reddit", icon: <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6.066 13.516c.036.232.054.468.054.708 0 3.612-4.212 6.54-9.408 6.54s-9.408-2.928-9.408-6.54c0-.24.018-.48.054-.708a1.728 1.728 0 01-.66-1.356 1.74 1.74 0 013.132-1.038c1.476-1.014 3.492-1.668 5.736-1.74l1.14-5.1a.36.36 0 01.432-.276l3.576.756a1.2 1.2 0 112.196.66l-3.468-.732-1.02 4.572c2.196.09 4.164.738 5.604 1.728A1.74 1.74 0 0119.8 12.16c0 .528-.234 1.002-.606 1.326zM8.4 13.2a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4zm7.2 0a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z" /></svg> },
    { key: "linkedin", label: "LinkedIn", icon: <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg> },
    { key: "email", label: "Email", icon: <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg> },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {open && (
        <div className="mb-3 w-48 rounded-xl border border-[#dfd5b8] bg-white p-3 shadow-xl dark:border-[#34373f] dark:bg-[#23262e]">
          <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1a5454] dark:text-[#1a5454]">Share this page</p>
          <div className="space-y-1">
            {platforms.map((p) => (
              <button
                key={p.key}
                onClick={() => share(p.key)}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-[#4a5057] transition-colors hover:bg-[#f0e9d3] hover:text-[#0d1418] dark:text-[#bfc1c9] dark:hover:bg-[#2a2d36] dark:hover:text-[#f7f5ec]"
              >
                {p.icon}
                {p.label}
              </button>
            ))}
            <button
              onClick={copyLink}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-[#4a5057] transition-colors hover:bg-[#f0e9d3] hover:text-[#0d1418] dark:text-[#bfc1c9] dark:hover:bg-[#2a2d36] dark:hover:text-[#f7f5ec]"
            >
              {copied ? <Check className="h-4 w-4 text-[#1a5454] dark:text-[#1a5454]" /> : <Link2 className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0d1418] text-white shadow-lg transition-transform hover:scale-105 hover:bg-[#0e3838] dark:bg-[#23262e] dark:hover:bg-[#2a2d36]"
        aria-label="Share"
      >
        {open ? <X className="h-5 w-5" /> : <Share2 className="h-5 w-5" />}
      </button>
    </div>
  );
}
