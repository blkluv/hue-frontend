"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { useState, useRef, ChangeEvent } from "react";

const AudioUpload = () => {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError("");
      setStatus(`File selected: ${file.name}`);
      console.log("File selected:", file);
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file first");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a title for the audio file");
      return;
    }

    try {
      setStatus("Uploading...");
      setError("");
      const formData = new FormData();
      formData.append("audio", selectedFile);
      formData.append("title", title.trim());
      formData.append(
        "artist_address",
        "0xcfab8ce8753127d040f39e21cdbc4df7894021964cca9f9921f8f4f3519f4b61"
      );

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      console.log("JSON Response: ", data);
      setStatus("Upload successful!");
      setTitle("");
      setSelectedFile(null);

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload audio file");
    }
  };

  return (
    <Card className="w-full max-w-md border border-gray-200 bg-white">
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Enter audio title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-gray-300 focus:border-black focus:ring-black"
          />

          <div className="flex flex-col items-center gap-4">
            <div className="w-full">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full border-2 border-black hover:bg-black hover:text-white transition-colors"
                onClick={handleFileButtonClick}
              >
                <Upload className="h-4 w-4 mr-2" />
                Select Audio File
              </Button>
            </div>

            <Button
              onClick={handleUpload}
              disabled={!selectedFile || !title.trim()}
              className="w-full bg-black text-white hover:bg-gray-800 disabled:bg-gray-300"
            >
              Upload Track
            </Button>
          </div>
        </div>

        {selectedFile && (
          <Alert className="bg-gray-50">
            <AlertTitle>Selected File</AlertTitle>
            <AlertDescription>
              {selectedFile.name} (
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </AlertDescription>
          </Alert>
        )}

        {status && !error && (
          <Alert>
            <AlertTitle>Status</AlertTitle>
            <AlertDescription>{status}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default AudioUpload;
