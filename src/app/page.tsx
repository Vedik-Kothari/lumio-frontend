import {
  ArrowRight,
  BrainCircuit,
  LibraryBig,
  PlayCircle,
  Search,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import AppShell from "@/components/AppShell";

const featureCards = [
  {
    icon: BrainCircuit,
    title: "Ingest once, open a live knowledge graph",
    body: "Bring in a file or YouTube link and let Lumio turn speech, frames, and timestamps into a queryable intelligence surface.",
  },
  {
    icon: Search,
    title: "Interrogate it like a console",
    body: "Search naturally, branch into workbench tools, and keep every answer anchored to evidence instead of guesswork.",
  },
  {
    icon: LibraryBig,
    title: "Build a reusable signal library",
    body: "Treat recordings as structured intelligence assets you can compare, filter, and reuse across new questions.",
  },
];

export default function Home() {
  return (
    <AppShell
      currentPath="/"
      eyebrow="Lumio"
      title="A neural console for turning long video into evidence you can actually use."
      subtitle="Ingest recordings, inspect grounded answers, and move from raw footage to structured knowledge without losing the moment that matters."
      hero={
        <div className="relative min-h-[340px] w-full max-w-[480px]">
          <div className="hero-orb right-0 top-2 bg-[radial-gradient(circle,rgba(34,211,238,0.42)_0%,rgba(34,211,238,0.12)_45%,transparent_72%)]" />
          <div className="hero-orb bottom-0 left-6 bg-[radial-gradient(circle,rgba(251,191,36,0.28)_0%,rgba(16,185,129,0.12)_52%,transparent_74%)]" />
          <div className="glass-card noise-surface animate-float absolute inset-x-0 top-8 rounded-[32px] p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-mono text-[12px] uppercase tracking-[0.22em] text-[var(--muted-foreground)]">Neural workspace</div>
                <div className="mt-2 text-sm text-[var(--muted-foreground)]">Moment map, semantic traces, and synced playback</div>
              </div>
              <div className="rounded-full border border-[var(--accent-soft)] bg-[rgba(16,185,129,0.12)] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--foreground)]">
                System live
              </div>
            </div>
            <div className="mt-6 grid gap-4">
              <div className="rounded-[24px] border border-[var(--panel-border)] bg-[var(--surface-elevated)] p-4">
                <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Context: 3 indexed recordings</div>
                <div className="mt-3 text-lg font-medium text-[var(--foreground)]">Surface the financial inflection point and bind it to the exact timestamp where the narrative flips.</div>
              </div>
              <div className="rounded-[24px] border border-[var(--panel-border)] bg-[var(--surface-elevated)] p-4">
                <div className="flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                  <PlayCircle className="h-4 w-4 text-[var(--primary)]" />
                  Evidence trace
                </div>
                <div className="mt-3 text-sm leading-7 text-[var(--foreground)]/86">
                  Margin compression begins after the pricing discussion, peaks through the midpoint, then reverses during updated guidance.
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { value: "Transcript-first", label: "Search wakes up before the full multimodal pass finishes indexing." },
          { value: "Evidence-linked", label: "Answers, frames, citations, and playback stay stitched together." },
          { value: "Cross-video", label: "Run one prompt across a single recording, a batch, or the full library." },
          { value: "Neural-console", label: "Designed around retrieval, evidence, and reuse instead of dashboard chrome." },
        ].map((stat) => (
          <div
            key={stat.value}
            className="glass-card interactive-card rounded-[28px] p-5"
          >
            <div className="font-mono text-[12px] uppercase tracking-[0.24em] text-[var(--muted-foreground)]">{stat.value}</div>
            <div className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">{stat.label}</div>
          </div>
        ))}
      </section>

      <section className="section-space pb-0">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="glass-card rounded-[32px] p-6 md:p-8">
            <div className="eyebrow">
              <span className="status-dot" />
              System flow
            </div>
            <h2 className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
              From ingestion to reusable intelligence.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--muted-foreground)]">
              Lumio is built for the moment after play begins: isolate the signal, verify the source, and turn that moment into something you can share, cite, or act on.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {featureCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.title} className="interactive-card rounded-[26px] border border-[var(--panel-border)] bg-[var(--surface-elevated)] p-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--surface-brand)] text-[var(--foreground)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="mt-4 text-lg font-medium tracking-[-0.02em] text-[var(--foreground)]">{card.title}</div>
                    <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">{card.body}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-card rounded-[32px] p-6 md:p-8">
            <div className="eyebrow">
              <Sparkles className="h-4 w-4 text-[var(--primary)]" />
              Launch points
            </div>
            <div className="mt-6 space-y-4">
              {[
                { href: "/ingest", title: "Run the ingest pipeline", body: "Drop in a local file or YouTube link and watch the system progress from source to vectors." },
                { href: "/workspace", title: "Open the neural workspace", body: "Query your video knowledge base, inspect evidence, and move directly into playback." },
                { href: "/library", title: "Browse the signal library", body: "Filter indexed recordings, inspect status, and branch into focused analysis from one place." },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="interactive-card flex items-center justify-between gap-4 rounded-[26px] border border-[var(--panel-border)] bg-[var(--surface-elevated)] px-5 py-5"
                >
                  <div>
                    <div className="text-lg font-medium tracking-[-0.02em] text-[var(--foreground)]">{item.title}</div>
                    <div className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">{item.body}</div>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-[var(--primary)]" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
