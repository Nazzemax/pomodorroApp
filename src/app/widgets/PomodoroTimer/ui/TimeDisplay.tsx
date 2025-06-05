import React from "react";
import { Mode } from "@/app/entities/timer/model/types";

type Props = { mode: Mode; timeStr: string };

export const TimeDisplay = ({ mode, timeStr }: Props) => (
  <div className="mb-4">
    <span className="text-xl">
      {mode === "work" ? "Work" : mode === "shortBreak" ? "Break" : "Long Break"}
    </span>
    <div className="text-6xl font-mono">{timeStr}</div>
  </div>
);