"use client";
import React from "react";
import { usePomodoroTimer } from "../model/usePomodoroTimer";
import { TimeDisplay } from "./TimeDisplay";
import { TimerControls } from "./TimerControls";
import { TimerInput } from "./TimerInput";
import { Input } from "@/app//shared/ui/input";
import { BackgroundYouTubePlayer } from "@/app/widgets/BackgroundPlayer/BackgroundYoutubePlayer";

export const PomodoroTimer = () => {
  const ctx = usePomodoroTimer();

  return (
    <div className="max-w-md mx-auto p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Pomodoro Timer</h1>
      <TimeDisplay mode={ctx.mode} timeStr={ctx.timeStr} />
      <TimerControls {...ctx} />
      <TimerInput {...ctx} />
      <div className="my-4 space-y-2 text-sm">
        <label className="block">
          Work YouTube URL:
          <Input type="url" value={ctx.workVideoUrl} onChange={ctx.onChangeWorkUrl} />
        </label>
        <label className="block">
          Break YouTube URL or Playlist:
          <Input type="url" value={ctx.breakVideoUrl} onChange={ctx.onChangeBreakUrl} />
        </label>
      </div>
      <BackgroundYouTubePlayer
        videoUrl={ctx.mode === "work" ? ctx.workVideoUrl : ctx.breakVideoUrl}
        playing={ctx.isRunning}
        audioOnly={true}
        volume={0.4}
      />
    </div>
  );
};