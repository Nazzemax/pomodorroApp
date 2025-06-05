"use client";
import React, { useEffect, useState } from "react";
import ReactPlayer from "react-player/youtube";

interface BackgroundYouTubePlayerProps {
  videoUrl: string;      // full YouTube URL or short URL
  playing: boolean;      // control playback (tie to your Start/Pause)
  audioOnly?: boolean;   // if true, render only a 1×1 audio player
  volume?: number;       // 0–1
}

export const BackgroundYouTubePlayer: React.FC<BackgroundYouTubePlayerProps> = ({
  videoUrl,
  playing,
  audioOnly = false,
  volume = 0.5,
}) => {

    const [origin, setOrigin] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  // 2) Don't render player until we have a real origin
  if (!origin) {
    return null;
  }

  return (
    <div
      style={{
        position: audioOnly ? "absolute" : "fixed",
        top: 0,
        left: 0,
        width: audioOnly ? 1 : "100vw",
        height: audioOnly ? 1 : "100vh",
        overflow: "hidden",
        zIndex: audioOnly ? -1 : -10,
        opacity: audioOnly ? 0 : 1,
        pointerEvents: "none",
      }}
    >
      <ReactPlayer
        url={videoUrl}
        playing={playing}
        loop={true}
        volume={volume}
        muted={false}
        controls={false}
        width={audioOnly ? 1 : "100%"}
        height={audioOnly ? 1 : "100%"}
        config={{
          playerVars: {
            autoplay: 1,
            loop: 1,
            playlist: ReactPlayer.canPlay(videoUrl)
              ? new URL(videoUrl).searchParams.get("v") || ""
              : "",
            modestbranding: 1,
            disablekb: 1,
            rel: 0,
            enablejsapi: 1,
            origin: window.location.origin,
          },
        }}
      />
    </div>
  );
};
