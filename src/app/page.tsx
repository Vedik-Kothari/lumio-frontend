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
    title: "Ingest once, query instantly",
    body: "Upload a file or drop a YouTube link, then move into transcript-first search while multimodal indexing continues in the background.",
  },
  {
    icon: Search,
    title: "Ask in natural language",
    body: "Use grounded search, executive outputs, moment maps, and cross-video memory in one conversational AI workspace.",
  },
  {
    icon: LibraryBig,
    title: "Turn videos into a working library",
    body: "Browse indexed videos, filter the collection, and jump directly into analysis with evidence and playback synced together.",
  },
];

export default function Home() {
  return (
    <AppShell
      currentPath="/"
      eyebrow="Lumio"
      title="Make sense of long videos without scrubbing through them twice."
      subtitle="Bring in a recording, ask direct questions, and move from rough footage to something you can search, cite, and reuse."
      hero={
        <div className="relative min-h-[340px] w-full max-w-[480px]">
          <div className="hero-orb right-0 top-2 bg-[radial-gradient(circle,rgba(85,194,255,0.55)_0%,rgba(85,194,255,0.14)_45%,transparent_72%)]" />
          <div className="hero-orb bottom-0 left-6 bg-[radial-gradient(circle,rgba(255,147,82,0.32)_0%,rgba(255,147,82,0.12)_45%,transparent_72%)]" />
          <div className="glass-card noise-surface animate-float absolute inset-x-0 top-8 rounded-[32px] p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-[var(--foreground)]">AI output studio</div>
                <div className="mt-2 text-sm text-[var(--muted-foreground)]">Moment map, evidence, and synced player</div>
              </div>
              <div className="rounded-full bg-[var(--surface-brand)] px-3 py-1 text-[12px] font-medium text-[var(--foreground)]">
                Live
              </div>
            </div>
            <div className="mt-6 grid gap-4">
              <div className="rounded-[24px] border border-[var(--panel-border)] bg-[var(--surface-elevated)] p-4">
                <div className="text-[13px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Using 3 indexed videos</div>
                <div className="mt-3 text-lg font-medium text-[var(--foreground)]">Summarize the key financial shift and show me the exact moment it changed.</div>
              </div>
              <div className="rounded-[24px] border border-[var(--panel-border)] bg-[var(--surface-elevated)] p-4">
                <div className="flex items-center gap-2 text-[13px] text-[var(--muted-foreground)]">
                  <PlayCircle className="h-4 w-4 text-[var(--primary)]" />
                  Evidence-backed response
                </div>
                <div className="mt-3 text-sm leading-7 text-[var(--foreground)]/86">
                  Margin compression begins after the pricing discussion and reverses at the updated guidance section.
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { value: "Transcript-first", label: "Search becomes useful before full visual enrichment completes" },
          { value: "Evidence-linked", label: "Answers, frames, and playback stay connected" },
          { value: "Cross-video", label: "Run the same question over one video or the whole library" },
          { value: "AI-first", label: "Built around queries and outputs, not a dashboard grid" },
        ].map((stat) => (
          <div
            key={stat.value}
            className="glass-card interactive-card rounded-[28px] p-5"
          >
            <div className="text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">{stat.value}</div>
            <div className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">{stat.label}</div>
          </div>
        ))}
      </section>

      <section className="section-space pb-0">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="glass-card rounded-[32px] p-6 md:p-8">
            <div className="eyebrow">
              <span className="status-dot" />
              How it works
            </div>
            <h2 className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
              From raw video to something useful.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--muted-foreground)]">
              Lumio is built for the moments after you hit play: finding the answer, checking the source, and turning that moment into something you can act on.
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
              Start here
            </div>
            <div className="mt-6 space-y-4">
              {[
                { href: "/ingest", title: "Start an ingest job", body: "Drop in a local file or YouTube link with progressive indexing and live pipeline feedback." },
                { href: "/workspace", title: "Open the AI workspace", body: "Chat with your video knowledge base, run workbench tools, and follow evidence into the player." },
                { href: "/library", title: "Explore the library", body: "Filter indexed videos, inspect readiness, and branch into focused analysis with one click." },
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
