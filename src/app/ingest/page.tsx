import { ArrowRight, AudioLines, FileVideo, ScanSearch, UploadCloud } from "lucide-react";
import AppShell from "@/components/AppShell";
import UploadSection from "@/components/UploadSection";

const pipeline = [
  { icon: UploadCloud, title: "Source ingest", body: "Bring in a local file or a remote link and establish the source envelope." },
  { icon: AudioLines, title: "Whisper transcript", body: "Audio is converted into searchable text first so the console wakes up early." },
  { icon: ScanSearch, title: "Visual framing", body: "Frames, captions, and timestamps are synchronized for grounded retrieval." },
  { icon: FileVideo, title: "Qdrant vectorization", body: "Chunks become semantic vectors and move into the indexed video library." },
];

export default function IngestPage() {
  return (
    <AppShell
      currentPath="/ingest"
      eyebrow="Ingest"
      title="Pipe raw footage through a live multimodal indexing flow."
      subtitle="Bring in a file or link and watch Lumio move from source ingest to transcript, framing, and vectorization with readable system feedback."
      hero={
        <div className="glass-card rounded-[30px] p-5 md:p-6">
          <div className="eyebrow">
            <span className="status-dot" />
            Data flow
          </div>
          <div className="mt-5 space-y-4">
            {pipeline.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="relative flex items-start gap-4 rounded-[22px] border border-[var(--panel-border)] bg-[var(--surface-elevated)] p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--surface-brand)] text-[var(--foreground)] shadow-[var(--shadow-soft)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                      Node 0{index + 1}
                    </div>
                    <div className="mt-1 text-sm font-medium text-[var(--foreground)]">
                      {step.title}
                    </div>
                    <div className="mt-1 text-sm leading-7 text-[var(--muted-foreground)]">{step.body}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      }
    >
      <section className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.55fr)]">
        <div className="min-w-0">
          <UploadSection />
        </div>

        <aside className="glass-card rounded-[32px] p-6 md:p-8">
          <div className="eyebrow">
            <ArrowRight className="h-4 w-4 text-[var(--accent)]" />
            Live readout
          </div>
          <div className="mt-6 space-y-5">
            {[
              {
                title: "System live",
                body: "Transcript-first indexing opens the workspace before the deeper visual pass fully completes.",
              },
              {
                title: "Readable terminal state",
                body: "Each phase stays legible, so the pipeline feels like a console you can trust rather than a blind spinner.",
              },
              {
                title: "Made for long-form footage",
                body: "Lectures, calls, podcasts, and walkthroughs can all move through the same ingestion engine without losing context.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-[24px] border border-[var(--panel-border)] bg-[var(--surface-elevated)] p-5">
                <div className="text-lg font-medium tracking-[-0.02em] text-[var(--foreground)]">{item.title}</div>
                <div className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">{item.body}</div>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </AppShell>
  );
}
