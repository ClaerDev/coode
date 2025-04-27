"use client";

import Youtube from "react-youtube";

export function YoutubeVideoPlayer({
  videoId,
  onFinishedVideo,
}: {
  videoId: string;
  onFinishedVideo?: () => void;
}) {
  return (
    <Youtube
      videoId={videoId}
      className="w-full h-full"
      opts={{ width: "100%", height: "100%" }}
      onEnd={onFinishedVideo}
    />
  );
}
