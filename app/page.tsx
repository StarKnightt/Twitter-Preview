"use client";

import { useState, useRef, useCallback } from "react";
import { toPng } from "html-to-image";
import TweetPreview, { type TweetData } from "./components/TweetPreview";
import {
  XLogo,
  ImageIcon,
  VideoIcon,
  GithubIcon,
  HeartIcon,
  DownloadIcon,
} from "./components/XIcons";

const MAX_CHARS = 280;

function getCharCountColor(count: number): string {
  if (count > MAX_CHARS) return "text-red-500";
  if (count > MAX_CHARS - 20) return "text-yellow-500";
  return "";
}

export default function Home() {
  const [darkMode, setDarkMode] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [tweet, setTweet] = useState<TweetData>({
    displayName: "Your Name",
    handle: "yourhandle",
    avatarUrl: null,
    verified: false,
    text: "",
    mediaUrl: null,
    mediaType: "image",
    timestamp: new Date(),
    replies: 0,
    retweets: 0,
    likes: 0,
    views: 0,
    bookmarks: 0,
  });

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, field: "avatarUrl" | "mediaUrl") => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (field === "mediaUrl") {
        const isVideo = file.type.startsWith("video/");
        const url = URL.createObjectURL(file);
        setTweet((prev) => ({
          ...prev,
          mediaUrl: url,
          mediaType: isVideo ? "video" : "image",
        }));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setTweet((prev) => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    },
    []
  );

  const removeMedia = useCallback(() => {
    setTweet((prev) => {
      if (prev.mediaUrl && prev.mediaType === "video") {
        URL.revokeObjectURL(prev.mediaUrl);
      }
      return { ...prev, mediaUrl: null, mediaType: "image" };
    });
  }, []);

  const handleDownload = useCallback(async () => {
    if (!previewRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(previewRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: darkMode ? "#000000" : "#f7f9f9",
      });
      const link = document.createElement("a");
      link.download = `x-post-preview-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      alert("Failed to export image. Try again.");
    } finally {
      setDownloading(false);
    }
  }, [darkMode]);

  const pageBg = darkMode ? "bg-[#15202b]" : "bg-[#f0f2f5]";
  const panelBg = darkMode ? "bg-[#1e2732]" : "bg-white";
  const inputBg = darkMode
    ? "bg-[#273340] border-[#38444d] text-[#e7e9ea] placeholder-[#71767b]"
    : "bg-white border-[#cfd9de] text-[#0f1419] placeholder-[#536471]";
  const labelColor = darkMode ? "text-[#e7e9ea]" : "text-[#0f1419]";
  const secondaryLabel = darkMode ? "text-[#8b98a5]" : "text-[#536471]";

  const charCount = tweet.text.length;

  return (
    <div className={`min-h-screen ${pageBg} transition-colors duration-200`}>
      {/* Header */}
      <header
        className={`sticky top-0 z-50 backdrop-blur-md ${
          darkMode ? "bg-[#15202b]/80" : "bg-[#f0f2f5]/80"
        } border-b ${darkMode ? "border-[#38444d]" : "border-[#e1e4e8]"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <XLogo className={`w-7 h-7 ${darkMode ? "text-white" : "text-black"}`} />
            <h1 className={`text-lg font-bold ${darkMode ? "text-white" : "text-[#0f1419]"}`}>
              Post Preview
            </h1>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
              darkMode ? "bg-x-blue" : "bg-[#cfd9de]"
            }`}
            aria-label="Toggle dark mode"
            type="button"
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-sm ${
                darkMode ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-8 items-start">
          {/* ───── Editor Panel ───── */}
          <div
            className={`${panelBg} rounded-2xl p-4 sm:p-6 shadow-sm border ${
              darkMode ? "border-[#38444d]" : "border-[#e1e4e8]"
            } transition-colors duration-200 w-full`}
          >
            <h2 className={`text-base font-bold ${labelColor} mb-4 sm:mb-5`}>
              Compose your post
            </h2>

            {/* Profile section */}
            <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-5">
              <button
                onClick={() => avatarInputRef.current?.click()}
                className={`shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-dashed cursor-pointer transition-colors ${
                  darkMode
                    ? "border-[#38444d] hover:border-x-blue"
                    : "border-[#cfd9de] hover:border-x-blue"
                } flex items-center justify-center ${
                  darkMode ? "bg-[#273340]" : "bg-[#f7f9f9]"
                }`}
                type="button"
              >
                {tweet.avatarUrl ? (
                  <img src={tweet.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className={`text-[10px] sm:text-xs ${secondaryLabel} text-center leading-tight`}>
                    Photo
                  </span>
                )}
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, "avatarUrl")}
              />

              <div className="flex-1 grid grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className={`block text-xs font-medium ${secondaryLabel} mb-1`}>
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={tweet.displayName}
                    onChange={(e) =>
                      setTweet((prev) => ({ ...prev, displayName: e.target.value }))
                    }
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${inputBg} focus:border-x-blue focus:ring-1 focus:ring-x-blue/30 outline-none transition-colors`}
                    placeholder="Your Name"
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium ${secondaryLabel} mb-1`}>
                    @Handle
                  </label>
                  <input
                    type="text"
                    value={tweet.handle}
                    onChange={(e) =>
                      setTweet((prev) => ({
                        ...prev,
                        handle: e.target.value.replace(/[^a-zA-Z0-9_]/g, ""),
                      }))
                    }
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${inputBg} focus:border-x-blue focus:ring-1 focus:ring-x-blue/30 outline-none transition-colors`}
                    placeholder="handle"
                  />
                </div>
              </div>
            </div>

            {/* Verified toggle */}
            <label className="flex items-center gap-2 mb-4 sm:mb-5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={tweet.verified}
                onChange={(e) =>
                  setTweet((prev) => ({ ...prev, verified: e.target.checked }))
                }
                className="sr-only peer"
              />
              <div className="relative w-9 h-5 rounded-full bg-[#cfd9de] peer-checked:bg-x-blue transition-colors">
                <div
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${
                    tweet.verified ? "translate-x-4" : ""
                  }`}
                />
              </div>
              <span className={`text-sm ${labelColor}`}>Verified badge</span>
            </label>

            {/* Tweet text — BIGGER textarea */}
            <div className="mb-4">
              <label className={`block text-xs font-medium ${secondaryLabel} mb-1`}>
                Post Content
              </label>
              <textarea
                value={tweet.text}
                onChange={(e) => setTweet((prev) => ({ ...prev, text: e.target.value }))}
                rows={8}
                className={`w-full px-4 py-3 rounded-xl border text-[15px] leading-6 resize-y min-h-[160px] ${inputBg} focus:border-x-blue focus:ring-1 focus:ring-x-blue/30 outline-none transition-colors`}
                placeholder="What is happening?!"
              />
              <div className="flex items-center justify-between mt-1.5">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      if (mediaInputRef.current) {
                        mediaInputRef.current.accept = "image/*,video/mp4,video/webm,video/quicktime";
                        mediaInputRef.current.click();
                      }
                    }}
                    className="p-1.5 rounded-full hover:bg-x-blue/10 text-x-blue transition-colors cursor-pointer"
                    type="button"
                    title="Add image"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      if (mediaInputRef.current) {
                        mediaInputRef.current.accept = "video/mp4,video/webm,video/quicktime";
                        mediaInputRef.current.click();
                      }
                    }}
                    className="p-1.5 rounded-full hover:bg-x-blue/10 text-x-blue transition-colors cursor-pointer"
                    type="button"
                    title="Add video"
                  >
                    <VideoIcon className="w-5 h-5" />
                  </button>
                  <input
                    ref={mediaInputRef}
                    type="file"
                    accept="image/*,video/mp4,video/webm,video/quicktime"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, "mediaUrl")}
                  />
                  {tweet.mediaUrl && (
                    <button
                      onClick={removeMedia}
                      className="text-xs text-red-400 hover:text-red-300 cursor-pointer ml-1"
                      type="button"
                    >
                      Remove {tweet.mediaType}
                    </button>
                  )}
                </div>
                <span
                  className={`text-sm font-medium tabular-nums ${getCharCountColor(charCount)} ${
                    !getCharCountColor(charCount) ? secondaryLabel : ""
                  }`}
                >
                  {charCount}/{MAX_CHARS}
                </span>
              </div>
            </div>

            {/* Media preview thumbnail */}
            {tweet.mediaUrl && (
              <div className="mb-5 relative rounded-xl overflow-hidden">
                {tweet.mediaType === "video" ? (
                  <video
                    src={tweet.mediaUrl}
                    className="w-full max-h-48 object-cover bg-black"
                    muted
                    playsInline
                  />
                ) : (
                  <img src={tweet.mediaUrl} alt="" className="w-full max-h-48 object-cover" />
                )}
                <button
                  onClick={removeMedia}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center text-sm hover:bg-black/90 transition-colors cursor-pointer"
                  type="button"
                >
                  ×
                </button>
                {tweet.mediaType === "video" && (
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-xs">
                    Video
                  </div>
                )}
              </div>
            )}

            {/* Engagement numbers */}
            <div>
              <h3 className={`text-xs font-medium ${secondaryLabel} mb-3 uppercase tracking-wider`}>
                Engagement (optional)
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                {(
                  [
                    ["replies", "Replies"],
                    ["retweets", "Reposts"],
                    ["likes", "Likes"],
                    ["views", "Views"],
                    ["bookmarks", "Bookmarks"],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key}>
                    <label className={`block text-xs ${secondaryLabel} mb-1`}>{label}</label>
                    <input
                      type="number"
                      min={0}
                      value={tweet[key] || ""}
                      onChange={(e) =>
                        setTweet((prev) => ({
                          ...prev,
                          [key]: Math.max(0, parseInt(e.target.value) || 0),
                        }))
                      }
                      className={`w-full px-2 py-1.5 rounded-lg border text-sm ${inputBg} focus:border-x-blue focus:ring-1 focus:ring-x-blue/30 outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ───── Preview Panel ───── */}
          <div className="lg:sticky lg:top-[72px] w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-base font-bold ${labelColor}`}>Live Preview</h2>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                  downloading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:opacity-90 active:scale-95"
                } bg-x-blue text-white`}
                type="button"
              >
                <DownloadIcon className="w-4 h-4" />
                {downloading ? "Exporting..." : "Download as Image"}
              </button>
            </div>
            <div
              ref={previewRef}
              className={`rounded-2xl p-4 sm:p-6 ${
                darkMode ? "bg-black" : "bg-[#f7f9f9]"
              } border ${darkMode ? "border-[#38444d]" : "border-[#e1e4e8]"} transition-colors duration-200`}
            >
              <TweetPreview tweet={tweet} darkMode={darkMode} />
            </div>

            <p className={`mt-4 text-xs sm:text-sm ${secondaryLabel} text-center`}>
              This is an approximate preview. Actual rendering on X may vary slightly.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className={`mt-auto border-t ${
          darkMode ? "border-[#38444d]" : "border-[#e1e4e8]"
        } transition-colors duration-200`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-2.5">
              <XLogo className={`w-5 h-5 ${darkMode ? "text-[#e7e9ea]" : "text-[#0f1419]"}`} />
              <span className={`text-sm font-semibold ${darkMode ? "text-[#e7e9ea]" : "text-[#0f1419]"}`}>
                Post Preview
              </span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                  darkMode ? "bg-x-blue/15 text-x-blue" : "bg-x-blue/10 text-x-blue"
                }`}
              >
                Open Source
              </span>
            </div>

            <div className="flex items-center gap-4 sm:gap-6">
              <a
                href="https://github.com/StarKnightt/Twitter-Preview"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1.5 text-sm ${secondaryLabel} hover:text-x-blue transition-colors`}
              >
                <GithubIcon className="w-4 h-4" />
                GitHub
              </a>
              <a
                href="https://x.com/Star_Knight12"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1.5 text-sm ${secondaryLabel} hover:text-x-blue transition-colors`}
              >
                <XLogo className="w-3.5 h-3.5" />
                Follow us
              </a>
            </div>

            <p className={`flex items-center gap-1 text-sm ${secondaryLabel}`}>
              Made with
              <HeartIcon className="w-3.5 h-3.5 text-x-pink" />
              <span className="sr-only">love</span>
              for the community
            </p>
          </div>

          <div
            className={`mt-5 pt-4 border-t text-center text-xs ${secondaryLabel} ${
              darkMode ? "border-[#38444d]" : "border-[#e1e4e8]"
            }`}
          >
            Not affiliated with X Corp. This tool is for preview purposes only. No data is stored or
            sent to any server.
          </div>
        </div>
      </footer>
    </div>
  );
}
