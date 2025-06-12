"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTimer } from "react-timer-hook";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import debounce from "lodash.debounce";
import { BackgroundYouTubePlayer } from "../backgroundPlayer/backgroundYoutubePlayer";

type Mode = "work" | "shortBreak" | "longBreak";

const PomodoroTimer: React.FC = () => {
  console.log(">> render PomodoroTimer");
  const [workMinutes, setWorkMinutes] = useState(25);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(5);
  const [longBreakMinutes, setLongBreakMinutes] = useState(15);
  const [mode, setMode] = useState<Mode>("work");
  const [cycleCount, setCycleCount] = useState(0);
  const [voicePlayed, setVoicePlayed] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [workVideoUrl, setWorkVideoUrl] = useState("https://www.youtube.com/watch?v=HuFYqnbVbzY");
  const [breakVideoUrl, setBreakVideoUrl] = useState("https://www.youtube.com/watch?v=g1Ziw1lhzeU");
  const [savedSeconds, setSavedSeconds] = useState<number | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [initialized, setInitialized] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const expiry = (sec: number) => {
    const d = new Date();
    d.setSeconds(d.getSeconds() + sec);
    return d;
  };

  const getYoutubeEmbedUrl = (url: string) => {
    try {
      const p = new URL(url);
      const vid =
        p.hostname === "youtu.be"
          ? p.pathname.slice(1)
          : p.searchParams.get("v");
      const list = p.searchParams.get("list");
      if (list) return `https://www.youtube.com/embed/videoseries?list=${list}&autoplay=1&mute=1&loop=1`;
      if (vid) return `https://www.youtube.com/embed/${vid}?autoplay=1&mute=1&loop=1&playlist=${vid}`;
    } catch (e) {
      console.warn(">> getYoutubeEmbedUrl error", e);
    }
    return "";
  };

  const { seconds, minutes, isRunning, start, pause, restart } = useTimer({
    expiryTimestamp: new Date(),
    autoStart: false,
    onExpire: () => handleExpire(),
  });

  useEffect(() => {
    console.log(">> iframe effect: isRunning:", isRunning, "mode:", mode);
    if (!iframeRef.current) {
      console.warn(">> iframeRef.current is null");
      return;
    }
    if (isRunning) {
      iframeRef.current.src =
        mode === "work"
          ? getYoutubeEmbedUrl(workVideoUrl)
          : getYoutubeEmbedUrl(breakVideoUrl);
    } else {
      iframeRef.current.src = "";
    }
  }, [isRunning, mode, workVideoUrl, breakVideoUrl]);

  useEffect(() => {
    console.log(">> init effect, initialized:", initialized);
    if (!initialized) {
      loadSettings();
      setInitialized(true);
    }
  }, [initialized]);

  const loadSettings = () => {
    console.log(">> loadSettings");
    const s = localStorage.getItem("pomodoroSettings");
    if (!s) {
      console.log(">> no saved settings");
      return;
    }
    try {
      const o = JSON.parse(s);
      console.log(">> parsed settings:", o);
      setWorkMinutes(o.workMinutes ?? 25);
      setShortBreakMinutes(o.shortBreakMinutes ?? 5);
      setLongBreakMinutes(o.longBreakMinutes ?? 15);
      restart(expiry((o.workMinutes ?? 25) * 60), false);
      pause();
      setMode("work");
      setCycleCount(0);
      setVoicePlayed(false);
      setIsFirstLoad(false);
    } catch (e) {
      console.error(">> loadSettings error", e);
    }
  };

  const saveSettings = useCallback(
    debounce((o: { workMinutes: number; shortBreakMinutes: number; longBreakMinutes: number }) => {
      console.log(">> saveSettings:", o);
      localStorage.setItem("pomodoroSettings", JSON.stringify(o));
    }, 500),
    []
  );

  useEffect(() => {
    console.log(">> settings changed: work", workMinutes, "short", shortBreakMinutes, "long", longBreakMinutes);
    saveSettings({ workMinutes, shortBreakMinutes, longBreakMinutes });
    if (!isRunning && !isFirstLoad) {
      const secs =
        mode === "work"
          ? workMinutes * 60
          : mode === "shortBreak"
          ? shortBreakMinutes * 60
          : longBreakMinutes * 60;
      console.log(">> resetting timer on settings change, secs:", secs);
      restart(expiry(secs), false);
    }
  }, [workMinutes, shortBreakMinutes, longBreakMinutes]);

  const playCountdownVoice = () => {
    console.log(">> playCountdownVoice");
    if (!("speechSynthesis" in window)) {
      console.warn(">> speechSynthesis not supported");
      new Audio("/countdown.mp3").play().catch(e => console.error(">> audio fallback error", e));
      return;
    }
    const msg = "10,9,8,7,6,5,4,3,2,1";
    const utterance = new SpeechSynthesisUtterance(msg);
    utterance.lang = "en-US";
    utterance.volume = 1;
    utterance.rate = 1;
    utterance.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    console.log(">> available voices:", voices);
    const enVoice = voices.find(v => v.lang.startsWith("en"));
    if (enVoice) {
      console.log(">> using voice:", enVoice.name);
      utterance.voice = enVoice;
    }
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    console.log(">> countdown check: isRunning", isRunning, "voicePlayed", voicePlayed, "minutes", minutes, "seconds", seconds);
    if (isRunning && !voicePlayed && minutes === 0 && seconds === 10) {
      playCountdownVoice();
      setVoicePlayed(true);
    }
  }, [seconds, minutes, isRunning]);

  const handleExpire = () => {
    console.log(">> handleExpire: mode", mode, "cycleCount", cycleCount);
    setVoicePlayed(false);
    if (mode === "work") {
      const next = cycleCount + 1;
      setCycleCount(next);
      const nm: Mode = next % 4 === 0 ? "longBreak" : "shortBreak";
      console.log(">> switching to", nm);
      setMode(nm);
      const mins = nm === "longBreak" ? longBreakMinutes : shortBreakMinutes;
      restart(expiry(mins * 60), true);
      setIsFirstLoad(false);
    } else {
      if (mode === "longBreak") {
        console.log(">> longBreak ended, resetting cycleCount");
        setCycleCount(0);
      }
      console.log(">> switching to work");
      setMode("work");
      restart(expiry(workMinutes * 60), true);
    }
  };

  useEffect(() => {
    console.log(">> mode-change effect: new mode", mode, "isFirstLoad", isFirstLoad);
    if (isFirstLoad) return;
    const secs =
      mode === "work"
        ? workMinutes * 60
        : mode === "shortBreak"
        ? shortBreakMinutes * 60
        : longBreakMinutes * 60;
    console.log(">> auto-restart on mode change, secs:", secs);
    restart(expiry(secs), true);
  }, [mode]);

  useEffect(() => {
    console.log(">> background beep on mode", mode);
    if (!audioRef.current) audioRef.current = new Audio();
    audioRef.current.volume = 0.5;
    audioRef.current.play().catch(e => console.warn(">> beep play error", e));
  }, [mode]);

  const toggleTimer = () => {
    console.log(">> toggleTimer: isRunning", isRunning, "savedSeconds", savedSeconds);
    if (!initialized) {
      console.warn(">> not initialized, ignoring toggle");
      return;
    }
    if (isRunning) {
      setSavedSeconds(seconds);
      pause();
    } else {
      if (savedSeconds != null) {
        console.log(">> resuming from savedSeconds", savedSeconds);
        restart(expiry(savedSeconds), true);
        setSavedSeconds(null);
      } else {
        console.log(">> starting fresh");
        start();
      }
      const w = iframeRef.current?.contentWindow;
      if (w) {
        console.log(">> sending playVideo postMessage");
        w.postMessage({ event: "command", func: "playVideo", args: "" }, "*");
      }
    }
  };

  const resetTimer = () => {
    console.log(">> resetTimer");
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

  const timeStr = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="max-w-md mx-auto p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Pomodoro Timer</h1>
      <div className="mb-4">
        <span className="text-xl">
          {mode === "work" ? "Work" : mode === "shortBreak" ? "Break" : "Long Break"}
        </span>
        <div className="text-6xl font-mono">{timeStr}</div>
      </div>
      <div className="space-x-2 mb-6">
        <Button onClick={toggleTimer}>{isRunning ? "Pause" : "Start"}</Button>
        <Button variant="outline" onClick={resetTimer}>Reset</Button>
      </div>
      <div className="flex justify-center space-x-4 text-sm mb-6">
        <label>Cycle: <span className="font-bold">{cycleCount}</span></label>
        <label>
          Work:
          <Input type="number" min={1} className="w-16 ml-1" value={workMinutes} onChange={e => setWorkMinutes(+e.target.value)} /> min
        </label>
        <label>
          Short:
          <Input type="number" min={1} className="w-16 ml-1" value={shortBreakMinutes} onChange={e => setShortBreakMinutes(+e.target.value)} /> min
        </label>
        <label>
          Long:
          <Input type="number" min={1} className="w-16 ml-1" value={longBreakMinutes} onChange={e => setLongBreakMinutes(+e.target.value)} /> min
        </label>
      </div>
      <div className="space-y-2 text-sm mb-6">
        <label className="block">
          Work URL:
          <Input type="url" placeholder="https://..." value={workVideoUrl} onChange={e => setWorkVideoUrl(e.target.value)} />
        </label>
        <label className="block">
          Break URL:
          <Input type="url" placeholder="https://..." value={breakVideoUrl} onChange={e => setBreakVideoUrl(e.target.value)} />
        </label>
      </div>
      <iframe ref={iframeRef} style={{ display: "none" }} />
      <BackgroundYouTubePlayer videoUrl={mode === "work" ? workVideoUrl : breakVideoUrl} playing={isRunning} audioOnly volume={0.4} />
    </div>
  );
};

export default PomodoroTimer;
            min={1}
            className="w-16 ml-1"
            value={longBreakMinutes}
            onChange={(e) => setLongBreakMinutes(Number(e.target.value))}
          />
          min
        </label>
      </div>
      <div className="my-4 space-y-2 text-sm">
  <label className="block">
    Work YouTube URL:
    <Input
      type="url"
      placeholder="https://www.youtube.com/watch?v=..."
      value={workVideoUrl}
      onChange={(e) => setWorkVideoUrl(e.target.value)}
    />
  </label>
  <label className="block">
    Break YouTube URL or Playlist:
    <Input
      type="url"
      placeholder="https://www.youtube.com/playlist?list=..."
      value={breakVideoUrl}
      onChange={(e) => setBreakVideoUrl(e.target.value)}
    />
  </label>
</div>

<BackgroundYouTubePlayer
      videoUrl={mode === "work" ? workVideoUrl : breakVideoUrl}
      playing={isRunning}
      audioOnly={true}    
      volume={0.4}
    />

    </div>
  );
};

export default PomodoroTimer;