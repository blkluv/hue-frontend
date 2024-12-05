"use client";

import { Track } from "./TrackLookup";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useState, useRef } from "react";

interface AudioPlayerModalProps {
  track: Track | null;
  onClose: () => void;
}

export function AudioPlayerModal({ track, onClose }: AudioPlayerModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [digest, setDigest] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePlay = async () => {
    if (!track) return;

    try {
      if (!audioRef.current) {
        setIsLoading(true);
        // First confirm the stream and get the digest
        const confirmResponse = await fetch("/api/confirm-stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            trackId: track.objectId,
          }),
        });

        if (!confirmResponse.ok) {
          throw new Error("Failed to confirm stream");
        }

        const confirmData = await confirmResponse.json();
        if (!confirmData.success) {
          throw new Error(confirmData.error || "Failed to confirm stream");
        }

        setDigest(confirmData.message);

        // Now fetch and set up the audio
        const response = await fetch(`/api/stream?trackId=${track.objectId}`);

        if (!response.ok) throw new Error("Failed to fetch audio");

        const arrayBuffer = await response.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: track.mimeType });
        const url = URL.createObjectURL(blob);

        audioRef.current = new Audio(url);
        audioRef.current.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(url);
        };

        audioRef.current.ontimeupdate = () => {
          if (audioRef.current) {
            setProgress(
              (audioRef.current.currentTime / audioRef.current.duration) * 100
            );
          }
        };
      }

      if (isPlaying) {
        audioRef.current.pause();
      } else {
        await audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error("Error playing track:", error);
      setError(error instanceof Error ? error.message : "Failed to play track");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const time = percent * audioRef.current.duration;
      audioRef.current.currentTime = time;
      setProgress(percent * 100);
    }
  };

  if (!track) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">{track.title}</h2>
        <div className="space-y-2 mb-6">
          <p className="text-gray-600">Artist: {track.artist.walletAddress}</p>
          <p className="text-gray-600">
            Uploaded: {new Date(track.uploadedAt).toLocaleDateString()}
          </p>
          <p className="text-gray-600">
            File size: {(track.fileSize / 1024 / 1024).toFixed(2)} MB
          </p>
          <p className="text-gray-600">Type: {track.mimeType}</p>
          {digest && (
            <p className="text-gray-600">
              Transaction Digest: <span className="font-mono">{digest}</span>
            </p>
          )}
        </div>

        {error && <div className="text-red-500 mb-4">Error: {error}</div>}

        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePlay}
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                "Loading..."
              ) : isPlaying ? (
                <Pause size={24} />
              ) : (
                <Play size={24} />
              )}
            </button>

            <button
              onClick={toggleMute}
              className="p-2 rounded-full hover:bg-gray-100"
              disabled={!audioRef.current || isLoading}
            >
              {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>

            <div
              className="flex-1 h-2 bg-gray-200 rounded-full cursor-pointer"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
