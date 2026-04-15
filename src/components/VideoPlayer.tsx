"use client";

import { useRef, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function VideoPlayer({ videoId, timestamp }: { videoId: string; timestamp: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  const parseTimeToSeconds = (ts: string) => {
    try {
      const startStr = ts.split("-")[0].trim();
      const [mins, secs] = startStr.split(":").map(Number);
      return mins * 60 + secs;
    } catch {
      return 0;
    }
  };

  useEffect(() => { setIsVideoLoaded(false); }, [videoId]);

  useEffect(() => {
    if (isVideoLoaded && videoRef.current) {
      const seconds = parseTimeToSeconds(timestamp);
      videoRef.current.currentTime = seconds;
      videoRef.current.play().catch(() => {});
    }
  }, [timestamp, isVideoLoaded]);

  return (
    <div className="glass-card relative flex aspect-video items-center justify-center overflow-hidden rounded-[28px] shadow-[var(--shadow-strong)]">
      <div
        className="pointer-events-none absolute inset-0 rounded-[28px]"
        style={{
          background:
            "linear-gradient(135deg, rgba(34,211,238,0.14) 0%, rgba(251,191,36,0.08) 44%, rgba(16,185,129,0.12) 100%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.12),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(180deg,transparent,rgba(2,6,23,0.82))]" />

      {!isVideoLoaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
          <Loader2 className="mb-3 animate-spin text-[var(--primary)]" size={28} />
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Loading timeline stream</span>
        </div>
      )}

      <video
        ref={videoRef}
        key={videoId}
        className="h-full w-full bg-black object-contain"
        controls
        playsInline
        onLoadedData={() => setIsVideoLoaded(true)}
      >
        <source src={`${API}/api/video/${videoId}`} type="video/mp4" />
        <source src={`${API}/api/video/${videoId}`} type="video/webm" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
