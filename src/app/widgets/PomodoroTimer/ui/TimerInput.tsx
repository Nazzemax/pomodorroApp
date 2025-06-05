import React from "react";
import { Input } from "@/app/shared/ui/input";

type Props = {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  setWorkMinutes: (n: number) => void;
  setShortBreakMinutes: (n: number) => void;
  setLongBreakMinutes: (n: number) => void;
};

export const TimerInput = ({
  workMinutes,
  shortBreakMinutes,
  longBreakMinutes,
  setWorkMinutes,
  setShortBreakMinutes,
  setLongBreakMinutes,
}: Props) => (
  <div className="flex items-center justify-center space-x-4 text-sm">
    <label>
      Work:
      <Input
        type="number"
        min={1}
        className="w-16 ml-1"
        value={workMinutes}
        onChange={(e) => setWorkMinutes(Number(e.target.value))}
      />
      min
    </label>
    <label>
      Short Break:
      <Input
        type="number"
        min={1}
        className="w-16 ml-1"
        value={shortBreakMinutes}
        onChange={(e) => setShortBreakMinutes(Number(e.target.value))}
      />
      min
    </label>
    <label>
      Long Break:
      <Input
        type="number"
        min={1}
        className="w-16 ml-1"
        value={longBreakMinutes}
        onChange={(e) => setLongBreakMinutes(Number(e.target.value))}
      />
      min
    </label>
  </div>
);