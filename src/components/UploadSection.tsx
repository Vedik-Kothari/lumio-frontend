'use client';
import { useState } from 'react';
import { UploadCloud, CheckCircle2, Loader2, Video, Link as LinkIcon, FileVideo, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function UploadSection() {
  const [activeTab, setActiveTab] = useState<"file" | "link">("file");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [progressDetails, setProgressDetails] = useState({ status: "", percent: 0 });

  const handleUploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setStatus("uploading");
    setProgressDetails({ status: "Uploading file...", percent: 0 });
    const formData = new FormData();
    formData.append("file", file);

    const videoId = crypto.randomUUID();
    const interval = setInterval(async () => {
      try {
        const pRes = await fetch(`${API}/api/progress/${videoId}`);
        if (pRes.ok) {
          const pData = await pRes.json();
          setProgressDetails(pData);
        }
      } catch (e) {}
    }, 1000);

    try {
      setStatus("processing");
      const res = await fetch(`${API}/api/upload?video_id=${videoId}`, {
        method: "POST",
        body: formData,
      });
      clearInterval(interval);
      setProgressDetails({ status: "Ready for RAG", percent: 100 });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || res.statusText);
      }
      const data = await res.json();
      if (typeof window !== "undefined") {
        localStorage.setItem("current_video_id", data.video_id);
      }
      setStatus("success");
    } catch (err: any) {
      clearInterval(interval);
      setErrorMsg(err.message || "An error occurred");
      setStatus("error");
    }
  };

  const handleUploadLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setStatus("uploading");
    setProgressDetails({ status: "Connecting to video...", percent: 0 });

    const videoId = crypto.randomUUID();
    const interval = setInterval(async () => {
      try {
        const pRes = await fetch(`${API}/api/progress/${videoId}`);
        if (pRes.ok) {
          const pData = await pRes.json();
          setProgressDetails(pData);
        }
      } catch (e) {}
    }, 1000);

    try {
      setStatus("processing");
      const res = await fetch(`${API}/api/upload-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, video_id: videoId }),
      });
      clearInterval(interval);
      setProgressDetails({ status: "Ready for RAG", percent: 100 });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || res.statusText);
      }
      const data = await res.json();
      if (typeof window !== "undefined") {
        localStorage.setItem("current_video_id", data.video_id);
      }
      setStatus("success");
    } catch (err: any) {
      clearInterval(interval);
      setErrorMsg(err.message || "An error occurred");
      setStatus("error");
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setFile(null);
    setUrl("");
    setProgressDetails({ status: "", percent: 0 });
    setErrorMsg("");
  };

  const isProcessing = status === "uploading" || status === "processing";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card border-pulse p-6 shadow-2xl relative overflow-hidden"
    >
      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-0 h-0 border-[40px] border-transparent border-t-[rgba(0,212,255,0.15)] border-r-[rgba(0,212,255,0.15)]" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-white">
          <Video className="w-4 h-4 text-[#00d4ff]" />
          <span>Ingest Data</span>
        </h2>
        <div className="text-xs text-[#8b949e] bg-[rgba(0,255,136,0.08)] border border-[rgba(0,255,136,0.2)] px-2 py-1 rounded-full flex items-center gap-1.5 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse inline-block"></span>
          Multilingual
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[rgba(0,0,0,0.4)] p-1 rounded-xl mb-5 border border-[rgba(0,212,255,0.1)]">
        {(["file", "link"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            disabled={isProcessing}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab
                ? "bg-[rgba(0,212,255,0.15)] text-[#00d4ff] border border-[rgba(0,212,255,0.3)] shadow-[0_0_10px_rgba(0,212,255,0.1)]"
                : "text-[#8b949e] hover:text-white"
            }`}
          >
            {tab === "file" ? <FileVideo className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
            {tab === "file" ? "Local File" : "Video Link"}
          </button>
        ))}
      </div>

      {/* Forms */}
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
              <div className={`w-full h-28 flex flex-col justify-center items-center rounded-xl border-2 border-dashed transition-all duration-200 overflow-hidden ${
                file
                  ? "border-[rgba(0,212,255,0.5)] bg-[rgba(0,212,255,0.05)]"
                  : "border-[rgba(0,212,255,0.15)] bg-[rgba(0,0,0,0.3)] group-hover:border-[rgba(0,212,255,0.4)] group-hover:bg-[rgba(0,212,255,0.03)]"
              }`}>
                {file ? (
                  <span className="text-sm font-medium text-[#00d4ff] truncate max-w-[88%] font-mono">{file.name}</span>
                ) : (
                  <>
                    <UploadCloud className="w-6 h-6 text-[#8b949e] mb-2 group-hover:text-[#00d4ff] transition-colors" />
                    <span className="text-sm text-[#8b949e]">Drop video or click to browse</span>
                  </>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={!file || isProcessing || status === "success"}
              className="w-full bg-gradient-to-r from-[#00d4ff] to-[#0099cc] hover:from-[#00e5ff] hover:to-[#00aad4] text-black font-semibold py-2.5 px-4 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,212,255,0.25)] hover:shadow-[0_0_30px_rgba(0,212,255,0.4)]"
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
              <label className="text-xs font-mono text-[#8b949e] px-1 tracking-wider uppercase">Video URL (YouTube, etc.)</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                disabled={isProcessing}
                className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(0,212,255,0.15)] text-white placeholder-[#4a5568] rounded-xl px-4 py-3 focus:outline-none focus:border-[rgba(0,212,255,0.5)] focus:ring-1 focus:ring-[rgba(0,212,255,0.3)] transition-all font-mono text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={!url || isProcessing || status === "success"}
              className="w-full bg-gradient-to-r from-[#7c3aed] to-[#5b21b6] hover:from-[#8b5cf6] hover:to-[#6d28d9] text-white font-semibold py-2.5 px-4 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(124,58,237,0.25)] hover:shadow-[0_0_30px_rgba(124,58,237,0.4)]"
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

      {/* Progress bar */}
      {isProcessing && progressDetails.status && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 space-y-2"
        >
          <div className="flex justify-between text-xs font-mono">
            <span className="text-[#00d4ff]">{progressDetails.status}</span>
            <span className="text-[#8b949e]">{progressDetails.percent}%</span>
          </div>
          <div className="w-full bg-[rgba(0,0,0,0.5)] rounded-full h-1.5 border border-[rgba(0,212,255,0.1)] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#00d4ff] to-[#7c3aed]"
              initial={{ width: 0 }}
              animate={{ width: `${progressDetails.percent}%` }}
              transition={{ ease: "easeInOut", duration: 0.5 }}
            />
          </div>
        </motion.div>
      )}

      {/* Success reset */}
      {status === "success" && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleReset}
          className="mt-4 w-full bg-[rgba(0,212,255,0.05)] hover:bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.2)] text-[#8b949e] hover:text-white font-medium py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
        >
          <RefreshCw className="w-4 h-4" /> Process Another Video
        </motion.button>
      )}

      {/* Error */}
      {status === "error" && (
        <p className="text-red-400 text-xs mt-3 text-center font-mono">{errorMsg}</p>
      )}
    </motion.div>
  );
}
