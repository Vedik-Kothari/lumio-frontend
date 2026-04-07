"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Command,
  Library,
  Menu,
  MoonStar,
  Search,
  Sparkles,
  SunMedium,
  Upload,
  X,
} from "lucide-react";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import AmbientEffects from "./AmbientEffects";
import CommandPalette from "./CommandPalette";
import { useTheme } from "./ThemeProvider";

const navItems = [
  { href: "/", label: "Overview", icon: Sparkles },
  { href: "/ingest", label: "Ingest", icon: Upload },
  { href: "/workspace", label: "Workspace", icon: Search },
  { href: "/library", label: "Library", icon: Library },
];

export default function AppShell({
  children,
  title,
  subtitle,
  currentPath,
  eyebrow = "Lumio",
  aiActive = false,
  hero,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  currentPath: string;
  eyebrow?: string;
  aiActive?: boolean;
  hero?: ReactNode;
}) {
  const { theme, toggleTheme } = useTheme();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }
      if (event.key === "Escape") {
        setMobileNavOpen(false);
        setCommandOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [currentPath]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500">
      <AmbientEffects aiActive={aiActive} />
      <CommandPalette isOpen={commandOpen} onClose={() => setCommandOpen(false)} />

      <div className="relative z-10">
        <header className="sticky top-0 z-40 border-b border-[var(--panel-border)] bg-[color:var(--shell-bg)]/88 backdrop-blur-2xl">
          <div className="app-container">
            <div className="flex h-18 items-center justify-between gap-4 py-4">
              <div className="flex items-center gap-4">
                <Link href="/" className="group inline-flex items-center gap-3">
                  <div className="brand-mark transition-transform duration-300 group-hover:scale-[1.04]" />
                  <div className="brand-copy">
                    <div className="brand-wordmark">{eyebrow}</div>
                    <div className="brand-subtitle">Video intelligence workspace</div>
                  </div>
                </Link>

                <nav className="hidden items-center gap-2 lg:flex">
                  {navItems.map((item) => {
                    const active = currentPath === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all ${
                          active
                            ? "border border-[var(--primary-soft)] bg-[var(--surface-brand)] text-[var(--foreground)] shadow-[var(--shadow-soft)]"
                            : "border border-transparent text-[var(--muted-foreground)] hover:border-[var(--panel-border)] hover:bg-[var(--surface-elevated)] hover:text-[var(--foreground)]"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCommandOpen(true)}
                  className="hidden items-center gap-2 rounded-full border border-[var(--panel-border)] bg-[var(--surface-elevated)] px-4 py-2 text-sm text-[var(--muted-foreground)] transition-all hover:border-[var(--primary-soft)] hover:text-[var(--foreground)] md:flex"
                >
                  <Command className="h-4 w-4" />
                  Quick Actions
                  <span className="rounded-md border border-[var(--panel-border)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--muted-foreground)]">
                    Ctrl K
                  </span>
                </button>

                <button
                  type="button"
                  onClick={toggleTheme}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--panel-border)] bg-[var(--surface-elevated)] text-[var(--foreground)] transition-all hover:border-[var(--primary-soft)] hover:text-[var(--primary)]"
                  aria-label="Toggle theme"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={theme}
                      initial={{ opacity: 0, rotate: -18, scale: 0.8 }}
                      animate={{ opacity: 1, rotate: 0, scale: 1 }}
                      exit={{ opacity: 0, rotate: 18, scale: 0.8 }}
                      transition={{ duration: 0.18 }}
                    >
                      {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
                    </motion.span>
                  </AnimatePresence>
                </button>

                <button
                  type="button"
                  onClick={() => setMobileNavOpen((open) => !open)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--panel-border)] bg-[var(--surface-elevated)] text-[var(--foreground)] transition-all hover:border-[var(--primary-soft)] lg:hidden"
                  aria-label="Toggle navigation"
                >
                  {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {mobileNavOpen && (
              <motion.div
                className="border-t border-[var(--panel-border)] bg-[var(--shell-bg)]/96 px-4 py-4 backdrop-blur-2xl lg:hidden"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = currentPath === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 rounded-[20px] px-4 py-3 text-sm transition-all ${
                          active
                            ? "border border-[var(--primary-soft)] bg-[var(--surface-brand)] text-[var(--foreground)]"
                            : "border border-transparent bg-[var(--surface-elevated)] text-[var(--muted-foreground)]"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => {
                      setCommandOpen(true);
                      setMobileNavOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-[20px] bg-[var(--surface-elevated)] px-4 py-3 text-left text-sm text-[var(--foreground)]"
                  >
                    <Command className="h-4 w-4 text-[var(--primary)]" />
                    Quick Actions
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        <main className="pb-24 pt-6 md:pt-8">
          <div className="app-container">
            <section className="section-space">
              <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-end">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[var(--panel-border)] bg-[var(--surface-elevated)] px-4 py-2 text-[13px] text-[var(--muted-foreground)] shadow-[var(--shadow-soft)]">
                    <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
                    {eyebrow}
                  </div>
                  <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-[var(--foreground)] sm:text-5xl xl:text-6xl">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--muted-foreground)] sm:text-lg">
                      {subtitle}
                    </p>
                  )}
                </div>
                {hero && <div className="lg:justify-self-end">{hero}</div>}
              </div>
            </section>

            {children}
          </div>
        </main>

        <footer className="border-t border-[var(--panel-border)] pb-10 pt-6">
          <div className="app-container flex flex-col gap-4 text-sm text-[var(--muted-foreground)] md:flex-row md:items-center md:justify-between">
            <div>Shortcuts: open quick actions with `Ctrl + K`.</div>
            <div>
              Made with <span className="text-[#ef4444]">&hearts;</span> by Vedik Kothari
            </div>
          </div>
        </footer>

        <nav className="fixed inset-x-4 bottom-4 z-40 rounded-[28px] border border-[var(--panel-border)] bg-[var(--shell-bg)]/95 p-2 shadow-[var(--shadow-strong)] backdrop-blur-2xl lg:hidden">
          <div className="grid grid-cols-4 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentPath === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 rounded-[20px] px-3 py-2 text-[11px] transition-all ${
                    active
                      ? "bg-[var(--surface-brand)] text-[var(--foreground)]"
                      : "text-[var(--muted-foreground)]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
