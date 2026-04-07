import { ArrowRight, AudioLines, FileVideo, ScanSearch, UploadCloud } from "lucide-react";
import AppShell from "@/components/AppShell";
import UploadSection from "@/components/UploadSection";

const pipeline = [
  { icon: UploadCloud, title: "Upload", body: "Add a local file or paste a YouTube link into the ingestion pipeline." },
  { icon: AudioLines, title: "Transcribe", body: "Audio becomes searchable first so the workspace can unlock earlier." },
  { icon: ScanSearch, title: "Index", body: "Visual evidence, timestamps, and metadata get attached for grounded retrieval." },
  { icon: FileVideo, title: "Ready", body: "The video moves into your AI workspace and indexed library automatically." },
];

export default function IngestPage() {
  return (
    <AppShell
      currentPath="/ingest"
      eyebrow="Ingest"
      title="Add a recording and let Lumio prep it for search."
      subtitle="Upload a file or paste a link. You can watch the pipeline move from upload to search-ready without guessing what the system is doing."
      hero={
        <div className="glass-card rounded-[30px] p-5 md:p-6">
          <div className="eyebrow">
            <span className="status-dot" />
            Progressive indexing
          </div>
          <div className="mt-5 space-y-4">
            {pipeline.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="flex items-start gap-4 rounded-[22px] border border-[var(--panel-border)] bg-[var(--surface-elevated)] p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--surface-brand)] text-[var(--foreground)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[var(--foreground)]">
                      {index + 1}. {step.title}
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
            What you get
          </div>
          <div className="mt-6 space-y-5">
            {[
              {
                title: "Search goes live earlier",
                body: "Users can begin asking grounded questions while deeper visual enrichment continues in the background.",
              },
              {
                title: "Status is legible",
                body: "The processing state is surfaced as a clear step system instead of a wall of logs or a spinner with no meaning.",
              },
              {
                title: "Built for long-form video",
                body: "The experience is tuned for lectures, podcasts, walkthroughs, and presentations where minutes and context matter.",
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
