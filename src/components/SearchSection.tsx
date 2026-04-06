'use client';
import { useState } from 'react';
import { Search, Clock, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SearchSection() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setResult({ answer: "An error occurred while fetching the answer.", sources: [] });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-neutral-500 group-focus-within:text-indigo-400 transition-colors" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. 'Show the slide with bar chart' or 'When did we discuss the Q3 revenue?'"
          className="w-full bg-neutral-900 border border-white/10 rounded-2xl py-4 flex-1 pl-12 pr-32 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="absolute inset-y-2 right-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-600 text-white font-medium px-6 rounded-xl transition-colors"
        >
          {isLoading ? "Searching..." : "Search"}
        </button>
      </form>

      {/* Results Workspace */}
      <div className="flex-1 bg-neutral-950/80 rounded-2xl border border-white/5 p-6 min-h-[500px]">
        {!result && !isLoading && (
          <div className="h-full w-full flex flex-col items-center justify-center text-neutral-500 space-y-4 mt-24 opacity-60">
            <Search className="w-12 h-12" />
            <p className="text-sm font-medium">Enter a natural language query to begin tracking visual and audio data.</p>
          </div>
        )}
        
        {isLoading && (
          <div className="h-full w-full flex flex-col items-center justify-center text-indigo-400 space-y-4 mt-24">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            <p className="text-sm font-medium animate-pulse">Running Multimodal VLM search via Groq...</p>
          </div>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="space-y-3 bg-neutral-900 border border-indigo-500/20 p-5 rounded-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-indigo-500/5 -z-10" />
              <h3 className="text-sm font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> AI Synthesis
              </h3>
              <div className="prose prose-invert text-base leading-relaxed text-neutral-200">
                {result.answer.split('\n').map((line: string, i: number) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
            
            {(result.sources && result.sources.length > 0) && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold border-b border-white/10 pb-2 text-neutral-400 uppercase tracking-wider flex justify-between items-center">
                  Visual & Temporal Groundings
                  <span className="bg-indigo-600/30 text-indigo-300 text-xs py-1 px-2 rounded-lg font-mono">
                    Top {result.sources.length} retrieved chunks
                  </span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.sources.slice(0, 4).map((source: any, i: number) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-neutral-900 border border-white/10 rounded-xl p-4 flex flex-col gap-4 group"
                    >
                       <div className="flex items-center gap-2 text-indigo-400 font-mono text-sm font-medium bg-neutral-950 px-3 py-1.5 rounded-lg w-fit">
                         <Clock className="w-4 h-4" />
                         {source.timestamp}
                       </div>
                       
                       {source.frame_path && (
                         <div className="w-full aspect-video rounded-lg overflow-hidden bg-black ring-1 ring-white/10 relative">
                           <img 
                             src={`http://localhost:8000/${source.frame_path.replace(/\\/g, '/')}`} 
                             alt={`Frame at ${source.timestamp}`}
                             className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity"
                           />
                         </div>
                       )}
                       
                       <p className="text-xs text-neutral-500 font-mono line-clamp-3 overflow-hidden bg-neutral-950 p-2 rounded-lg">
                         {source.text}
                       </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
