'use client';
import { useEffect, useRef, useState } from 'react';
import { UploadCloud, CheckCircle2, Loader2, Video, Link as LinkIcon, FileVideo, RefreshCw, Orbit, Search as SearchIcon, Library } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : "An error occurred";

interface ProgressDetails {
  status: string;
  percent: number;
  phase?: string;
  is_search_ready?: boolean;
  is_complete?: boolean;
  search_quality?: string;
  warning?: string;
}

export default function UploadSection() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"file" | "link">("file");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [progressDetails, setProgressDetails] = useState<ProgressDetails>({ status: "", percent: 0 });
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const pollerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollerRef.current) {
      clearInterval(pollerRef.current);
      pollerRef.current = null;
    }
  };

  const emitVideoSelected = (videoId: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("current_video_id", videoId);
      window.dispatchEvent(new CustomEvent("video-selected", { detail: { videoId } }));
    }
  };

  const startPolling = (videoId: string) => {
    stopPolling();
    setCurrentVideoId(videoId);
    pollerRef.current = setInterval(async () => {
      try {
        const response = await fetch(`${API}/api/progress/${videoId}`);
        if (!response.ok) {
          return;
        }
        const data: ProgressDetails = await response.json();
        setProgressDetails(data);
        if (data.is_search_ready) {
          setStatus("success");
          emitVideoSelected(videoId);
        }
        if (data.is_complete) {
          stopPolling();
        }
      } catch {}
    }, 1500);
  };

  useEffect(() => () => stopPolling(), []);

  const handleUploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setStatus("uploading");
    setProgressDetails({ status: "Uploading file...", percent: 0 });
    const formData = new FormData();
    formData.append("file", file);

    const videoId = crypto.randomUUID();
    startPolling(videoId);

    try {
      setStatus("processing");
      const res = await fetch(`${API}/api/upload?video_id=${videoId}`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || res.statusText);
      }
      const data = await res.json();
      setProgressDetails((current) => ({
        ...current,
        status: data.processing_complete ? "Fully indexed and ready." : "Search ready. Refining visuals...",
        percent: data.processing_complete ? 100 : Math.max(current.percent, 68),
        is_search_ready: data.search_ready,
        is_complete: data.processing_complete,
        search_quality: data.search_quality,
      }));
      emitVideoSelected(data.video_id);
      setStatus("success");
    } catch (err: unknown) {
      stopPolling();
      setErrorMsg(getErrorMessage(err));
      setStatus("error");
    }
  };

  const handleUploadLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setStatus("uploading");
    setProgressDetails({ status: "Connecting to video...", percent: 0 });

    const videoId = crypto.randomUUID();
    startPolling(videoId);

    try {
      setStatus("processing");
      const res = await fetch(`${API}/api/upload-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, video_id: videoId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || res.statusText);
      }
      const data = await res.json();
      setProgressDetails((current) => ({
        ...current,
        status: data.processing_complete ? "Fully indexed and ready." : "Search ready. Refining visuals...",
        percent: data.processing_complete ? 100 : Math.max(current.percent, 68),
        is_search_ready: data.search_ready,
        is_complete: data.processing_complete,
        search_quality: data.search_quality,
      }));
      emitVideoSelected(data.video_id);
      setStatus("success");
    } catch (err: unknown) {
      stopPolling();
      setErrorMsg(getErrorMessage(err));
      setStatus("error");
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setFile(null);
    setUrl("");
    setProgressDetails({ status: "", percent: 0 });
    setCurrentVideoId(null);
    stopPolling();
    setErrorMsg("");
  };

  const isProcessing = status === "uploading" || status === "processing";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card border-pulse relative overflow-hidden p-6 shadow-[0_20px_60px_rgba(8,15,30,0.28)]"
    >
      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-0 h-0 border-[40px] border-transparent border-t-[rgba(56,189,248,0.16)] border-r-[rgba(249,115,22,0.16)]" />
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--foreground)]">
          <Video className="w-4 h-4 text-[#38bdf8]" />
          <span>Upload source</span>
        </h2>
        <div className="text-xs text-[var(--foreground)] bg-[rgba(52,211,153,0.1)] border border-[rgba(52,211,153,0.24)] px-2 py-1 rounded-full flex items-center gap-1.5 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse inline-block"></span>
          Multilingual
        </div>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-3">
        {[
          { title: "Drop the source", body: "Use a local file or a link from YouTube and similar sites." },
          { title: "Watch the pipeline", body: "See upload, transcription, and indexing without guessing what is happening." },
          { title: "Jump into search", body: "As soon as the video is ready, move straight into the workspace or library." },
        ].map((item) => (
          <div key={item.title} className="rounded-[22px] border border-[var(--panel-border)] bg-[var(--surface-elevated)] px-4 py-4 shadow-[var(--shadow-soft)]">
            <div className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--foreground)]">{item.title}</div>
            <div className="mt-2 text-[15px] leading-7 text-[var(--muted-foreground)]">{item.body}</div>
          </div>
        ))}
      </div>

      <div className="mb-5 flex rounded-xl border border-[var(--panel-border)] bg-[var(--surface-muted)] p-1">
        {(["file", "link"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            disabled={isProcessing}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab
                ? "border border-[rgba(56,189,248,0.28)] bg-[rgba(56,189,248,0.14)] text-[var(--foreground)]"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            {tab === "file" ? <FileVideo className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
            {tab === "file" ? "Local File" : "Video Link"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "file" ? (
          <motion.form
            key="file"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            onSubmit={handleUploadFile}
            className="space-y-4"
          >
            <div className="relative group">
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={isProcessing}
              />
              <div className={`w-full h-36 flex flex-col justify-center items-center rounded-[24px] border-2 border-dashed transition-all duration-200 overflow-hidden ${
                file
                  ? "border-[rgba(56,189,248,0.45)] bg-[rgba(56,189,248,0.08)]"
                  : "border-[rgba(148,163,184,0.18)] bg-[rgba(6,10,18,0.38)] group-hover:border-[rgba(56,189,248,0.35)] group-hover:bg-[rgba(56,189,248,0.04)]"
              }`}>
                {file ? (
                  <div className="px-4 text-center">
                    <div className="mx-auto max-w-[88%] truncate text-sm font-medium text-[var(--foreground)]">{file.name}</div>
                    <div className="mt-2 text-sm text-[var(--muted-foreground)]">Ready to process this recording.</div>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-7 h-7 text-[#94a3b8] mb-3 group-hover:text-[#38bdf8] transition-colors" />
                    <span className="text-base font-semibold text-[var(--foreground)]">Drop a video here or click to browse</span>
                    <span className="mt-2 text-sm text-[var(--muted-foreground)]">MP4, MOV, or any browser-friendly format</span>
                  </>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={!file || isProcessing || status === "success"}
              className="w-full bg-gradient-to-r from-[#38bdf8] to-[#f97316] hover:from-[#67d3ff] hover:to-[#fb923c] text-slate-950 font-semibold py-2.5 px-4 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_12px_30px_rgba(56,189,248,0.18)]"
            >
              {status === "idle" && "Process Video"}
              {status === "uploading" && <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>}
              {status === "processing" && <><Loader2 className="w-4 h-4 animate-spin" /> AI Analyzing...</>}
              {status === "success" && <><CheckCircle2 className="w-4 h-4" /> Ready for RAG</>}
              {status === "error" && "Retry Upload"}
            </button>
          </motion.form>
        ) : (
          <motion.form
            key="link"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            onSubmit={handleUploadLink}
            className="space-y-4"
          >
            <div className="flex flex-col gap-2">
              <label className="px-1 text-xs font-semibold tracking-[0.22em] uppercase text-[var(--muted-foreground)]">Video URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                disabled={isProcessing}
                className="w-full rounded-xl border border-[var(--panel-border)] bg-[var(--surface-elevated)] px-4 py-3 text-[15px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[rgba(56,189,248,0.45)] focus:outline-none focus:ring-1 focus:ring-[rgba(56,189,248,0.25)]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={!url || isProcessing || status === "success"}
              className="w-full bg-gradient-to-r from-[#38bdf8] to-[#f97316] hover:from-[#67d3ff] hover:to-[#fb923c] text-slate-950 font-semibold py-2.5 px-4 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_12px_30px_rgba(249,115,22,0.18)]"
            >
              {status === "idle" && "Download & Process"}
              {status === "uploading" && <><Loader2 className="w-4 h-4 animate-spin" /> Downloading...</>}
              {status === "processing" && <><Loader2 className="w-4 h-4 animate-spin" /> AI Analyzing...</>}
              {status === "success" && <><CheckCircle2 className="w-4 h-4" /> Ready for RAG</>}
              {status === "error" && "Retry Link"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {(isProcessing || (status === "success" && currentVideoId && !progressDetails.is_complete)) && progressDetails.status && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 space-y-2"
        >
          <div className="flex justify-between text-xs font-mono">
            <span className="text-[#dbeafe]">{progressDetails.status}</span>
            <span className="text-[#94a3b8]">{progressDetails.percent}%</span>
          </div>
          <div className="w-full bg-[rgba(0,0,0,0.35)] rounded-full h-1.5 border border-[rgba(148,163,184,0.14)] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#38bdf8] to-[#f97316]"
              initial={{ width: 0 }}
              animate={{ width: `${progressDetails.percent}%` }}
              transition={{ ease: "easeInOut", duration: 0.5 }}
            />
          </div>
          {progressDetails.is_search_ready && !progressDetails.is_complete && (
            <div className="text-[11px] text-[#94a3b8] font-mono flex items-center gap-2">
              <Orbit className="w-3.5 h-3.5 text-[#34d399]" />
              Search works now. Visual refinement is still improving results in the background.
            </div>
          )}
          {progressDetails.warning && (
            <div className="text-[11px] text-amber-300 font-mono">
              {progressDetails.warning}
            </div>
          )}
        </motion.div>
      )}

      {status === "success" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-3">
            <div className="rounded-[24px] border border-[rgba(58,216,163,0.22)] bg-[rgba(58,216,163,0.08)] px-4 py-4">
              <div className="text-sm font-semibold text-[var(--foreground)]">Your video is ready to use.</div>
              <div className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
                Move straight into search, open the library, or start another ingest job from here.
              </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <button
              type="button"
              onClick={() => router.push("/workspace")}
              className="inline-flex items-center justify-center gap-2 rounded-[20px] bg-gradient-to-r from-[#38bdf8] to-[#f97316] px-4 py-3 text-sm font-semibold text-slate-950"
            >
              <SearchIcon className="h-4 w-4" />
              Open Search
            </button>
            <button
              type="button"
              onClick={() => router.push("/library")}
              className="inline-flex items-center justify-center gap-2 rounded-[20px] border border-[var(--panel-border)] bg-[var(--surface-elevated)] px-4 py-3 text-sm font-medium text-[var(--foreground)]"
            >
              <Library className="h-4 w-4" />
              Open Library
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-2 rounded-[20px] border border-[var(--panel-border)] bg-[var(--surface-elevated)] px-4 py-3 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              <RefreshCw className="h-4 w-4" />
              {progressDetails.is_complete ? "Upload Another" : "Switch Video"}
            </button>
          </div>
        </motion.div>
      )}

      {status === "error" && (
        <p className="text-red-400 text-xs mt-3 text-center font-mono">{errorMsg}</p>
      )}
    </motion.div>
  );
}
