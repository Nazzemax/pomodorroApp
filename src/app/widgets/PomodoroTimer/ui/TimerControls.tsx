import React from "react";
import { Button } from "@/app/shared/ui/button";

type Props = {
  isRunning: boolean;
  toggleTimer: () => void;
  resetTimer: () => void;
};

export const TimerControls = ({ isRunning, toggleTimer, resetTimer }: Props) => (
  <div className="space-x-2 mb-6">
    <Button variant="default" onClick={toggleTimer}>
      {isRunning ? "Pause" : "Start"}
    </Button>
    <Button variant="outline" onClick={resetTimer}>
      Reset
    </Button>
  </div>
);
