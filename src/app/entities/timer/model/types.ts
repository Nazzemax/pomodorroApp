export type Mode = "work" | "shortBreak" | "longBreak";

export interface PomodoroSettings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
}
