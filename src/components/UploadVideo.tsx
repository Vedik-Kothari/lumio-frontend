"use client";

import { useState, useRef } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, FileVideo, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : "An error occurred during processing.";

export default function UploadVideo() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const handleFileChange = (selectedFile: File) => {
    if (!selectedFile.type.startsWith("video/")) {
      setErrorMessage("Please upload a valid video file.");
      setUploadStatus("error");
      return;
    }
    setFile(selectedFile);
    setUploadStatus("idle");
    setErrorMessage("");
  };

  const uploadFile = async () => {
    if (!file) return;

    setUploadStatus("uploading");
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Setup backend API call
      setUploadStatus("processing");
      const response = await fetch("http://localhost:8000/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to process video: ${response.statusText}`);
      }
      
      setUploadStatus("success");
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error));
      setUploadStatus("error");
    }
  };

  return (
    <div className="bg-card w-full rounded-2xl border border-border shadow-xl overflow-hidden backdrop-blur-sm relative">
      <div className="px-6 py-8">
        <h2 className="text-xl font-bold mb-1 text-card-foreground">Upload Knowledge</h2>
        <p className="text-sm text-muted-foreground mb-6">Drag & drop your video or presentation to extract insights.</p>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
              isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-card/80"
            } ${file ? "border-primary/30 bg-card" : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => {
              if (uploadStatus !== "processing" && uploadStatus !== "uploading") {
                fileInputRef.current?.click();
              }
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleChange}
              className="hidden"
              disabled={uploadStatus === "processing" || uploadStatus === "uploading"}
            />

            <AnimatePresence mode="wait">
              {!file ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center justify-center space-y-3"
                >
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-2 text-primary">
                    <UploadCloud size={28} />
                  </div>
                  <p className="font-medium text-sm text-card-foreground">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground">MP4, WebM or OGG (max. 100MB)</p>
                </motion.div>
              ) : (
                <motion.div
                  key="file"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center space-y-4"
                >
                  <div className="flex items-center space-x-3 bg-secondary/80 px-4 py-3 rounded-lg w-full max-w-xs shadow-inner">
                    <FileVideo className="text-primary shrink-0" size={24} />
                    <div className="text-left w-full overflow-hidden text-sm truncate">
                      <span className="font-semibold text-card-foreground truncate block">{file.name}</span>
                      <span className="text-muted-foreground text-xs block">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="sync">
            {uploadStatus === "error" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center space-x-2 text-destructive text-sm bg-destructive/10 px-4 py-3 rounded-lg"
              >
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {uploadStatus === "success" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center space-x-2 text-emerald-500 text-sm bg-emerald-500/10 px-4 py-3 rounded-lg border border-emerald-500/20"
              >
                <CheckCircle2 size={16} />
                <span>Video processed and indexed successfully!</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="button"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-4 rounded-lg shadow-lg shadow-primary/25 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center h-12"
            onClick={uploadFile}
            disabled={!file || uploadStatus === "uploading" || uploadStatus === "processing"}
          >
            {uploadStatus === "uploading" ? (
               <><Loader2 className="animate-spin mr-2" size={18} /> Uploading...</>
            ) : uploadStatus === "processing" ? (
               <><Loader2 className="animate-spin mr-2" size={18} /> Extracting AI Insights...</>
            ) : uploadStatus === "success" ? (
               "Upload Another File" 
            ) : (
               "Process Video"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
