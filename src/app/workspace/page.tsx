import { MessageSquareText, PlayCircle, ScanSearch } from "lucide-react";
import AppShell from "@/components/AppShell";
import SearchInterface from "@/components/SearchInterface";

export default function WorkspacePage() {
  return (
    <AppShell
      currentPath="/workspace"
      eyebrow="Workspace"
      aiActive
      title="Ask better questions. Get answers you can actually trace."
      subtitle="Chat with a video, open the source behind the answer, and jump straight to the moment that matters."
      hero={
        <div className="glass-card rounded-[30px] p-5 md:p-6">
          <div className="grid gap-4">
            {[
              { icon: MessageSquareText, title: "Conversation-first", body: "Follow-ups happen inline instead of inside a buried modal." },
              { icon: ScanSearch, title: "Evidence-linked", body: "Every grounded answer can open sources, timestamps, and frame snapshots." },
              { icon: PlayCircle, title: "Player-synced", body: "Click a citation and jump directly into the relevant moment." },
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
