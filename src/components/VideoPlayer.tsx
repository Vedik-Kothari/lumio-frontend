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
    <div className="glass-card overflow-hidden relative aspect-video flex items-center justify-center shadow-[0_0_40px_rgba(0,212,255,0.1)]">
      {/* Neon border effect */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{
        background: "linear-gradient(135deg, rgba(0,212,255,0.1) 0%, transparent 50%, rgba(124,58,237,0.1) 100%)"
      }} />

      {!isVideoLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10">
          <Loader2 className="animate-spin text-[#00d4ff] mb-3" size={28} />
          <span className="text-xs font-mono text-[#8b949e]">Loading video stream...</span>
        </div>
      )}

      <video
        ref={videoRef}
        key={videoId}
        className="w-full h-full object-contain bg-black"
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
