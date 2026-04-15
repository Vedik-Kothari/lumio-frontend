'use client';
import { useEffect, useRef, useState } from 'react';
import { UploadCloud, CheckCircle2, Loader2, Video, Link as LinkIcon, FileVideo, RefreshCw, Orbit, Search as SearchIcon, Library, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : "An error occurred";

interface ApiError extends Error {
  status?: number;
}

type FriendlyError = {
  title: string;
  description: string;
  actionLabel?: string;
};

interface ProgressDetails {
  status: string;
  percent: number;
  phase?: string;
  is_search_ready?: boolean;
  is_complete?: boolean;
  search_quality?: string;
  warning?: string;
}

const toFriendlyError = (error: unknown, activeTab: "file" | "link"): FriendlyError => {
  const fallback = {
    title: "The pipeline hit a recoverable issue.",
    description: getErrorMessage(error),
  };

  const message = getErrorMessage(error);
  const lowered = message.toLowerCase();
  const status = typeof error === "object" && error !== null && "status" in error
    ? Number((error as ApiError).status)
    : undefined;

  if (
    activeTab === "link" &&
    (status === 422 || lowered.includes("bot-check") || lowered.includes("youtube blocked this download"))
  ) {
    return {
      title: "This YouTube link needs a different retrieval path.",
      description:
        "Lumio will try transcript-first retrieval for supported YouTube videos. If this specific link still fails, the source likely has no accessible transcript and YouTube is blocking direct server-side video access.",
    };
  }

  if (activeTab === "link" && (status === 429 || lowered.includes("rate-limited") || lowered.includes("too many requests"))) {
    return {
      title: "YouTube is rate-limiting this server right now.",
      description:
        "Retry in a bit. Lumio now prefers transcript-first retrieval for YouTube links, but this source is still being throttled upstream.",
    };
  }

  return fallback;
};

export default function UploadSection() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"file" | "link">("file");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [friendlyError, setFriendlyError] = useState<FriendlyError | null>(null);
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
    setFriendlyError(null);
    setErrorMsg("");
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
      setFriendlyError(toFriendlyError(err, "file"));
      setStatus("error");
    }
  };

  const handleUploadLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setStatus("uploading");
    setProgressDetails({ status: "Connecting to video...", percent: 0 });
    setFriendlyError(null);
    setErrorMsg("");

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
        const apiError = new Error(err.detail || res.statusText) as ApiError;
        apiError.status = res.status;
        throw apiError;
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
      setFriendlyError(toFriendlyError(err, "link"));
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
    setFriendlyError(null);
  };

  const isProcessing = status === "uploading" || status === "processing";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card border-pulse relative overflow-hidden p-6 shadow-[var(--shadow-strong)]"
    >
      <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-0 h-0 border-[40px] border-transparent border-t-[rgba(34,211,238,0.18)] border-r-[rgba(251,191,36,0.14)]" />
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--foreground)]">
          <Video className="w-4 h-4 text-[var(--primary)]" />
          <span>Source ingest</span>
        </h2>
        <div className="text-xs text-[var(--foreground)] bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.24)] px-2 py-1 rounded-full flex items-center gap-1.5 font-mono uppercase tracking-[0.18em]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse inline-block"></span>
          System live
        </div>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-3">
        {[
          { title: "Capture the source", body: "Drop in a local recording or a video link from YouTube and similar sources." },
          { title: "Watch the pipeline", body: "Track upload, transcript, framing, and vectorization as readable system states." },
          { title: "Open the console", body: "Move into workspace or library the moment search becomes ready." },
        ].map((item) => (
          <div key={item.title} className="workspace-panel rounded-[22px] px-4 py-4">
            <div className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--foreground)]">{item.title}</div>
            <div className="mt-2 text-[15px] leading-7 text-[var(--muted-foreground)]">{item.body}</div>
          </div>
        ))}
      </div>

      <div className="mb-5 flex rounded-xl border border-[var(--panel-border)] bg-[var(--surface-muted)] p-1 shadow-[var(--shadow-soft)]">
        {(["file", "link"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            disabled={isProcessing}
            data-hoverable="true"
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab
                ? "border border-[var(--panel-border-strong)] bg-[var(--surface-brand)] text-[var(--foreground)] shadow-[var(--shadow-soft)]"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            {tab === "file" ? <FileVideo className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
            {tab === "file" ? "Local file" : "Remote link"}
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
              <div className={`w-full h-36 flex flex-col justify-center items-center rounded-[24px] border-2 border-dashed transition-all duration-200 overflow-hidden shadow-[var(--shadow-soft)] ${
                file
                  ? "border-[var(--panel-border-strong)] bg-[var(--surface-brand)]"
                  : "border-[rgba(148,163,184,0.18)] bg-[rgba(6,10,18,0.38)] group-hover:border-[var(--panel-border-strong)] group-hover:bg-[var(--surface-brand)]"
              }`}>
                {file ? (
                  <div className="px-4 text-center">
                    <div className="mx-auto max-w-[88%] truncate text-sm font-medium text-[var(--foreground)]">{file.name}</div>
                    <div className="mt-2 text-sm text-[var(--muted-foreground)]">Source staged and ready for indexing.</div>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-7 h-7 text-[var(--muted-foreground)] mb-3 group-hover:text-[var(--primary)] transition-colors" />
                    <span className="text-base font-semibold text-[var(--foreground)]">Drop a video here or click to stage a source</span>
                    <span className="mt-2 text-sm text-[var(--muted-foreground)]">MP4, MOV, or any browser-friendly format</span>
                  </>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={!file || isProcessing || status === "success"}
              data-hoverable="true"
              className="premium-button premium-button-primary w-full rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {status === "idle" && "Initialize pipeline"}
              {status === "uploading" && <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>}
              {status === "processing" && <><Loader2 className="w-4 h-4 animate-spin" /> Building intelligence...</>}
              {status === "success" && <><CheckCircle2 className="w-4 h-4" /> Search-ready</>}
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
                className="w-full rounded-xl border border-[var(--panel-border)] bg-[var(--surface-elevated)] px-4 py-3 text-[15px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] shadow-[var(--shadow-soft)] focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={!url || isProcessing || status === "success"}
              data-hoverable="true"
              className="premium-button premium-button-primary w-full rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {status === "idle" && "Fetch and index"}
              {status === "uploading" && <><Loader2 className="w-4 h-4 animate-spin" /> Downloading...</>}
              {status === "processing" && <><Loader2 className="w-4 h-4 animate-spin" /> Building intelligence...</>}
              {status === "success" && <><CheckCircle2 className="w-4 h-4" /> Search-ready</>}
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
            <span className="text-[var(--foreground)]">{progressDetails.status}</span>
            <span className="text-[var(--muted-foreground)]">{progressDetails.percent}%</span>
          </div>
          <div className="w-full bg-[rgba(0,0,0,0.35)] rounded-full h-1.5 border border-[rgba(148,163,184,0.14)] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-[linear-gradient(90deg,var(--primary),var(--accent))]"
              initial={{ width: 0 }}
              animate={{ width: `${progressDetails.percent}%` }}
              transition={{ ease: "easeInOut", duration: 0.5 }}
            />
          </div>
          {progressDetails.is_search_ready && !progressDetails.is_complete && (
            <div className="text-[11px] text-[var(--muted-foreground)] font-mono flex items-center gap-2">
              <Orbit className="w-3.5 h-3.5 text-[var(--success)]" />
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
            <div className="workspace-panel rounded-[24px] border-[rgba(123,211,137,0.22)] bg-[linear-gradient(135deg,rgba(123,211,137,0.14),rgba(247,178,59,0.06))] px-4 py-4">
              <div className="text-sm font-semibold text-[var(--foreground)]">Your video is ready to use.</div>
              <div className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
                Open the workspace, browse the indexed library, or send another source through the pipeline.
              </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <button
              type="button"
              onClick={() => router.push("/workspace")}
              data-hoverable="true"
              className="premium-button premium-button-primary rounded-[20px] px-4 py-3 text-sm"
            >
              <SearchIcon className="h-4 w-4" />
              Open Search
            </button>
            <button
              type="button"
              onClick={() => router.push("/library")}
              data-hoverable="true"
              className="inline-flex items-center justify-center gap-2 rounded-[20px] border border-[var(--panel-border)] bg-[var(--surface-elevated)] px-4 py-3 text-sm font-medium text-[var(--foreground)] shadow-[var(--shadow-soft)]"
            >
              <Library className="h-4 w-4" />
              Open Library
            </button>
            <button
              type="button"
              onClick={handleReset}
              data-hoverable="true"
              className="inline-flex items-center justify-center gap-2 rounded-[20px] border border-[var(--panel-border)] bg-[var(--surface-elevated)] px-4 py-3 text-sm font-medium text-[var(--muted-foreground)] shadow-[var(--shadow-soft)] hover:text-[var(--foreground)]"
            >
              <RefreshCw className="h-4 w-4" />
              {progressDetails.is_complete ? "Upload Another" : "Switch Video"}
            </button>
          </div>
        </motion.div>
      )}

      {status === "error" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-[24px] border border-[rgba(248,113,113,0.22)] bg-[linear-gradient(135deg,rgba(127,29,29,0.34),rgba(30,41,59,0.4))] p-4"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl bg-[rgba(248,113,113,0.14)] text-red-300">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-[var(--foreground)]">
                {friendlyError?.title || "The source could not be processed."}
              </div>
              <div className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
                {friendlyError?.description || errorMsg}
              </div>
              {!friendlyError && (
                <div className="mt-2 break-words text-xs text-red-300/90 font-mono">{errorMsg}</div>
              )}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleReset}
              data-hoverable="true"
              className="inline-flex items-center justify-center gap-2 rounded-[18px] border border-[var(--panel-border)] bg-[var(--surface-elevated)] px-4 py-3 text-sm font-medium text-[var(--muted-foreground)] shadow-[var(--shadow-soft)] hover:text-[var(--foreground)]"
            >
              <RefreshCw className="h-4 w-4" />
              Try another link
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
