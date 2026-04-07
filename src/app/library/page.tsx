import { BookOpenText, Layers3, LibraryBig } from "lucide-react";
import AppShell from "@/components/AppShell";
import SearchInterface from "@/components/SearchInterface";

export default function LibraryPage() {
  return (
    <AppShell
      currentPath="/library"
      eyebrow="Library"
      title="Keep every indexed video within reach."
      subtitle="Scan the library quickly, pick a single recording or the whole collection, and jump into analysis with the right context already selected."
      hero={
        <div className="glass-card rounded-[30px] p-5 md:p-6">
          <div className="grid gap-4">
            {[
              { icon: LibraryBig, title: "Library-scale view", body: "See the whole indexed collection with cleaner scanning and faster entry points." },
              { icon: Layers3, title: "Context-aware", body: "Move from one video to all indexed videos with visible scope controls." },
              { icon: BookOpenText, title: "Reusable knowledge", body: "Treat recordings as a searchable, explorable knowledge base instead of raw media files." },
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
