import { MessageSquareText, PlayCircle, ScanSearch } from "lucide-react";
import AppShell from "@/components/AppShell";
import SearchInterface from "@/components/SearchInterface";

export default function WorkspacePage() {
  return (
    <AppShell
      currentPath="/workspace"
      eyebrow="Workspace"
      aiActive
      title="Operate the video like a multimodal intelligence system."
      subtitle="Query naturally, inspect the evidence trail, and jump straight to the visual or transcript moment that supports the answer."
      hero={
        <div className="glass-card rounded-[30px] p-5 md:p-6">
          <div className="grid gap-4">
            {[
              { icon: MessageSquareText, title: "Intelligence studio", body: "Follow-ups stay conversational while the system keeps retrieval, evidence, and context in sync." },
              { icon: ScanSearch, title: "Evidence rail", body: "Every answer keeps its supporting sources, timestamps, and frame snapshots close at hand." },
              { icon: PlayCircle, title: "Timeline-linked player", body: "Move from a citation to playback without breaking the flow of analysis." },
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
      <SearchInterface initialTaskTab="workbench" />
    </AppShell>
  );
}
