import { useCallback, useEffect, useRef, useState } from "react";
import { useTimer } from "react-timer-hook";
import { getYoutubeEmbedUrl, playCountdownVoice } from "./helpers";
import { Mode } from "@/app/entities/timer/model/types";
import { useDebounce } from "@/app/shared/lib/debounce";

const expiry = (sec: number) => {
  const d = new Date();
  d.setSeconds(d.getSeconds() + sec);
  return d;
};

export const usePomodoroTimer = () => {
  const [workMinutes, setWorkMinutes] = useState(25);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(5);
  const [longBreakMinutes, setLongBreakMinutes] = useState(15);
  const [mode, setMode] = useState<Mode>("work");
  const [cycleCount, setCycleCount] = useState(0);
  const [voicePlayed, setVoicePlayed] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [workVideoUrl, setWorkVideoUrl] = useState("https://www.youtube.com/watch?v=HuFYqnbVbzY");
  const [breakVideoUrl, setBreakVideoUrl] = useState("https://www.youtube.com/watch?v=g1Ziw1lhzeU");
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  const { seconds, minutes, isRunning, start, pause, restart } = useTimer({
    expiryTimestamp: expiry(25 * 60),
    autoStart: true,
    onExpire: () => handleExpire()
  });

  const debouncedUpdateTimer = useDebounce((duration: number) => {
  if (!isRunning) {
    restart(expiry(duration), false);
  }
}, 400);

const setWork = (n: number) => {
  setWorkMinutes(n);
  if (mode === "work") debouncedUpdateTimer(n * 60);
};

const setShort = (n: number) => {
  setShortBreakMinutes(n);
  if (mode === "shortBreak") debouncedUpdateTimer(n * 60);
};

const setLong = (n: number) => {
  setLongBreakMinutes(n);
  if (mode === "longBreak") debouncedUpdateTimer(n * 60);
};

  useEffect(() => {
    const saved = localStorage.getItem("pomodoroSettings");
      if (!saved) {
      setIsFirstLoad(false);
      return;
  }
    try {
      const s = JSON.parse(saved);
      setWorkMinutes(s.workMinutes ?? 25);
      setShortBreakMinutes(s.shortBreakMinutes ?? 5);
      setLongBreakMinutes(s.longBreakMinutes ?? 15);
      restart(expiry((s.workMinutes ?? 25) * 60), false);
    } catch {}
  }, []);

  // useEffect(() => {
  //   const secs =
  //     mode === "work"
  //       ? workMinutes * 60
  //       : mode === "shortBreak"
  //       ? shortBreakMinutes * 60
  //       : longBreakMinutes * 60;
  //   if (!isRunning && !isFirstLoad) restart(expiry(secs), true);
  // }, [workMinutes, shortBreakMinutes, longBreakMinutes, mode]);

  useEffect(() => {
    if (isRunning && !voicePlayed && seconds === 10 && minutes === 0) {
      playCountdownVoice();
      setVoicePlayed(true);
    }
  }, [seconds, isRunning, mode, voicePlayed]);

const handleExpire = () => {
  console.log("handleExpire called. Current mode:", mode, "cycleCount:", cycleCount);
  setVoicePlayed(false);

  if (mode === "work") {
    const nextCycle = cycleCount + 1;
    setCycleCount(nextCycle);
    const nextMode: Mode = nextCycle % 4 === 0 ? "longBreak" : "shortBreak";
    console.log("Switching to", nextMode);
    setMode(nextMode); // ⛔ don't restart here
  } else {
    if (mode === "longBreak") setCycleCount(0);
    console.log("Switching to work mode");
    setMode("work");
  }
};






  // const handleExpire = () => {
  //   setVoicePlayed(false);
  //   if (mode === "work") {
  //     const nextCycle = cycleCount + 1;
  //     setCycleCount(nextCycle);
  //     const nextMode: Mode = nextCycle % 4 === 0 ? "longBreak" : "shortBreak";
  //     const nextMin = nextMode === "longBreak" ? longBreakMinutes : shortBreakMinutes;
  //     setMode(nextMode);
  //     restart(expiry(nextMin * 60), true);
  //   } else {
  //     if (mode === "longBreak") setCycleCount(0);
  //     setMode("work");
  //     restart(expiry(workMinutes * 60), true);
  //   }
  // };

  const getModeSeconds = () => {
  return mode === "work"
    ? workMinutes * 60
    : mode === "shortBreak"
    ? shortBreakMinutes * 60
    : longBreakMinutes * 60;
};

const toggleTimer = () => {
  if (isRunning) {
    pause();
    setRemainingSeconds(minutes * 60 + seconds);
  } else {
    const resumeTime = remainingSeconds ?? getModeSeconds();
    restart(expiry(resumeTime), true);
    setRemainingSeconds(null);
  }
};

const resetTimer = () => {
  pause();
  setMode("work");
  setCycleCount(0);
  setVoicePlayed(false);
  setRemainingSeconds(null);
  restart(expiry(workMinutes * 60), false);
};

useEffect(() => {
  if (!isFirstLoad && !isRunning) {
    const secs =
      mode === "work"
        ? workMinutes * 60
        : mode === "shortBreak"
        ? shortBreakMinutes * 60
        : longBreakMinutes * 60;

    console.log("Mode changed to:", mode, "→ starting timer with", secs, "seconds");

    restart(expiry(secs), false);
    setTimeout(() => {
      start();
      console.log("Timer started for", mode);
    }, 0);
  }
}, [mode]);



  return {
    isRunning,
    mode,
    cycleCount,
    timeStr: `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
    toggleTimer,
    resetTimer,
    workMinutes,
    shortBreakMinutes,
    longBreakMinutes,
    setWorkMinutes: (n: number) => setWorkMinutes(n),
    setShortBreakMinutes: (n: number) => setShortBreakMinutes(n),
    setLongBreakMinutes: (n: number) => setLongBreakMinutes(n),
    workVideoUrl,
    breakVideoUrl,
    onChangeWorkUrl: (e: React.ChangeEvent<HTMLInputElement>) => setWorkVideoUrl(e.target.value),
    onChangeBreakUrl: (e: React.ChangeEvent<HTMLInputElement>) => setBreakVideoUrl(e.target.value)
  };
};
