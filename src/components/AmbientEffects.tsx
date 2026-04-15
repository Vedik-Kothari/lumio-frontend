"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "./ThemeProvider";

function useViewportCursor() {
  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);
  const x = useSpring(targetX, { stiffness: 120, damping: 22, mass: 0.4 });
  const y = useSpring(targetY, { stiffness: 120, damping: 22, mass: 0.4 });
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const handleMove = (event: MouseEvent) => {
      targetX.set(event.clientX);
      targetY.set(event.clientY);
      setIsMoving(true);
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => setIsMoving(false), 160);
    };

    window.addEventListener("mousemove", handleMove);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (timeout) clearTimeout(timeout);
    };
  }, [targetX, targetY]);

  return { x, y, isMoving };
}

export default function AmbientEffects({ aiActive = false }: { aiActive?: boolean }) {
  const { theme } = useTheme();
  const { x, y, isMoving } = useViewportCursor();
  const [isDesktop, setIsDesktop] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);
  const [hoverTarget, setHoverTarget] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;
    const handleDown = () => setIsPressed(true);
    const handleUp = () => setIsPressed(false);
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [isDesktop]);

  useEffect(() => {
    if (!isDesktop) return;

    const interactiveSelector =
      'button, a, input, textarea, select, [role="button"], [data-hoverable="true"]';

    const handleMove = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const interactive = target?.closest(interactiveSelector) as HTMLElement | null;
      if (!interactive) {
        setIsHoveringInteractive(false);
        setHoverTarget(null);
        return;
      }

      const rect = interactive.getBoundingClientRect();
      setIsHoveringInteractive(true);
      setHoverTarget({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [isDesktop]);

  const orbScale = useTransform(() => {
    if (isPressed) return 0.9;
    if (isHoveringInteractive) return 1.18;
    if (aiActive) return 1.22;
    if (isMoving) return 1.05;
    return 1;
  });

  const orbOpacity = useTransform(() => {
    if (theme === "light") return isHoveringInteractive ? 0.32 : aiActive ? 0.28 : 0.18;
    return isHoveringInteractive ? 0.48 : aiActive ? 0.42 : 0.28;
  });

  const nodes = useMemo(
    () =>
      Array.from({ length: 16 }, (_, index) => ({
        id: index,
        left: `${8 + ((index * 13) % 84)}%`,
        top: `${12 + ((index * 17) % 72)}%`,
        delay: index * 0.15,
      })),
    []
  );

  const auraTargetX = useMotionValue(0);
  const auraTargetY = useMotionValue(0);
  const auraX = useSpring(auraTargetX, { stiffness: 90, damping: 18, mass: 0.5 });
  const auraY = useSpring(auraTargetY, { stiffness: 90, damping: 18, mass: 0.5 });

  useEffect(() => {
    const target = hoverTarget ?? null;
    auraTargetX.set(target?.x ?? 0);
    auraTargetY.set(target?.y ?? 0);
  }, [auraTargetX, auraTargetY, hoverTarget]);

  if (!isDesktop) {
    return null;
  }

  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        style={{
          background:
            theme === "dark"
              ? "radial-gradient(circle at 15% 20%, rgba(34,211,238,0.1), transparent 30%), radial-gradient(circle at 78% 18%, rgba(251,191,36,0.08), transparent 24%), radial-gradient(circle at 50% 80%, rgba(16,185,129,0.08), transparent 28%)"
              : "radial-gradient(circle at 15% 20%, rgba(8,145,178,0.12), transparent 28%), radial-gradient(circle at 78% 18%, rgba(229,159,18,0.1), transparent 24%), radial-gradient(circle at 50% 80%, rgba(15,159,110,0.1), transparent 26%)",
        }}
        animate={{
          backgroundPosition: aiActive ? ["0% 0%", "3% 2%", "0% 0%"] : ["0% 0%", "2% 1%", "0% 0%"],
          scale: aiActive ? [1, 1.025, 1] : [1, 1.012, 1],
        }}
        transition={{ duration: aiActive ? 7 : 11, repeat: Infinity, ease: "easeInOut" }}
      />

      <div aria-hidden className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
        {nodes.map((node) => (
          <motion.div
            key={node.id}
            className="absolute h-1.5 w-1.5 rounded-full bg-[var(--primary)]/35"
            style={{ left: node.left, top: node.top }}
            animate={{
              y: [-8, 6, -8],
              opacity: aiActive ? [0.18, 0.38, 0.18] : [0.12, 0.24, 0.12],
              scale: aiActive ? [1, 1.15, 1] : [0.95, 1.05, 0.95],
            }}
            transition={{ duration: 10 + node.delay * 2, repeat: Infinity, ease: "easeInOut", delay: node.delay }}
          />
        ))}
      </div>

      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[60] hidden h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl lg:block"
        style={{
          x,
          y,
          scale: orbScale,
          opacity: orbOpacity,
          background:
            theme === "dark"
              ? "radial-gradient(circle, rgba(34,211,238,0.52) 0%, rgba(34,211,238,0.16) 28%, rgba(251,191,36,0.1) 52%, transparent 72%)"
              : "radial-gradient(circle, rgba(8,145,178,0.28) 0%, rgba(8,145,178,0.14) 28%, rgba(229,159,18,0.1) 52%, transparent 72%)",
        }}
        animate={aiActive ? { filter: ["blur(48px)", "blur(56px)", "blur(48px)"] } : undefined}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[59] hidden h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full lg:block"
        style={{
          x: auraX,
          y: auraY,
          opacity: isHoveringInteractive ? (theme === "dark" ? 0.18 : 0.14) : 0,
          background:
            theme === "dark"
              ? "radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(34,211,238,0.12) 34%, rgba(16,185,129,0.08) 58%, transparent 78%)"
              : "radial-gradient(circle, rgba(255,255,255,0.65) 0%, rgba(8,145,178,0.1) 38%, rgba(15,159,110,0.08) 60%, transparent 80%)",
          filter: "blur(18px)",
        }}
        animate={{
          scale: isHoveringInteractive ? [1, 1.08, 1] : 1,
        }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
}
