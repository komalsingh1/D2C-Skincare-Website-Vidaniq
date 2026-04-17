"use client";
import { useEffect } from "react";
import { useSkinProfileStore } from "@/lib/store";

/**
 * Checks localStorage on first render. If the user has never taken the skin
 * quiz (no "vidaniq-first-visit-done" key), it opens the quiz after a short
 * delay so they see the page before the modal appears.
 */
export function FirstVisitProvider() {
  const { profile, setQuizOpen } = useSkinProfileStore();

  useEffect(() => {
    // If they already have a skin profile they've finished the quiz — skip
    if (profile?.completedAt) return;

    const alreadySeen = localStorage.getItem("vidaniq-first-visit-done");
    if (alreadySeen) return;

    // Mark as seen immediately so hot-reloads don't re-trigger
    localStorage.setItem("vidaniq-first-visit-done", "1");

    const timer = setTimeout(() => {
      setQuizOpen(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
