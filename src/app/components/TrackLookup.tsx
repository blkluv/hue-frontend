"use client";

import { AudioPlayerModal } from "./AudioPlayerModal";
import { useState, useEffect } from "react";

interface User {
  id: string;
  walletAddress: string;
  createdAt: string;
}

export interface Track {
  id: string;
  title: string;
  objectId: string;
  blobId: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: string;
  artistId: string;
  onChainObjectId: string;
  createdAt: string;
  artist: User;
}

export default function TrackList() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await fetch("/api/lookup");
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to fetch tracks");
        }

        setTracks(data.tracks);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch tracks");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTracks();
  }, []);

  if (isLoading) {
    return <div className="p-4">Loading tracks...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (tracks.length === 0) {
    return <div className="p-4">No tracks found</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Tracks</h1>
      <div className="grid gap-4">
        {tracks.map((track) => (
          <div
            key={track.id}
            onClick={() => setSelectedTrack(track)}
            className="p-4 border rounded shadow hover:shadow-md transition-shadow cursor-pointer"
          >
            <h2 className="text-xl font-semibold">{track.title}</h2>
            <p className="text-sm text-gray-600">
              Artist: {track.artist.walletAddress}
            </p>
            <p className="text-sm text-gray-600">
              Uploaded: {new Date(track.uploadedAt).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600">
              Sui Object ID: {track.objectId}
            </p>
            <p className="text-sm text-gray-600">
              Walrus Blob ID: {track.blobId}
            </p>
            <p className="text-sm text-gray-600">
              Walrus Object ID: {track.onChainObjectId}
            </p>
          </div>
        ))}
      </div>

      <AudioPlayerModal
        track={selectedTrack}
        onClose={() => setSelectedTrack(null)}
      />
    </div>
  );
}
