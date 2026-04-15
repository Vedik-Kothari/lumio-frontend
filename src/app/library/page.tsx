import { BookOpenText, Layers3, LibraryBig } from "lucide-react";
import AppShell from "@/components/AppShell";
import SearchInterface from "@/components/SearchInterface";

export default function LibraryPage() {
  return (
    <AppShell
      currentPath="/library"
      eyebrow="Library"
      title="A signal library for every indexed recording."
      subtitle="Scan the collection, choose one video or a batch, and move into analysis with the right semantic context already loaded."
      hero={
        <div className="glass-card rounded-[30px] p-5 md:p-6">
          <div className="grid gap-4">
            {[
              { icon: LibraryBig, title: "Bento-style library view", body: "Treat every indexed recording like a structured asset, not a loose media file." },
              { icon: Layers3, title: "Semantic scope control", body: "Switch between one video, selected batches, or the full indexed collection." },
              { icon: BookOpenText, title: "Reusable video memory", body: "Carry knowledge forward from one recording into new questions and comparisons." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-[24px] border border-[var(--panel-border)] bg-[var(--surface-elevated)] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--surface-brand)] text-[var(--foreground)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[var(--foreground)]">{item.title}</div>
                      <div className="mt-1 text-sm leading-7 text-[var(--muted-foreground)]">{item.body}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      }
    >
      <SearchInterface initialTaskTab="library" />
    </AppShell>
  );
}
