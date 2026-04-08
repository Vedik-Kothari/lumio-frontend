"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import {
  BookOpenText,
  BrainCircuit,
  CheckCircle2,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  FileOutput,
  Filter,
  FolderSearch,
  GitCompareArrows,
  Download,
  Image as ImageIcon,
  LayoutGrid,
  Layers3,
  LibraryBig,
  Loader2,
  Map,
  MessageSquareText,
  PlayCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  WandSparkles,
  Waves,
  X,
  Zap,
} from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
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

interface WorkbenchResponse {
  title: string;
  content: string;
  sources: SourceChunk[];
  mode: string;
}

interface DeleteVideosResponse {
  deleted_video_ids: string[];
}

interface ProcessingState {
  status: string;
  percent: number;
  is_complete?: boolean;
  search_quality?: string;
}

interface LibraryVideo {
  video_id: string;
  title: string;
  source_type: string;
  status: string;
  search_quality: string;
  is_complete: boolean;
  channel?: string;
  duration_seconds?: number;
  thumbnail_url?: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  title?: string;
  mode?: string;
  sources?: SourceChunk[];
  pending?: boolean;
}

const workbenchModes = [
  { id: "save_time", label: "Save Time", icon: Zap, prompt: "Tell me whether this video is worth watching fully and which sections to skip." },
  { id: "moment_map", label: "Moment Map", icon: Map, prompt: "Map the most important moments, pivots, and takeaways in order." },
  { id: "ask_for_me", label: "Ask for Me", icon: WandSparkles, prompt: "Extract the exact actions, tools, and metrics I should care about." },
  { id: "output_generator", label: "Output", icon: FileOutput, prompt: "Turn this into a polished reusable deliverable." },
  { id: "cross_video_memory", label: "Cross-Video", icon: LibraryBig, prompt: "Compare themes and contradictions across the chosen videos." },
  { id: "learning_mode", label: "Learning", icon: BookOpenText, prompt: "Teach me this video with a structured learning breakdown." },
  { id: "decision_mode", label: "Decision", icon: ShieldCheck, prompt: "Separate facts, claims, risks, and recommended actions." },
  { id: "resource_extractor", label: "Resources", icon: FolderSearch, prompt: "List all resources, people, tools, and references mentioned." },
  { id: "what_changed", label: "What Changed", icon: GitCompareArrows, prompt: "Show what changed over the video timeline and why it matters." },
  { id: "presentation_mode", label: "Executive", icon: BrainCircuit, prompt: "Summarize this for an executive or client-facing audience." },
];

function formatDuration(seconds?: number) {
  if (!seconds) return "Unknown";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function buildId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function renderRichText(content: string) {
  const sanitized = content
    .replace(/\r/g, "")
    .split("\n")
    .filter((line) => !/^\s*[-_=~]{3,}\s*$/.test(line))
    .join("\n");

  const blocks = sanitized.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);
  if (blocks.length === 0) {
    return <p className="text-base leading-8 text-[var(--muted-foreground)]">No content generated yet.</p>;
  }

  return blocks.map((block, index) => {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const firstLine = (lines[0] ?? "").replace(/\*\*/g, "");
    const bullets = lines.filter((line) => /^[-*]\s/.test(line));
    const isAllCapsHeading =
      firstLine.length > 0 &&
      firstLine.length < 120 &&
      /[A-Z]/.test(firstLine) &&
      firstLine === firstLine.toUpperCase();

    if (/^#{1,3}\s/.test(firstLine) || isAllCapsHeading) {
      const heading = /^#{1,3}\s/.test(firstLine) ? firstLine.replace(/^#{1,3}\s/, "") : firstLine;
      return (
        <div key={index} className="space-y-3">
          <h3 className="text-[1.55rem] font-semibold tracking-[-0.035em] text-[var(--foreground)]">{heading}</h3>
          {lines.slice(1).length > 0 && <p className="text-[16px] leading-8 text-[var(--foreground)]/88 whitespace-pre-wrap">{lines.slice(1).join("\n")}</p>}
        </div>
      );
    }

    if (/^\*\*.*\*\*$/.test(firstLine) || /:$/.test(firstLine) || bullets.length === lines.length) {
      const title = bullets.length === lines.length ? "" : firstLine.replace(/\*\*/g, "").replace(/:$/, "");
      const items = bullets.length > 0 ? bullets : lines.slice(1);
      return (
        <div key={index} className="rounded-[24px] border border-[var(--panel-border)] bg-[var(--surface-elevated)]/75 px-5 py-5 md:px-6 md:py-6">
          {title && <h3 className="text-[13px] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">{title}</h3>}
          <ul className={`${title ? "mt-4" : ""} space-y-4`}>
            {items.map((line, lineIndex) => (
              <li key={lineIndex} className="flex gap-3 text-[16px] leading-8 text-[var(--foreground)]/88">
                <ChevronRight className="mt-1.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
                <span>{line.replace(/^[-*]\s/, "")}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    return <p key={index} className="text-[16px] leading-8 text-[var(--foreground)]/88 whitespace-pre-wrap">{block}</p>;
  });
}

function ThinkingBubble() {
  return (
    <div className="flex items-center gap-3 rounded-[24px] border border-[var(--panel-border)] bg-[var(--surface-elevated)] px-4 py-3">
      <div className="flex gap-1">
        <motion.span className="h-2 w-2 rounded-full bg-[var(--primary)]" animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0 }} />
        <motion.span className="h-2 w-2 rounded-full bg-[var(--primary)]" animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.12 }} />
        <motion.span className="h-2 w-2 rounded-full bg-[var(--primary)]" animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.24 }} />
      </div>
      <div className="text-sm text-[var(--muted-foreground)]">Lumio is grounding the reply in transcript and visual evidence.</div>
    </div>
  );
}

export default function SearchInterface({
  initialTaskTab = "workbench",
}: {
  initialTaskTab?: "search" | "workbench" | "library";
}) {
  const [taskTab, setTaskTab] = useState<"search" | "workbench" | "library">(initialTaskTab);
  const [resultTab, setResultTab] = useState<"answer" | "evidence" | "player">("answer");
  const [query, setQuery] = useState("");
  const [activeMode, setActiveMode] = useState("save_time");
  const [outputFormat, setOutputFormat] = useState("Executive brief");
  const [scopeMode, setScopeMode] = useState<"current" | "specific" | "batch" | "library">("current");
  const [libraryFilter, setLibraryFilter] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [playingVideo, setPlayingVideo] = useState<{ videoId: string; timestamp: string } | null>(null);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState | null>(null);
  const [libraryVideos, setLibraryVideos] = useState<LibraryVideo[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState("");
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [toolDrawerOpen, setToolDrawerOpen] = useState(false);
  const [videoPickerOpen, setVideoPickerOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"txt" | "md" | "json" | "html">("md");
  const [exportStatus, setExportStatus] = useState("");
  const [isDeletingVideos, setIsDeletingVideos] = useState(false);

  const activeModeConfig = useMemo(() => workbenchModes.find((mode) => mode.id === activeMode) ?? workbenchModes[0], [activeMode]);
  const ActiveToolIcon = activeModeConfig.icon;
  const deferredLibraryFilter = useDeferredValue(libraryFilter);
  const selectedVideo = libraryVideos.find((video) => video.video_id === selectedVideoId) || null;
  const batchVideos = libraryVideos.filter((video) => selectedVideoIds.includes(video.video_id));
  const resolvedVideoId = scopeMode === "current" ? currentVideoId : scopeMode === "specific" ? selectedVideoId || null : null;
  const resolvedVideoIds = scopeMode === "batch" ? selectedVideoIds : undefined;
  const assistantMessages = messages.filter((message) => message.role === "assistant" && !message.pending);
  const activeMessage = assistantMessages.find((message) => message.id === selectedMessageId) ?? assistantMessages[assistantMessages.length - 1] ?? null;
  const visibleVideos = useMemo(() => {
    const normalized = deferredLibraryFilter.trim().toLowerCase();
    if (!normalized) return libraryVideos;
    return libraryVideos.filter((video) => `${video.title} ${video.channel ?? ""} ${video.source_type}`.toLowerCase().includes(normalized));
  }, [deferredLibraryFilter, libraryVideos]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncCurrentVideo = () => setCurrentVideoId(localStorage.getItem("current_video_id"));
    const handleVideoSelected = (event: Event) => {
      const customEvent = event as CustomEvent<{ videoId?: string }>;
      const videoId = customEvent.detail?.videoId ?? localStorage.getItem("current_video_id");
      setCurrentVideoId(videoId);
      setTaskTab("workbench");
      setScopeMode("current");
    };
    syncCurrentVideo();
    window.addEventListener("video-selected", handleVideoSelected as EventListener);
    window.addEventListener("storage", syncCurrentVideo);
    return () => {
      window.removeEventListener("video-selected", handleVideoSelected as EventListener);
      window.removeEventListener("storage", syncCurrentVideo);
    };
  }, []);

  useEffect(() => {
    setTaskTab(initialTaskTab);
  }, [initialTaskTab]);

  useEffect(() => {
    let cancelled = false;
    const loadLibrary = async () => {
      try {
        const response = await fetch(`${API}/api/library`);
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled) {
          const videos: LibraryVideo[] = data.videos || [];
          setLibraryVideos(videos);
          setSelectedVideoId((current) => {
            if (current && videos.some((video) => video.video_id === current)) return current;
            return videos[0]?.video_id || "";
          });
          setSelectedVideoIds((current) => current.filter((videoId) => videos.some((video) => video.video_id === videoId)));
        }
      } catch {}
    };
    loadLibrary();
    const interval = setInterval(loadLibrary, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!currentVideoId) {
      setProcessingState(null);
      return;
    }

    let cancelled = false;
    const poll = async () => {
      try {
        const response = await fetch(`${API}/api/progress/${currentVideoId}`);
        if (!response.ok) return;
        const data: ProcessingState = await response.json();
        if (!cancelled) setProcessingState(data);
      } catch {}
    };

    poll();
    const interval = setInterval(poll, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [currentVideoId]);

  useEffect(() => {
    if (scopeMode === "specific" && !selectedVideoId && libraryVideos.length > 0) {
      setSelectedVideoId(libraryVideos[0].video_id);
    }
    if (scopeMode === "batch" && selectedVideoIds.length === 0 && libraryVideos.length > 0) {
      setSelectedVideoIds([libraryVideos[0].video_id]);
    }
  }, [libraryVideos, scopeMode, selectedVideoId, selectedVideoIds]);

  useEffect(() => {
    if (scopeMode !== "specific" && scopeMode !== "batch") {
      setVideoPickerOpen(false);
    }
  }, [scopeMode]);

  const contextLabel =
    scopeMode === "library"
      ? `Using ${libraryVideos.length} indexed videos`
      : scopeMode === "batch"
        ? `Using ${selectedVideoIds.length} selected videos`
      : scopeMode === "specific"
        ? `Using ${selectedVideo?.title ?? "selected video"}`
        : currentVideoId
          ? "Using current video"
          : "Choose a video context";

  const toggleBatchVideo = (videoId: string) => {
    setSelectedVideoIds((current) =>
      current.includes(videoId) ? current.filter((item) => item !== videoId) : [...current, videoId]
    );
  };

  const deleteLibraryVideos = async (videoIds: string[]) => {
    if (videoIds.length === 0 || isDeletingVideos) return;

    setIsDeletingVideos(true);
    try {
      const response = await fetch(`${API}/api/library`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_ids: videoIds }),
      });
      if (!response.ok) {
        throw new Error("Delete failed");
      }

      const data: DeleteVideosResponse = await response.json();
      const deletedIds = new Set(data.deleted_video_ids || []);

      setLibraryVideos((current) => current.filter((video) => !deletedIds.has(video.video_id)));
      setSelectedVideoIds((current) => current.filter((videoId) => !deletedIds.has(videoId)));
      setSelectedVideoId((current) => (current && deletedIds.has(current) ? "" : current));

      if (currentVideoId && deletedIds.has(currentVideoId)) {
        setCurrentVideoId(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("current_video_id");
        }
      }
    } catch {
      setExportStatus("Could not remove those videos right now.");
      window.setTimeout(() => setExportStatus(""), 2200);
    } finally {
      setIsDeletingVideos(false);
    }
  };

  const handleResult = (assistantMessage: ChatMessage) => {
    setMessages((current) => [...current.filter((message) => !message.pending), assistantMessage]);
    setSelectedMessageId(assistantMessage.id);
    setResultTab("answer");
  };

  const runRequest = async (submittedQuery: string) => {
    const normalizedQuery = submittedQuery.trim();
    if (!normalizedQuery) return;
    const hasBatchSelection = scopeMode === "batch" && selectedVideoIds.length > 0;
    const canRun = taskTab === "library" || scopeMode === "library" || Boolean(resolvedVideoId) || hasBatchSelection;
    if (!canRun) return;

    const pendingId = buildId("assistant");
    setMessages((current) => [
      ...current,
      { id: buildId("user"), role: "user", content: normalizedQuery },
      { id: pendingId, role: "assistant", content: "", pending: true, title: taskTab === "search" ? "Searching" : activeModeConfig.label },
    ]);
    setIsSearching(true);
    setQuery("");

    try {
      if (taskTab === "search") {
        const response = await fetch(`${API}/api/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: normalizedQuery, video_id: resolvedVideoId, video_ids: resolvedVideoIds }),
        });
        if (!response.ok) throw new Error("Failed");
        const data: SearchResponse = await response.json();
        handleResult({ id: pendingId, role: "assistant", title: "Grounded answer", content: data.answer, sources: data.sources, mode: "search" });
      } else {
        const response = await fetch(`${API}/api/workbench`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: activeMode,
            video_id: resolvedVideoId,
            video_ids: resolvedVideoIds,
            query: normalizedQuery,
            output_format: activeMode === "output_generator" ? outputFormat : null,
            scope:
              scopeMode === "specific"
                ? "selected_video"
                : scopeMode === "batch"
                  ? "selected_videos"
                  : scopeMode === "library"
                    ? "all_videos"
                    : "current_video",
          }),
        });
        if (!response.ok) throw new Error("Failed");
        const data: WorkbenchResponse = await response.json();
        handleResult({ id: pendingId, role: "assistant", title: data.title, content: data.content, sources: data.sources, mode: data.mode });
      }
    } catch {
      handleResult({
        id: pendingId,
        role: "assistant",
        title: "Temporary issue",
        content: "Lumio could not complete that request right now. Please try again in a moment.",
        sources: [],
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await runRequest(query || activeModeConfig.prompt);
  };

  const buildExportPayload = (format: "txt" | "md" | "json" | "html") => {
    if (!activeMessage) return "";
    const sources = (activeMessage.sources || []).map((source) => ({
      timestamp: source.timestamp,
      text: source.text,
      video_id: source.video_id,
    }));

    if (format === "json") {
      return JSON.stringify(
        {
          title: activeMessage.title || "Answer",
          content: activeMessage.content,
          mode: activeMessage.mode || null,
          sources,
        },
        null,
        2
      );
    }

    if (format === "html") {
      const sourceHtml = sources
        .map(
          (source) =>
            `<li><strong>${source.timestamp}</strong> (${source.video_id})<br/>${source.text}</li>`
        )
        .join("");
      return `<!doctype html><html><head><meta charset="utf-8"/><title>${activeMessage.title || "Lumio Export"}</title></head><body><h1>${activeMessage.title || "Lumio Export"}</h1><pre>${activeMessage.content}</pre>${sourceHtml ? `<h2>Sources</h2><ul>${sourceHtml}</ul>` : ""}</body></html>`;
    }

    const sourceLines = sources
      .map((source) => `- ${source.timestamp} | ${source.video_id}\n  ${source.text}`)
      .join("\n");

    if (format === "txt") {
      return `${activeMessage.title || "Answer"}\n\n${activeMessage.content}${sourceLines ? `\n\nSources\n${sourceLines}` : ""}`;
    }

    return `# ${activeMessage.title || "Answer"}\n\n${activeMessage.content}${sourceLines ? `\n\n## Sources\n${sourceLines}` : ""}`;
  };

  const downloadExport = () => {
    if (!activeMessage) return;
    const payload = buildExportPayload(exportFormat);
    const blob = new Blob([payload], {
      type:
        exportFormat === "json"
          ? "application/json"
          : exportFormat === "html"
            ? "text/html"
            : "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `lumio-answer.${exportFormat}`;
    anchor.click();
    URL.revokeObjectURL(url);
    setExportStatus(`Downloaded as ${exportFormat.toUpperCase()}`);
    window.setTimeout(() => setExportStatus(""), 2200);
  };

  const copyExport = async () => {
    if (!activeMessage) return;
    try {
      await navigator.clipboard.writeText(buildExportPayload(exportFormat));
      setExportStatus(`Copied ${exportFormat.toUpperCase()} to clipboard`);
      window.setTimeout(() => setExportStatus(""), 2200);
    } catch {
      setExportStatus("Copy failed");
      window.setTimeout(() => setExportStatus(""), 2200);
    }
  };

  const printExport = () => {
    if (!activeMessage) return;
    const payload = buildExportPayload("html");
    const popup = window.open("", "_blank", "width=960,height=720");
    if (!popup) return;
    popup.document.open();
    popup.document.write(payload);
    popup.document.close();
    popup.focus();
    popup.print();
  };

  return (
    <section className="section-space pt-0">
      <div className="grid gap-6 xl:grid-cols-[290px_minmax(0,1.45fr)_minmax(340px,0.95fr)]">
        <aside className="glass-card noise-surface rounded-[32px] p-5 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="workspace-label">Workspace controls</div>
              <div className="workspace-heading mt-3">Set the tool, scope, and search context.</div>
              <div className="workspace-subtle mt-3">Switch tools quickly, choose the right video context, and drive the request from the center conversation panel.</div>
            </div>
            {processingState?.is_complete ? <CheckCircle2 className="mt-1 h-5 w-5 text-[var(--success)]" /> : <Waves className="mt-1 h-5 w-5 text-[var(--primary)]" />}
          </div>

          <div className="workspace-panel mt-6 rounded-[24px] p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
              <Layers3 className="h-4 w-4 text-[var(--primary)]" />
              Index status
            </div>
            <div className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">{processingState?.status || "Search becomes available once you ingest a video."}</div>
            {processingState && (
              <div className="mt-4">
                <div className="h-2 rounded-full bg-[var(--surface-muted)]">
                  <motion.div className="h-2 rounded-full bg-[linear-gradient(90deg,var(--primary),var(--accent))]" initial={{ width: 0 }} animate={{ width: `${processingState.percent}%` }} transition={{ duration: 0.4 }} />
                </div>
                <div className="mt-2 flex items-center justify-between text-[13px] text-[var(--muted-foreground)]">
                  <span>{processingState.search_quality || "progressive"}</span>
                  <span>{processingState.percent}%</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 rounded-[24px] border border-[var(--panel-border)] bg-[var(--surface-elevated)] p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="workspace-label">Workspace controls</div>
              <button
                type="button"
                onClick={() => setToolDrawerOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--panel-border)] bg-[var(--surface-muted)] px-3 py-2 text-[13px] text-[var(--foreground)]"
              >
                <LayoutGrid className="h-4 w-4 text-[var(--primary)]" />
                Browse tools
              </button>
            </div>
            <div className="mt-4 grid gap-3">
              <div className="rounded-[20px] border border-[var(--primary-soft)] bg-[var(--surface-brand)] px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--surface-elevated)]">
                    <ActiveToolIcon className="h-5 w-5 text-[var(--primary)]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-base font-semibold text-[var(--foreground)]">{activeModeConfig.label}</div>
                    <div className="mt-1 text-[13px] leading-6 text-[var(--foreground)]/78">Current tool</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "current", label: "Current" },
                  { id: "specific", label: "Choose video" },
                  { id: "batch", label: "Batch videos" },
                  { id: "library", label: "All videos" },
                ].map((scope) => (
                  <button
                    key={scope.id}
                    type="button"
                    onClick={() => setScopeMode(scope.id as "current" | "specific" | "batch" | "library")}
                    className={`min-h-[52px] rounded-[18px] px-3 py-3 text-[13px] font-medium ${scopeMode === scope.id ? "bg-[var(--surface-brand)] text-[var(--foreground)]" : "border border-[var(--panel-border)] text-[var(--muted-foreground)]"}`}
                  >
                    {scope.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 text-[13px] leading-6 text-[var(--muted-foreground)]">
              Need a different mode? Open the tool drawer instead of scrolling through the full list.
            </div>
          </div>

          <div className="mt-6 rounded-[24px] border border-[var(--panel-border)] bg-[var(--surface-elevated)] p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
              <Filter className="h-4 w-4 text-[var(--accent)]" />
              Context
            </div>
            {(scopeMode === "specific" || scopeMode === "batch") && (
              <div className="relative mt-4">
                <button
                  type="button"
                  onClick={() => setVideoPickerOpen((open) => !open)}
                  className="flex w-full items-center justify-between rounded-[18px] border border-[var(--panel-border)] bg-[var(--surface-muted)] px-4 py-3 text-left"
                >
                  <div className="min-w-0">
                    <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                      {scopeMode === "batch" ? "Selected videos" : "Selected video"}
                    </div>
                    <div className="mt-1 truncate text-sm font-medium text-[var(--foreground)]">
                      {scopeMode === "batch"
                        ? selectedVideoIds.length > 0
                          ? `${selectedVideoIds.length} videos selected`
                          : "Choose videos from the library"
                        : selectedVideo?.title || "Choose from indexed videos"}
                    </div>
                  </div>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-[var(--muted-foreground)] transition-transform ${videoPickerOpen ? "rotate-180" : ""}`} />
                </button>
                {videoPickerOpen && (
                  <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 max-h-72 overflow-y-auto rounded-[22px] border border-[var(--panel-border)] bg-[var(--panel-solid)] p-2 shadow-[var(--shadow-strong)]">
                    {libraryVideos.length === 0 && (
                      <div className="rounded-[18px] px-4 py-3 text-sm text-[var(--muted-foreground)]">No indexed videos yet</div>
                    )}
                    {libraryVideos.map((video) => {
                      const active = scopeMode === "batch" ? selectedVideoIds.includes(video.video_id) : video.video_id === selectedVideoId;
                      return (
                        <button
                          key={video.video_id}
                          type="button"
                          onClick={() => {
                            if (scopeMode === "batch") {
                              toggleBatchVideo(video.video_id);
                              return;
                            }
                            setSelectedVideoId(video.video_id);
                            setVideoPickerOpen(false);
                          }}
                          className={`flex w-full items-start justify-between gap-3 rounded-[18px] px-4 py-3 text-left ${
                            active ? "bg-[var(--surface-brand)] text-[var(--foreground)]" : "text-[var(--foreground)] hover:bg-[var(--surface-elevated)]"
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium">{video.title}</div>
                            <div className="mt-1 text-[12px] text-[var(--muted-foreground)]">
                              {video.channel || video.source_type}
                            </div>
                          </div>
                          {active && <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />}
                        </button>
                      );
                    })}
                    {scopeMode === "batch" && libraryVideos.length > 0 && (
                      <div className="sticky bottom-0 mt-2 flex items-center justify-between gap-3 rounded-[18px] border border-[var(--panel-border)] bg-[var(--surface-elevated)] px-4 py-3">
                        <div className="text-[12px] text-[var(--muted-foreground)]">{selectedVideoIds.length} selected</div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedVideoIds([])}
                            className="rounded-full border border-[var(--panel-border)] px-3 py-1.5 text-[12px] text-[var(--foreground)]"
                          >
                            Clear
                          </button>
                          <button
                            type="button"
                            onClick={() => setVideoPickerOpen(false)}
                            className="rounded-full bg-[var(--surface-brand)] px-3 py-1.5 text-[12px] text-[var(--foreground)]"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            <div className="mt-4 rounded-[18px] border border-[var(--panel-border)] bg-[var(--surface-muted)] px-4 py-3">
              <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Current context</div>
              <div className="mt-2 text-[14px] font-medium text-[var(--foreground)]">{contextLabel}</div>
              {scopeMode === "batch" && batchVideos.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {batchVideos.slice(0, 4).map((video) => (
                    <span key={video.video_id} className="rounded-full border border-[var(--panel-border)] px-3 py-1 text-[12px] text-[var(--muted-foreground)]">
                      {video.title}
                    </span>
                  ))}
                  {batchVideos.length > 4 && (
                    <span className="rounded-full border border-[var(--panel-border)] px-3 py-1 text-[12px] text-[var(--muted-foreground)]">
                      +{batchVideos.length - 4} more
                    </span>
                  )}
                </div>
              )}
            </div>
            {activeMode === "output_generator" && <input value={outputFormat} onChange={(event) => setOutputFormat(event.target.value)} placeholder="Output format" className="mt-4 w-full rounded-[18px] border border-[var(--panel-border)] bg-[var(--surface-muted)] px-4 py-3 text-sm text-[var(--foreground)] outline-none" />}
          </div>
        </aside>

        <div className="glass-card rounded-[32px] p-4 md:p-5 xl:order-3">
          <div className="flex flex-col gap-4 border-b border-[var(--panel-border)] pb-4">
            <div>
              <div className="text-lg font-semibold tracking-[-0.02em] text-[var(--foreground)]">AI workspace</div>
              <div className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
                Ask naturally, follow up fast, and keep the conversation close while the output studio stays front and center.
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "workbench", label: "Workbench", icon: Sparkles },
                { id: "search", label: "Search", icon: Search },
                { id: "library", label: "Library", icon: LibraryBig },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = taskTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setTaskTab(tab.id as "search" | "workbench" | "library")}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm ${
                      active
                        ? "bg-[var(--surface-brand)] text-[var(--foreground)]"
                        : "border border-[var(--panel-border)] text-[var(--muted-foreground)]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {taskTab === "library" ? (
            <div className="pt-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-xl font-semibold tracking-[-0.02em] text-[var(--foreground)]">Video library</div>
                  <div className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
                    Browse indexed videos, filter the collection, choose a batch, and jump into a focused AI session.
                  </div>
                </div>
                <div className="flex flex-col gap-3 md:items-end">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                    <input
                      value={libraryFilter}
                      onChange={(event) => setLibraryFilter(event.target.value)}
                      placeholder="Search title, channel, or source"
                      className="h-12 w-full rounded-full border border-[var(--panel-border)] bg-[var(--surface-elevated)] pl-11 pr-4 text-sm text-[var(--foreground)] outline-none md:w-80"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setScopeMode("batch");
                        setSelectedVideoIds(visibleVideos.map((video) => video.video_id));
                      }}
                      className="rounded-full border border-[var(--panel-border)] px-4 py-2 text-[13px] text-[var(--foreground)]"
                    >
                      Select visible
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedVideoIds([])}
                      className="rounded-full border border-[var(--panel-border)] px-4 py-2 text-[13px] text-[var(--foreground)]"
                    >
                      Clear selection
                    </button>
                    <button
                      type="button"
                      disabled={selectedVideoIds.length === 0 || isDeletingVideos}
                      onClick={() => void deleteLibraryVideos(selectedVideoIds)}
                      className="inline-flex items-center gap-2 rounded-full bg-[rgba(255,107,107,0.12)] px-4 py-2 text-[13px] text-[rgb(255,166,166)] disabled:opacity-40"
                    >
                      {isDeletingVideos ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      Remove selected
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {visibleVideos.map((video, index) => (
                  <motion.button
                    key={video.video_id}
                    type="button"
                    onClick={() => {
                      if (scopeMode === "batch") {
                        toggleBatchVideo(video.video_id);
                        return;
                      }
                      setSelectedVideoId(video.video_id);
                      setScopeMode("specific");
                      setTaskTab("workbench");
                    }}
                    className="interactive-card group overflow-hidden rounded-[28px] border border-[var(--panel-border)] bg-[var(--surface-elevated)] text-left"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, delay: index * 0.03 }}
                  >
                    <div className="relative h-44 overflow-hidden bg-[linear-gradient(135deg,rgba(85,194,255,0.16),rgba(255,147,82,0.18))]">
                      {video.thumbnail_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={video.thumbnail_url}
                          alt={video.title}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                        />
                      ) : null}
                      <div className="absolute inset-0 scale-110 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.2),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_28%)] transition-transform duration-500 group-hover:scale-[1.16]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(7,13,24,0.84)] via-[rgba(7,13,24,0.2)] to-transparent" />
                      <div className="absolute left-5 top-5 rounded-full bg-[rgba(7,13,24,0.58)] px-3 py-1 text-[12px] font-medium text-white">
                        {formatDuration(video.duration_seconds)}
                      </div>
                      <div className="absolute bottom-5 left-5 right-5">
                        <div className="flex items-center justify-between gap-3">
                          <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(7,13,24,0.58)] px-3 py-1 text-[12px] text-white/90">
                            <Clock3 className="h-3.5 w-3.5 text-[var(--primary)]" />
                            {video.search_quality || "indexed"}
                          </div>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleBatchVideo(video.video_id);
                              setScopeMode("batch");
                            }}
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12px] ${
                              selectedVideoIds.includes(video.video_id)
                                ? "bg-[var(--surface-brand)] text-[var(--foreground)]"
                                : "bg-[rgba(7,13,24,0.58)] text-white/90"
                            }`}
                          >
                            {selectedVideoIds.includes(video.video_id) ? <Check className="h-3.5 w-3.5" /> : <Layers3 className="h-3.5 w-3.5" />}
                            Batch
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3 px-5 py-5">
                      <div>
                        <div className="text-lg font-semibold tracking-[-0.02em] text-[var(--foreground)]">{video.title}</div>
                        <div className="mt-2 text-sm text-[var(--muted-foreground)]">
                          {video.channel || (video.source_type === "youtube_link" ? "YouTube link" : "Local upload")}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-[var(--panel-border)] px-3 py-1 text-[12px] text-[var(--muted-foreground)]">
                          {video.source_type === "youtube_link" ? "YouTube" : "Upload"}
                        </span>
                        {video.is_complete && (
                          <span className="rounded-full border border-[rgba(58,216,163,0.26)] px-3 py-1 text-[12px] text-[var(--success)]">
                            Ready
                          </span>
                        )}
                        {selectedVideoIds.includes(video.video_id) && (
                          <span className="rounded-full border border-[var(--primary-soft)] px-3 py-1 text-[12px] text-[var(--primary)]">
                            In batch
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedVideoId(video.video_id);
                            setScopeMode("specific");
                            setTaskTab("workbench");
                          }}
                          className="rounded-full border border-[var(--panel-border)] px-3 py-2 text-[12px] text-[var(--foreground)]"
                        >
                          Open in workspace
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleBatchVideo(video.video_id);
                            setScopeMode("batch");
                          }}
                          className="rounded-full border border-[var(--panel-border)] px-3 py-2 text-[12px] text-[var(--foreground)]"
                        >
                          {selectedVideoIds.includes(video.video_id) ? "Remove from batch" : "Add to batch"}
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            void deleteLibraryVideos([video.video_id]);
                          }}
                          className="inline-flex items-center gap-2 rounded-full bg-[rgba(255,107,107,0.12)] px-3 py-2 text-[12px] text-[rgb(255,166,166)]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </motion.button>
                ))}
                {visibleVideos.length === 0 && (
                  <div className="rounded-[28px] border border-dashed border-[var(--panel-border)] px-6 py-14 text-center">
                    <div className="text-lg font-medium text-[var(--foreground)]">No videos matched</div>
                    <div className="mt-2 text-sm text-[var(--muted-foreground)]">Try a different filter or ingest a new video first.</div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="pt-5 xl:flex xl:h-full xl:flex-col">
              <div className="rounded-[22px] border border-[var(--panel-border)] bg-[var(--surface-elevated)] px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-brand)] text-[var(--foreground)]">
                    <MessageSquareText className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[var(--foreground)]">{contextLabel}</div>
                    <div className="mt-1 text-sm text-[var(--muted-foreground)]">
                      {taskTab === "search" ? "Perplexity-style grounded search" : `${activeModeConfig.label} mode with contextual output`}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3 xl:max-h-[40vh] xl:flex-1 xl:overflow-y-auto xl:pr-2">
                <div className="rounded-[20px] border border-[var(--panel-border)] bg-[var(--surface-elevated)] px-4 py-3 text-sm leading-7 text-[var(--muted-foreground)]">
                  Tip: keep the question short here, then use the center output studio to read, inspect citations, and jump into playback.
                </div>

                <AnimatePresence initial={false}>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.pending ? (
                        <ThinkingBubble />
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (message.role === "assistant") {
                              setSelectedMessageId(message.id);
                              setResultTab("answer");
                            }
                          }}
                          className={`max-w-[92%] rounded-[28px] border px-5 py-4 text-left shadow-[var(--shadow-soft)] ${
                            message.role === "user"
                              ? "border-[var(--primary-soft)] bg-[var(--surface-brand)] text-[var(--foreground)]"
                              : "border-[var(--panel-border)] bg-[var(--surface-elevated)] text-[var(--foreground)]"
                          }`}
                        >
                          <div className="workspace-label">
                            {message.role === "user" ? "You" : message.title || "Lumio"}
                          </div>
                          <div className="mt-3 line-clamp-6 whitespace-pre-wrap text-[16px] font-medium leading-8 text-[var(--foreground)]/92">{message.content}</div>
                          {message.sources && message.sources.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {message.sources.slice(0, 3).map((source, index) => (
                                <span
                                  key={`${message.id}-${source.video_id}-${source.timestamp}-${index}`}
                                  className="inline-flex items-center gap-2 rounded-full border border-[var(--panel-border)] px-3 py-1 text-[12px] text-[var(--muted-foreground)]"
                                >
                                  <PlayCircle className="h-3.5 w-3.5 text-[var(--primary)]" />
                                  {source.timestamp}
                                </span>
                              ))}
                            </div>
                          )}
                        </button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <form onSubmit={handleSubmit} className="sticky bottom-20 mt-6 rounded-[30px] border border-[var(--panel-border)] bg-[var(--panel-solid)] p-3 shadow-[var(--shadow-strong)] lg:bottom-6 xl:mt-5">
                <textarea
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={taskTab === "search" ? "Ask anything grounded in your video library..." : "Ask a follow-up or refine the request..."}
                  className="min-h-[88px] w-full resize-none bg-transparent px-3 py-3 text-[16px] leading-8 text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)]"
                />
                <div className="flex flex-col gap-3 border-t border-[var(--panel-border)] px-3 pt-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    <span className="rounded-full border border-[var(--panel-border)] px-3 py-1 text-[12px] text-[var(--muted-foreground)]">
                      {taskTab === "search" ? "Grounded search" : activeModeConfig.label}
                    </span>
                    <span className="rounded-full border border-[var(--panel-border)] px-3 py-1 text-[12px] text-[var(--muted-foreground)]">
                      {contextLabel}
                    </span>
                  </div>
                  <button
                    type="submit"
                    disabled={
                      isSearching ||
                      (!query.trim() && taskTab === "search") ||
                      (scopeMode === "batch" ? selectedVideoIds.length === 0 : scopeMode !== "library" && !resolvedVideoId)
                    }
                    className="premium-button premium-button-primary w-full md:w-auto disabled:opacity-40"
                  >
                    {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {isSearching ? "Thinking..." : taskTab === "search" ? "Send question" : `Run ${activeModeConfig.label}`}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
 
        <aside className={`glass-card rounded-[32px] p-5 md:p-6 xl:order-2 ${isSearching ? "thinking-shimmer" : ""}`}>
          <div className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
              <div>
                <div className="workspace-label">Output studio</div>
                <div className="workspace-heading mt-3">Answer, evidence, and playback in one readable center stage.</div>
                <div className="workspace-subtle mt-2">
                  This is the main review surface. Read the answer first, then open evidence or playback only when you need to verify.
                </div>
              </div>
              {taskTab !== "search" && (
                <div className="rounded-[22px] border border-[var(--panel-border)] bg-[var(--surface-elevated)] px-5 py-4">
                  <div className="workspace-label">Current task</div>
                  <div className="mt-2 text-base font-semibold tracking-[-0.02em] text-[var(--foreground)]">{activeModeConfig.prompt}</div>
                  <div className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
                    Try: &quot;Give me the 3-minute version&quot;, &quot;Find the metric mentioned around the middle&quot;, or &quot;Turn this into a client summary&quot;.
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-[var(--panel-border)] px-3 py-1 text-[12px] text-[var(--muted-foreground)]">
                      {activeModeConfig.label}
                    </span>
                    <span className="rounded-full border border-[var(--panel-border)] px-3 py-1 text-[12px] text-[var(--muted-foreground)]">
                      {contextLabel}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 rounded-[18px] border border-[var(--panel-border)] bg-[var(--surface-muted)] p-1">
              {[
                { id: "answer", label: "Answer" },
                { id: "evidence", label: "Evidence" },
                { id: "player", label: "Player" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setResultTab(tab.id as "answer" | "evidence" | "player")}
                  className={`rounded-[14px] px-3 py-2 text-[13px] font-medium ${
                    resultTab === tab.id
                      ? "bg-[var(--surface-brand)] text-[var(--foreground)] shadow-[var(--shadow-soft)]"
                      : "text-[var(--muted-foreground)]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 min-h-[700px]">
            {resultTab === "answer" && (
              <div className="space-y-4">
                {!activeMessage && !isSearching && (
                  <div className="rounded-[28px] border border-dashed border-[var(--panel-border)] px-6 py-14 text-center">
                    <Sparkles className="mx-auto h-8 w-8 text-[var(--primary)]" />
                    <div className="mt-4 text-xl font-semibold tracking-[-0.02em] text-[var(--foreground)]">Answers land here</div>
                    <div className="mt-2 text-[15px] leading-7 text-[var(--muted-foreground)]">
                      Use the right-side AI workspace to ask a question or run a workbench task.
                    </div>
                  </div>
                )}
                {isSearching && !activeMessage && <ThinkingBubble />}
                {activeMessage && (
                  <div className="space-y-5">
                    <div className="workspace-panel rounded-[24px] px-4 py-4">
                      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
                        <div>
                          <div className="workspace-label">Export</div>
                          <div className="mt-2 text-lg font-semibold tracking-[-0.02em] text-[var(--foreground)]">Take this answer anywhere.</div>
                          <div className="mt-1 text-sm text-[var(--muted-foreground)]">Download, copy, or print the current answer in the format you need.</div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 xl:max-w-[320px] xl:justify-end">
                          <select
                            value={exportFormat}
                            onChange={(event) => setExportFormat(event.target.value as "txt" | "md" | "json" | "html")}
                            className="rounded-full border border-[var(--panel-border)] bg-[var(--surface-muted)] px-3 py-2 text-[13px] text-[var(--foreground)] outline-none"
                          >
                            <option value="md">Markdown</option>
                            <option value="txt">Text</option>
                            <option value="json">JSON</option>
                            <option value="html">HTML</option>
                          </select>
                          <button
                            type="button"
                            onClick={downloadExport}
                            className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-brand)] px-3 py-2 text-[13px] text-[var(--foreground)]"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </button>
                          <button
                            type="button"
                            onClick={copyExport}
                            className="inline-flex items-center gap-2 rounded-full border border-[var(--panel-border)] px-3 py-2 text-[13px] text-[var(--foreground)]"
                          >
                            Copy
                          </button>
                          <button
                            type="button"
                            onClick={printExport}
                            className="inline-flex items-center gap-2 rounded-full border border-[var(--panel-border)] px-3 py-2 text-[13px] text-[var(--foreground)]"
                          >
                            Print / PDF
                          </button>
                        </div>
                      </div>
                      {exportStatus && (
                        <div className="mt-3 text-[13px] text-[var(--muted-foreground)]">{exportStatus}</div>
                      )}
                    </div>
                    {activeMessage.sources && activeMessage.sources.length > 0 && (
                      <div className="workspace-panel rounded-[24px] px-4 py-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="workspace-label">Jump points</div>
                            <div className="mt-2 text-sm text-[var(--muted-foreground)]">Open the most relevant moments without leaving the answer.</div>
                          </div>
                          <div className="text-[12px] font-medium text-[var(--muted-foreground)]">{activeMessage.sources.length} citations</div>
                        </div>
                        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                          {activeMessage.sources.slice(0, 8).map((source, index) => (
                            <button
                              key={`${activeMessage.id}-${source.video_id}-${source.timestamp}-${index}`}
                              type="button"
                              onClick={() => {
                                setPlayingVideo({ videoId: source.video_id, timestamp: source.timestamp });
                                setResultTab("player");
                              }}
                              className="inline-flex min-w-[108px] items-center justify-center gap-2 rounded-full border border-[var(--panel-border)] bg-[var(--surface-elevated)] px-3 py-2 text-[13px] text-[var(--foreground)]"
                            >
                              <PlayCircle className="h-3.5 w-3.5 text-[var(--primary)]" />
                              {source.timestamp}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="workspace-panel rounded-[28px] px-5 py-5">
                      <div className="flex flex-col gap-4 border-b border-[var(--panel-border)] pb-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="workspace-label">{activeMessage.title || "Grounded answer"}</div>
                          <div className="mt-2 text-lg font-semibold tracking-[-0.02em] text-[var(--foreground)]">Readable answer canvas</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setResultTab("evidence")}
                          className="rounded-full border border-[var(--panel-border)] px-3 py-2 text-[13px] font-medium text-[var(--foreground)]"
                        >
                          Open evidence
                        </button>
                      </div>
                      <div className="answer-scroll mt-5 pr-2 xl:max-h-[72vh]">
                        <div className="workbench-prose border-l border-[var(--primary-soft)] pl-5">
                          {renderRichText(activeMessage.content)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {resultTab === "evidence" && (
              <div className="space-y-4">
                {!activeMessage?.sources?.length && (
                  <div className="rounded-[28px] border border-dashed border-[var(--panel-border)] px-6 py-14 text-center">
                    <div className="text-xl font-semibold tracking-[-0.02em] text-[var(--foreground)]">Evidence will show up here</div>
                    <div className="mt-2 text-[15px] text-[var(--muted-foreground)]">
                      Each answer is grounded in transcript and visual evidence when available.
                    </div>
                  </div>
                )}
                {activeMessage?.sources?.map((source, index) => (
                  <motion.button
                    key={`${source.video_id}-${source.timestamp}-${index}`}
                    type="button"
                    onClick={() => {
                      setPlayingVideo({ videoId: source.video_id, timestamp: source.timestamp });
                      setResultTab("player");
                    }}
                    className="interactive-card w-full rounded-[24px] border border-[var(--panel-border)] bg-[var(--surface-elevated)] p-3 text-left"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                  >
                    <div className="relative aspect-[16/9] overflow-hidden rounded-[18px] bg-[linear-gradient(135deg,rgba(85,194,255,0.14),rgba(255,147,82,0.16))]">
                      {source.frame_path ? (
                        <Image
                          src={`${API}/${source.frame_path.replace(/\\/g, "/")}`}
                          alt={`Frame at ${source.timestamp}`}
                          fill
                          sizes="(min-width: 1280px) 20vw, 100vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[var(--muted-foreground)]">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-black/55 px-3 py-1 text-[12px] text-white">
                        <PlayCircle className="h-3.5 w-3.5 text-[var(--primary)]" />
                        {source.timestamp}
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="workspace-label">
                        {source.video_id.slice(0, 8)}
                      </div>
                      <div className="mt-2 text-[15px] leading-8 text-[var(--foreground)]/88">{source.text}</div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}

            {resultTab === "player" && (
              <div className="space-y-4">
                {playingVideo ? (
                  <>
                    <VideoPlayer videoId={playingVideo.videoId} timestamp={playingVideo.timestamp} />
                    <div className="rounded-[24px] border border-[var(--panel-border)] bg-[var(--surface-elevated)] px-4 py-4 text-sm leading-7 text-[var(--muted-foreground)]">
                      Jumped to <span className="font-medium text-[var(--foreground)]">{playingVideo.timestamp}</span> in{" "}
                      <span className="font-medium text-[var(--foreground)]">{playingVideo.videoId.slice(0, 8)}</span>.
                    </div>
                  </>
                ) : (
                  <div className="rounded-[28px] border border-dashed border-[var(--panel-border)] px-6 py-14 text-center">
                    <div className="text-xl font-semibold tracking-[-0.02em] text-[var(--foreground)]">Mini player stands by here</div>
                    <div className="mt-2 text-[15px] leading-7 text-[var(--muted-foreground)]">
                      Click any citation or evidence card to sync the answer with the exact video moment.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {toolDrawerOpen && (
          <motion.div
            className="fixed inset-0 z-[85] flex items-end justify-center bg-[rgba(7,13,24,0.56)] p-4 backdrop-blur-xl md:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setToolDrawerOpen(false)}
          >
            <motion.div
              className="glass-card w-full max-w-3xl rounded-[32px] p-5 md:p-6"
              initial={{ opacity: 0, y: 28, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xl font-semibold tracking-[-0.02em] text-[var(--foreground)]">Choose a tool</div>
                  <div className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
                    Pick the kind of answer you want, then ask naturally in the workspace.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setToolDrawerOpen(false)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--panel-border)] bg-[var(--surface-elevated)] text-[var(--foreground)]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 grid max-h-[65vh] gap-3 overflow-y-auto pr-1 md:grid-cols-2">
                {workbenchModes.map((mode) => {
                  const Icon = mode.icon;
                  const active = activeMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => {
                        setTaskTab("workbench");
                        setActiveMode(mode.id);
                        setToolDrawerOpen(false);
                      }}
                      className={`interactive-card rounded-[24px] border p-4 text-left ${
                        active
                          ? "border-[var(--primary-soft)] bg-[var(--surface-brand)]"
                          : "border-[var(--panel-border)] bg-[var(--surface-elevated)]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--surface-muted)]">
                          <Icon className={`h-5 w-5 ${active ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-[var(--foreground)]">{mode.label}</div>
                          <div className="mt-2 text-[13px] leading-6 text-[var(--muted-foreground)]">{mode.prompt}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
