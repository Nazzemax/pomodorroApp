"use client";
import React, { useEffect, useRef, useState } from "react";
import { useTimer } from "react-timer-hook";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Mode = "work" | "shortBreak" | "longBreak";

const PomodoroTimer: React.FC = () => {
  const [workMinutes, setWorkMinutes] = useState<number>(25);
  const [shortBreakMinutes, setShortBreakMinutes] = useState<number>(5);
  const [longBreakMinutes, setLongBreakMinutes] = useState<number>(15);
  const [mode, setMode] = useState<Mode>("work");
  const [cycleCount, setCycleCount] = useState<number>(0);
  const [voicePlayed, setVoicePlayed] = useState<boolean>(false);
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const expiry = (sec: number) => {
    const d = new Date();
    d.setSeconds(d.getSeconds() + sec);
    return d;
  };

  const { seconds, minutes, isRunning, start, pause, restart } = useTimer({
    expiryTimestamp: expiry(25 * 60),
    autoStart: false,
    onExpire: () => handleExpire(),
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const saved = localStorage.getItem("pomodoroSettings");
        if (!saved) return;
        const s = JSON.parse(saved);
        setWorkMinutes(s.workMinutes ?? 25);
        setShortBreakMinutes(s.shortBreakMinutes ?? 5);
        setLongBreakMinutes(s.longBreakMinutes ?? 15);
        console.log("Loaded saved settings", s);
        restart(expiry((s.workMinutes ?? 25) * 60), false);
        setMode("work");
        setCycleCount(0);
        setVoicePlayed(false);
        setIsFirstLoad(false);
      } catch {
        console.log("Failed to parse saved settings");
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    const saveSettings = async () => {
      const s = { workMinutes, shortBreakMinutes, longBreakMinutes };
      localStorage.setItem("pomodoroSettings", JSON.stringify(s));
      console.log("Saved settings", s);
    };
    saveSettings();
  }, [workMinutes, shortBreakMinutes, longBreakMinutes]);

  useEffect(() => {
    if (!isRunning && !isFirstLoad) {
      const secs =
        mode === "work"
          ? workMinutes * 60
          : mode === "shortBreak"
          ? shortBreakMinutes * 60
          : longBreakMinutes * 60;
      console.log("Restarting timer with duration (sec):", secs, "for mode:", mode);
      restart(expiry(secs), true);
    }
  }, [workMinutes, shortBreakMinutes, longBreakMinutes, mode]);

  useEffect(() => {
    console.log("seconds:", seconds, "isRunning:", isRunning, "voicePlayed:", voicePlayed, "mode:", mode);
    if (isRunning && !voicePlayed && seconds === 10) {
      playCountdownVoice();
      setVoicePlayed(true);
    }

  }, [seconds, isRunning, mode, voicePlayed]);

  const handleExpire = async () => {
    console.log("handleExpire called. Current mode:", mode, "cycleCount:", cycleCount);
    setVoicePlayed(false);

    if (mode === "work") {
      const nextCycle = cycleCount + 1;
      setCycleCount(nextCycle);

      const nextMode: Mode = nextCycle % 4 === 0 ? "longBreak" : "shortBreak";
      const nextMinutes =
        nextMode === "longBreak" ? longBreakMinutes : shortBreakMinutes;

      console.log("Switching to", nextMode, "for", nextMinutes, "minutes");
      setMode(nextMode);
      restart(expiry(nextMinutes * 60), true);
      setIsFirstLoad(false);
    } else {
      if (mode === "longBreak") setCycleCount(0);
      console.log("Switching to work mode for", workMinutes, "minutes");
      setMode("work");
      restart(expiry(workMinutes * 60), true);
    }
  };

  const playCountdownVoice = async () => {
    console.log("Voice countdown triggered");
    const msg = "10,9,8,7,6,5,4,3,2,1";
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(msg);
      window.speechSynthesis.speak(utterance);
    } else {
      const audio = new Audio("/countdown.mp3");
      await audio.play();
    }
  };

  useEffect(() => {
    const playAudio = async () => {
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.volume = 0.5;
      }
      try {
        await audioRef.current.play();
      } catch {
        // silent
      }
    };
    playAudio();
  }, [mode]);

  const toggleTimer = () => {
    console.log(isRunning ? "Timer paused" : "Timer started");
    isRunning ? pause() : start();
  };

  const resetTimer = () => {
    console.log("Timer reset");
    pause();
    setMode("work");
    setCycleCount(0);
    setVoicePlayed(false);
    restart(expiry(workMinutes * 60), false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const timeStr = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;

  return (
    <div className="max-w-md mx-auto p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Pomodoro Timer</h1>

      <div className="mb-4">
        <span className="text-xl">
          {mode === "work"
            ? "Work"
            : mode === "shortBreak"
            ? "Break"
            : "Long Break"}
        </span>
        <div className="text-6xl font-mono">{timeStr}</div>
      </div>

      <div className="space-x-2 mb-6">
        <Button variant="default" onClick={toggleTimer}>
          {isRunning ? "Pause" : "Start"}
        </Button>
        <Button variant="outline" onClick={resetTimer}>
          Reset
        </Button>
      </div>

      <div className="flex items-center justify-center space-x-4 text-sm">
        <label>
          Cycle Count:
          <span className="font-bold ml-1">{cycleCount}</span>
        </label>
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
          Short Break:
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
          Long Break:
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
    </div>
  );
};

export default PomodoroTimer;