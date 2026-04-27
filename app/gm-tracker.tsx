"use client";

import { useEffect, useState, useCallback } from "react";
import { useMiniKit, useComposeCast } from "@coinbase/onchainkit/minikit";

// ─── Types ───────────────────────────────────────────────────────────────────
/** Shape of the streak data stored in localStorage */
type StreakData = {
  /** Current consecutive day count */
  count: number;
  /** ISO date string (YYYY-MM-DD) of the last GM */
  lastGmDate: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const STORAGE_KEY = "gm-streak-data";

/** Get today's date as YYYY-MM-DD in the user's local timezone */
function todayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

/** Load streak data from localStorage (returns null if nothing stored) */
function loadStreak(): StreakData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StreakData;
  } catch {
    return null;
  }
}

/** Save streak data to localStorage */
function saveStreak(data: StreakData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** Determine if yesterday's date matches `dateStr` (for streak continuity) */
function isYesterday(dateStr: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split("T")[0] === dateStr;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function GmTracker() {
  // --- MiniKit hooks ---
  const { setMiniAppReady, isMiniAppReady, context } = useMiniKit();
  const { composeCast } = useComposeCast();

  // --- Local state ---
  const [streak, setStreak] = useState<number>(0);
  const [saidGmToday, setSaidGmToday] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);

  // --- 1. Tell the host app we're ready (hides splash screen) ---
  useEffect(() => {
    if (!isMiniAppReady) {
      setMiniAppReady();
    }
  }, [isMiniAppReady, setMiniAppReady]);

  // --- 2. Load streak from localStorage on mount ---
  useEffect(() => {
    const saved = loadStreak();
    const today = todayDateString();

    if (saved) {
      if (saved.lastGmDate === today) {
        // Already said GM today
        setStreak(saved.count);
        setSaidGmToday(true);
      } else if (isYesterday(saved.lastGmDate)) {
        // Streak is still alive (they said GM yesterday)
        setStreak(saved.count);
      } else {
        // Streak broken — reset to 0
        setStreak(0);
      }
    }
    setLoaded(true);
  }, []);

  // --- 3. Handle "Say GM" button press ---
  const handleSayGm = useCallback(() => {
    const today = todayDateString();
    const saved = loadStreak();

    let newCount = 1;
    if (saved && (saved.lastGmDate === today || isYesterday(saved.lastGmDate))) {
      newCount = saved.lastGmDate === today ? saved.count : saved.count + 1;
    }

    saveStreak({ count: newCount, lastGmDate: today });
    setStreak(newCount);
    setSaidGmToday(true);
  }, []);

  // --- 4. Handle "Share on Farcaster" button ---
  const handleShare = useCallback(() => {
    const text = `GM! 🌞 Day ${streak} streak on GM Streak Tracker mini app!`;
    composeCast({ text });
  }, [streak, composeCast]);

  // --- User info from Farcaster context ---
  const user = context?.user;
  const displayName = user?.displayName ?? "GM Friend";
  const pfpUrl = user?.pfpUrl;

  // --- Don't render until localStorage is loaded ---
  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <p className="text-white/60 text-lg animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] p-4">
      <div className="w-full max-w-[390px] flex flex-col items-center gap-6 py-8 px-5">

        {/* ── User Profile Section ─────────────────────────────────── */}
        <div className="flex flex-col items-center gap-2">
          {pfpUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={pfpUrl}
              alt={displayName}
              className="w-20 h-20 rounded-full border-2 border-yellow-400 object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-3xl">
              🌞
            </div>
          )}
          <p className="text-white text-lg font-semibold">{displayName}</p>
          {user?.fid && (
            <p className="text-white/40 text-xs">FID: {user.fid}</p>
          )}
        </div>

        {/* ── Streak Counter ───────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-1 mt-2">
          <span className="text-[64px] font-extrabold leading-none text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-orange-500">
            {streak}
          </span>
          <p className="text-white/60 text-sm">
            {streak === 0
              ? "Start your GM streak!"
              : streak === 1
              ? "day GM streak 🔥"
              : `days GM streak 🔥`}
          </p>
        </div>

        {/* ── Say GM Button ────────────────────────────────────────── */}
        {saidGmToday ? (
          <div className="w-full text-center py-4 px-6 rounded-xl bg-green-900/40 border border-green-500/30">
            <p className="text-green-400 text-lg font-semibold">
              ✅ GM sent! See you tomorrow
            </p>
          </div>
        ) : (
          <button
            onClick={handleSayGm}
            className="w-full py-4 px-6 rounded-xl text-lg font-bold text-white
              bg-gradient-to-r from-yellow-400 to-orange-500
              hover:from-yellow-500 hover:to-orange-600
              active:scale-[0.98] transition-all duration-150
              shadow-lg shadow-orange-500/20"
          >
            Say GM 🌞
          </button>
        )}

        {/* ── Leaderboard / Stats Section ──────────────────────────── */}
        <div className="w-full rounded-xl bg-white/5 border border-white/10 p-4 mt-2">
          <h2 className="text-white/80 text-sm font-semibold mb-2 uppercase tracking-wider">
            Your Stats
          </h2>
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-sm">Current streak</span>
            <span className="text-yellow-400 font-bold">
              {streak} {streak === 1 ? "day" : "days"}
            </span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-white/60 text-sm">Status</span>
            <span className={`font-bold text-sm ${saidGmToday ? "text-green-400" : "text-orange-400"}`}>
              {saidGmToday ? "GM'd today ✅" : "Waiting for GM..."}
            </span>
          </div>
          <p className="text-white/30 text-xs mt-3 text-center">
            {streak > 0
              ? `You've said GM ${streak} ${streak === 1 ? "day" : "days"} in a row!`
              : "Tap the button above to start your streak!"}
          </p>
        </div>

        {/* ── Share on Farcaster Button ─────────────────────────────── */}
        <button
          onClick={handleShare}
          disabled={streak === 0}
          className="w-full py-3 px-6 rounded-xl text-base font-semibold text-white
            bg-gradient-to-r from-purple-500 to-indigo-600
            hover:from-purple-600 hover:to-indigo-700
            active:scale-[0.98] transition-all duration-150
            disabled:opacity-40 disabled:cursor-not-allowed
            shadow-lg shadow-purple-500/20"
        >
          Share on Farcaster 💜
        </button>

        {/* ── Footer ───────────────────────────────────────────────── */}
        <p className="text-white/20 text-xs mt-4">
          GM Streak Tracker — a Farcaster Mini App
        </p>
      </div>
    </div>
  );
}
