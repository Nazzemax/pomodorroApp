import { useCallback, useEffect } from "react";
import { useDebounce } from "@/app/shared/lib/debounce";
import { PomodoroSettings } from "@/app/entities/timer/model/types";

export const useSettingsSync = (
  settings: PomodoroSettings,
  applySettings: (s: PomodoroSettings) => void
) => {
  const saveSettings = useDebounce((s: PomodoroSettings) => {
    localStorage.setItem("pomodoroSettings", JSON.stringify(s));
    console.log("Settings saved", s);
  }, 500);

  useEffect(() => {
    const saved = localStorage.getItem("pomodoroSettings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        applySettings({
          workMinutes: parsed.workMinutes ?? 25,
          shortBreakMinutes: parsed.shortBreakMinutes ?? 5,
          longBreakMinutes: parsed.longBreakMinutes ?? 15,
        });
        console.log("Settings loaded", parsed);
      } catch {
        console.warn("Failed to parse saved settings");
      }
    }
  }, []);

  useEffect(() => {
    saveSettings(settings);
  }, [settings.workMinutes, settings.shortBreakMinutes, settings.longBreakMinutes]);
};
