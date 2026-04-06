import UploadSection from "@/components/UploadSection";
import SearchInterface from "@/components/SearchInterface";

export default function Home() {
  return (
    <main className="min-h-screen text-foreground flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden">
      {/* Scan line effect */}
      <div className="scan-line opacity-30" />

      <div className="max-w-6xl w-full space-y-10">
        {/* ── Header ── */}
        <header className="text-center space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.2)] rounded-full px-4 py-1.5 text-xs font-mono text-[#00d4ff] mb-4 tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse inline-block"></span>
            System Online · Multimodal RAG Engine Active
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-[#00d4ff] via-[#a78bfa] to-[#7c3aed] bg-clip-text text-transparent">
              Neural
            </span>
            <span className="text-white"> Search</span>
          </h1>

          <p className="text-[#8b949e] max-w-2xl mx-auto text-base sm:text-lg leading-relaxed pt-2 font-light">
            Upload any video or paste a YouTube URL. The AI extracts every frame, transcribes speech, and lets you ask
            questions in&nbsp;
            <span className="text-[#00d4ff] font-medium">any language</span>.
          </p>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-6 pt-2 flex-wrap">
            {[
              { label: "Vision Model", value: "Llama 3.2" },
              { label: "Speech", value: "Whisper v3" },
              { label: "Vector DB", value: "Qdrant Cloud" },
              { label: "Latency", value: "~3s" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-[#00d4ff] font-semibold font-mono text-sm">{stat.value}</div>
                <div className="text-[#8b949e] text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </header>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[rgba(0,212,255,0.3)] to-transparent" />

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 w-full">
            <UploadSection />
          </div>
          <div className="lg:col-span-8 w-full">
            <SearchInterface />
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-[#8b949e] font-mono pb-4 space-y-1">
          <div>Built with Groq · Qdrant · Next.js · FastAPI</div>
          <div className="text-[rgba(0,212,255,0.4)]">100% Free & Open Source</div>
        </footer>
      </div>
    </main>
  );
}
