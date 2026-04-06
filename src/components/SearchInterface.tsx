"use client";

import { useState } from "react";
import { Search, Loader2, Sparkles, PlayCircle, Image as ImageIcon, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import VideoPlayer from "./VideoPlayer";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface SourceChunk {
  timestamp: string;
  text: string;
  frame_path: string;
  video_id: string;
}

interface SearchResponse {
  answer: string;
  sources: SourceChunk[];
}

export default function SearchInterface() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [playingVideo, setPlayingVideo] = useState<{ videoId: string; timestamp: string } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setResults(null);
    setPlayingVideo(null);

    try {
      const response = await fetch(`${API}/api/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) throw new Error("Failed to fetch results");

      const data: SearchResponse = await response.json();
      setResults(data);
    } catch (error) {
      setResults({
        answer: "An error occurred. Make sure the backend is running and a video has been processed.",
        sources: [],
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="w-full flex flex-col space-y-5">
      {/* Search Bar */}
      <div className="glass-card border-pulse overflow-hidden">
        <form onSubmit={handleSearch} className="flex relative p-2">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 z-10">
            {isSearching ? (
              <Loader2 className="animate-spin text-[#00d4ff]" size={18} />
            ) : (
              <Search size={18} className="text-[#8b949e]" />
            )}
          </div>
          <input
            type="text"
            className="w-full bg-transparent border-none py-4 pl-12 pr-36 text-white placeholder-[#4a5568] focus:outline-none focus:ring-0 text-base rounded-xl font-light"
            placeholder="Ask anything about your video in any language..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isSearching}
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-black font-semibold py-2 px-5 rounded-lg transition-all shadow-[0_0_15px_rgba(0,212,255,0.25)] hover:shadow-[0_0_25px_rgba(0,212,255,0.4)] disabled:opacity-40 disabled:cursor-not-allowed hidden sm:flex items-center gap-1.5"
            disabled={!query.trim() || isSearching}
          >
            <Zap size={14} /> Search
          </button>
        </form>

        {/* Scanning animation when searching */}
        {isSearching && (
          <div className="h-0.5 w-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-transparent via-[#00d4ff] to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            />
          </div>
        )}
      </div>

      {/* Results */}
      <AnimatePresence mode="sync">
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col space-y-5"
          >
            {/* AI Answer Card */}
            <div className="glass-card p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none">
                <Sparkles size={128} className="text-[#00d4ff]" />
              </div>
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#00d4ff] to-[#7c3aed] rounded-l-2xl" />

              <h3 className="text-sm font-semibold flex items-center gap-2 mb-4 text-[#00d4ff] uppercase tracking-widest font-mono ml-2">
                <Sparkles size={14} /> AI Analysis
              </h3>
              <div className="prose prose-invert max-w-none ml-2">
                <p className="whitespace-pre-wrap text-[#c9d1d9] leading-relaxed text-sm">{results.answer}</p>
              </div>
            </div>

            {/* Sources Grid */}
            {results.sources.length > 0 && (
              <div>
                <h4 className="text-xs font-mono font-semibold uppercase tracking-widest text-[#8b949e] mb-3 ml-1">
                  ◈ Relevant Moments ({results.sources.length})
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {results.sources.map((source, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.07 }}
                      className="group glass-card cursor-pointer overflow-hidden transition-all duration-200 hover:border-[rgba(0,212,255,0.4)] hover:shadow-[0_0_25px_rgba(0,212,255,0.1)]"
                      onClick={() => setPlayingVideo({ videoId: source.video_id, timestamp: source.timestamp })}
                    >
                      {/* Frame Preview */}
                      <div className="w-full h-32 bg-black relative overflow-hidden flex-shrink-0">
                        {source.frame_path ? (
                          <img
                            src={`${API}/${source.frame_path.replace(/\\/g, "/")}`}
                            alt={`Frame at ${source.timestamp}`}
                            className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-300 group-hover:scale-105"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#8b949e]">
                            <ImageIcon size={32} className="opacity-30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-[rgba(0,0,0,0.7)] backdrop-blur px-2 py-1 rounded-md border border-[rgba(0,212,255,0.2)]">
                          <PlayCircle size={11} className="text-[#00d4ff]" />
                          <span className="text-white text-xs font-mono">{source.timestamp}</span>
                        </div>
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-[rgba(0,212,255,0.05)] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      {/* Text */}
                      <div className="p-3">
                        <p className="text-xs text-[#8b949e] line-clamp-3 leading-relaxed">
                          {source.text.split("\n").filter((l) => l.trim()).map((line, i) => (
                            <span key={i} className="block mb-0.5">
                              {line.startsWith("Visual") ? "👁 " : "🔊 "}
                              {line.replace(/Visual at \d+s:\s*/, "").replace(/Speech \[.*?\]:\s*/, "")}
                            </span>
                          ))}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Video player */}
            {playingVideo && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <h4 className="text-xs font-mono font-semibold uppercase tracking-widest text-[#8b949e] mb-3 ml-1">◈ Playing</h4>
                <VideoPlayer videoId={playingVideo.videoId} timestamp={playingVideo.timestamp} />
              </motion.div>
            )}

            {results.sources.length === 0 && (
              <div className="py-12 text-center text-[#8b949e] border-2 border-dashed border-[rgba(0,212,255,0.1)] rounded-xl font-mono text-sm">
                No strong matches found. Try a more specific query.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
