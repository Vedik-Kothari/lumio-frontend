"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Command, MoonStar, Search, Sparkles, SunMedium, Upload, Video } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "./ThemeProvider";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const commandItems = [
  { href: "/", label: "Open Overview", description: "See product overview and quick launch cards", icon: Sparkles },
  { href: "/ingest", label: "Open Ingest", description: "Upload a file or add a YouTube link", icon: Upload },
  { href: "/workspace", label: "Open Workspace", description: "Query videos and inspect evidence", icon: Search },
  { href: "/library", label: "Open Library", description: "Browse indexed videos and jump into analysis", icon: Video },
];

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
    }
  }, [isOpen]);

  const items = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return commandItems;
    return commandItems.filter((item) =>
      `${item.label} ${item.description}`.toLowerCase().includes(normalized)
    );
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-start justify-center bg-[rgba(5,10,18,0.52)] px-4 pt-20 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-[var(--panel-border)] bg-[var(--panel-solid)] shadow-[var(--shadow-strong)]"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-[var(--panel-border)] px-5 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--surface-elevated)] text-[var(--primary)]">
                <Command className="h-5 w-5" />
              </div>
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search actions, pages, and quick moves"
                className="h-10 flex-1 bg-transparent text-base text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)]"
              />
              <button
                type="button"
                onClick={toggleTheme}
                className="hidden h-10 items-center gap-2 rounded-2xl border border-[var(--panel-border)] bg-[var(--surface-elevated)] px-3 text-sm text-[var(--foreground)] transition-colors hover:border-[var(--primary-soft)] hover:text-[var(--primary)] sm:flex"
              >
                {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto px-3 py-3">
              <button
                type="button"
                onClick={() => {
                  toggleTheme();
                  onClose();
                }}
                className="mb-2 flex w-full items-center gap-4 rounded-[22px] border border-[var(--panel-border)] px-4 py-4 text-left transition-all hover:border-[var(--primary-soft)] hover:bg-[var(--surface-elevated)] sm:hidden"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--surface-elevated)] text-[var(--primary)]">
                  {theme === "dark" ? <SunMedium className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
                </div>
                <div>
                  <div className="text-sm font-medium text-[var(--foreground)]">{theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}</div>
                  <div className="mt-1 text-sm text-[var(--muted-foreground)]">Toggle the premium theme system</div>
                </div>
              </button>

              <div className="space-y-2">
                {items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className="flex items-center gap-4 rounded-[22px] border border-transparent px-4 py-4 transition-all hover:border-[var(--primary-soft)] hover:bg-[var(--surface-elevated)]"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--surface-elevated)] text-[var(--primary)]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                      <div className="text-sm font-medium text-[var(--foreground)]">{item.label}</div>
                        <div className="mt-1 text-sm text-[var(--muted-foreground)]">{item.description}</div>
                      </div>
                    </Link>
                  );
                })}
                {items.length === 0 && (
                  <div className="px-4 py-12 text-center">
                    <div className="text-base font-medium text-[var(--foreground)]">No command matched</div>
                    <div className="mt-2 text-sm text-[var(--muted-foreground)]">Try searching for workspace, ingest, or library.</div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
