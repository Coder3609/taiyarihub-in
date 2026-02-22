import { useEffect, useRef, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface ProctoringState {
  tabSwitches: number;
  isFullscreen: boolean;
  warnings: string[];
}

export const useProctoring = (enabled: boolean = true) => {
  const { toast } = useToast();
  const [state, setState] = useState<ProctoringState>({
    tabSwitches: 0,
    isFullscreen: false,
    warnings: [],
  });
  const tabSwitchRef = useRef(0);

  const enterFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
      setState((s) => ({ ...s, isFullscreen: true }));
    } catch {
      // Fullscreen may be blocked
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handleVisibility = () => {
      if (document.hidden) {
        tabSwitchRef.current += 1;
        const count = tabSwitchRef.current;
        setState((s) => ({
          ...s,
          tabSwitches: count,
          warnings: [...s.warnings, `Tab switch detected (#${count})`],
        }));
        toast({
          title: "⚠️ Warning: Tab Switch Detected",
          description: `You have switched tabs ${count} time(s). This activity is being recorded.`,
          variant: "destructive",
        });
      }
    };

    const handleFullscreenChange = () => {
      const isFs = !!document.fullscreenElement;
      setState((s) => ({ ...s, isFullscreen: isFs }));
      if (!isFs) {
        toast({
          title: "⚠️ Fullscreen Exited",
          description: "Please stay in fullscreen mode during the exam.",
          variant: "destructive",
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [enabled, toast]);

  return { ...state, enterFullscreen, exitFullscreen, tabSwitches: state.tabSwitches };
};
