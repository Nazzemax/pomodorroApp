export const getYoutubeEmbedUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    const isPlaylist = parsed.pathname.includes("/playlist");
    const listId = parsed.searchParams.get("list");
    const videoId = parsed.hostname === "youtu.be"
      ? parsed.pathname.slice(1)
      : parsed.searchParams.get("v");

    if (isPlaylist && listId) {
      return `https://www.youtube.com/embed/videoseries?list=${listId}&autoplay=1&mute=1&loop=1`;
    }
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`;
    }
    return "";
  } catch {
    return "";
  }
};

export const playCountdownVoice = async () => {
  const msg = "10,9,8,7,6,5,4,3,2,1";
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(msg);
    window.speechSynthesis.speak(utterance);
  } else {
    const audio = new Audio("/countdown.mp3");
    await audio.play();
  }
};