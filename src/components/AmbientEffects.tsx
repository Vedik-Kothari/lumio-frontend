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

  const orbScale = useTransform(() => {
    if (isPressed) return 0.9;
    if (aiActive) return 1.22;
    if (isMoving) return 1.05;
    return 1;
  });

  const orbOpacity = useTransform(() => {
    if (theme === "light") return aiActive ? 0.28 : 0.18;
    return aiActive ? 0.42 : 0.28;
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
              ? "radial-gradient(circle at 15% 20%, rgba(56,189,248,0.09), transparent 30%), radial-gradient(circle at 78% 18%, rgba(249,115,22,0.08), transparent 24%), radial-gradient(circle at 50% 80%, rgba(56,189,248,0.06), transparent 28%)"
              : "radial-gradient(circle at 15% 20%, rgba(59,130,246,0.1), transparent 28%), radial-gradient(circle at 78% 18%, rgba(14,165,233,0.07), transparent 24%), radial-gradient(circle at 50% 80%, rgba(148,163,184,0.08), transparent 26%)",
        }}
        animate={{
          backgroundPosition: aiActive ? ["0% 0%", "3% 2%", "0% 0%"] : ["0% 0%", "2% 1%", "0% 0%"],
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
              ? "radial-gradient(circle, rgba(56,189,248,0.56) 0%, rgba(56,189,248,0.18) 28%, rgba(249,115,22,0.12) 52%, transparent 72%)"
              : "radial-gradient(circle, rgba(59,130,246,0.26) 0%, rgba(59,130,246,0.14) 28%, rgba(148,163,184,0.1) 52%, transparent 72%)",
        }}
        animate={aiActive ? { filter: ["blur(48px)", "blur(56px)", "blur(48px)"] } : undefined}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
}
