"use client";

import { useState, useRef, useCallback, useEffect, type MutableRefObject } from "react";
import { toPng } from "html-to-image";
import TweetPreview, { type TweetData, type DeviceView } from "./components/TweetPreview";
import ThemeSelector from "./components/ThemeSelector";
import {
  XLogo,
  ImageIcon,
  VideoIcon,
  GithubIcon,
  HeartIcon,
  DownloadIcon,
  CopyIcon,
  CheckIcon,
  MobileIcon,
  TabletIcon,
  DesktopIcon,
  PaletteIcon,
} from "./components/XIcons";

const FREE_CHARS = 280;
const PREMIUM_CHARS = 25000;
const STORAGE_KEY = "x-post-preview-draft";
const DARK_MODE_KEY = "x-post-preview-dark";

interface SavedDraft {
  displayName: string;
  handle: string;
  avatarUrl: string | null;
  verified: boolean;
  text: string;
  replies: number;
  retweets: number;
  likes: number;
  views: number;
  bookmarks: number;
}

const DEFAULT_TWEET: TweetData = {
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
};

function saveDraft(tweet: TweetData) {
  try {
    const draft: SavedDraft = {
      displayName: tweet.displayName,
      handle: tweet.handle,
      avatarUrl: tweet.avatarUrl,
      verified: tweet.verified,
      text: tweet.text,
      replies: tweet.replies,
      retweets: tweet.retweets,
      likes: tweet.likes,
      views: tweet.views,
      bookmarks: tweet.bookmarks,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {}
}

function getCharCountColor(count: number, limit: number): string {
  if (count > limit) return "text-red-500";
  if (count > limit - 20) return "text-yellow-500";
  return "";
}

export default function Home() {
  const [darkMode, setDarkMode] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tweet, setTweet] = useState<TweetData>(DEFAULT_TWEET);
  const [background, setBackground] = useState<string | null>(null);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const restoredRef: MutableRefObject<boolean> = useRef(false);

  // Restore from localStorage once on mount (after hydration)
  useEffect(() => {
    try {
      const val = localStorage.getItem(DARK_MODE_KEY);
      if (val !== null) setDarkMode(val === "true");
    } catch {}
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as SavedDraft;
        setTweet((prev) => ({ ...prev, ...saved, timestamp: new Date() }));
      }
    } catch {}
    restoredRef.current = true;
  }, []);

  // Auto-save draft on every change (debounced, only after restore)
  useEffect(() => {
    if (!restoredRef.current) return;
    const timer = setTimeout(() => saveDraft(tweet), 400);
    return () => clearTimeout(timer);
  }, [tweet]);

  
  useEffect(() => {
    if (!restoredRef.current) return;
    try { localStorage.setItem(DARK_MODE_KEY, String(darkMode)); } catch {}
  }, [darkMode]);

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

  const [premium, setPremium] = useState(false);
  const [deviceView, setDeviceView] = useState<DeviceView>("desktop");
  const charLimit = premium ? PREMIUM_CHARS : FREE_CHARS;
  const charCount = tweet.text.length;

  const handleDownload = useCallback(async () => {
    if (!previewRef.current) return;
    setDownloading(true);
    const el = previewRef.current;
    const saved = {
      border: el.style.border,
      borderRadius: el.style.borderRadius,
      padding: el.style.padding,
      backgroundColor: el.style.backgroundColor,
      boxShadow: el.style.boxShadow,
      backgroundImage: el.style.backgroundImage,
    };
    try {
      const isMobileView = deviceView === "mobile";

      if (isMobileView) {
        el.style.padding = "16px 12px";
        el.style.borderRadius = "20px";
        el.style.border = darkMode ? "1px solid #2f3336" : "1px solid #e1e4e8";
        el.style.boxShadow = "0 4px 24px rgba(0,0,0,0.12)";
      }

      const useThemeBg = background && !isMobileView;

      if (useThemeBg) {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            canvas.getContext("2d")!.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/png"));
          };
          img.onerror = reject;
          img.src = background;
        });
        el.style.backgroundImage = `url(${dataUrl})`;
      } else {
        const fallback = isMobileView
          ? (darkMode ? "#000000" : "#ffffff")
          : (darkMode ? "#1e2732" : "#f7f9f9");
        el.style.backgroundColor = fallback;
      }

      const png = await toPng(el, {
        pixelRatio: 3,
        cacheBust: true,
        backgroundColor: useThemeBg ? "transparent" : (darkMode ? "#15202b" : "#f0f2f5"),
      });

      const link = document.createElement("a");
      link.download = `x-post-preview-${Date.now()}.png`;
      link.href = png;
      link.click();
    } catch {
      alert("Failed to export image. Try again.");
    } finally {
      el.style.border = saved.border;
      el.style.borderRadius = saved.borderRadius;
      el.style.padding = saved.padding;
      el.style.backgroundColor = saved.backgroundColor;
      el.style.boxShadow = saved.boxShadow;
      el.style.backgroundImage = saved.backgroundImage;
      setDownloading(false);
    }
  }, [background, darkMode, deviceView]);

  const handleCopy = useCallback(async () => {
    if (!previewRef.current) return;
    setCopied(false);
    const el = previewRef.current;
    const saved = {
      border: el.style.border,
      borderRadius: el.style.borderRadius,
      padding: el.style.padding,
      backgroundColor: el.style.backgroundColor,
      boxShadow: el.style.boxShadow,
      backgroundImage: el.style.backgroundImage,
    };
    try {
      const isMobileView = deviceView === "mobile";

      if (isMobileView) {
        el.style.padding = "16px 12px";
        el.style.borderRadius = "20px";
        el.style.border = darkMode ? "1px solid #2f3336" : "1px solid #e1e4e8";
        el.style.boxShadow = "0 4px 24px rgba(0,0,0,0.12)";
      }

      const useThemeBg = background && !isMobileView;

      if (useThemeBg) {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            const c = document.createElement("canvas");
            c.width = img.naturalWidth;
            c.height = img.naturalHeight;
            c.getContext("2d")!.drawImage(img, 0, 0);
            resolve(c.toDataURL("image/png"));
          };
          img.onerror = reject;
          img.src = background;
        });
        el.style.backgroundImage = `url(${dataUrl})`;
      } else {
        const fallback = isMobileView
          ? (darkMode ? "#000000" : "#ffffff")
          : (darkMode ? "#1e2732" : "#f7f9f9");
        el.style.backgroundColor = fallback;
      }

      const dataUrl = await toPng(el, {
        pixelRatio: 3,
        cacheBust: true,
        backgroundColor: useThemeBg ? "transparent" : (darkMode ? "#15202b" : "#f0f2f5"),
      });

      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Failed to copy. Your browser may not support clipboard image copy.");
    } finally {
      el.style.border = saved.border;
      el.style.borderRadius = saved.borderRadius;
      el.style.padding = saved.padding;
      el.style.backgroundColor = saved.backgroundColor;
      el.style.boxShadow = saved.boxShadow;
      el.style.backgroundImage = saved.backgroundImage;
    }
  }, [background, darkMode, deviceView]);

  const pageBg = darkMode ? "bg-[#15202b]" : "bg-[#f0f2f5]";
  const panelBg = darkMode ? "bg-[#1e2732]" : "bg-white";
  const inputBg = darkMode
    ? "bg-[#273340] border-[#38444d] text-[#e7e9ea] placeholder-[#71767b]"
    : "bg-white border-[#cfd9de] text-[#0f1419] placeholder-[#536471]";
  const labelColor = darkMode ? "text-[#e7e9ea]" : "text-[#0f1419]";
  const secondaryLabel = darkMode ? "text-[#8b98a5]" : "text-[#536471]";

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
          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href="https://github.com/StarKnightt/Twitter-Preview"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1.5 text-sm ${secondaryLabel} hover:text-x-blue transition-colors`}
              aria-label="GitHub"
            >
              <GithubIcon className="w-5 h-5" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <a
              href="https://x.com/Star_Knight12"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1.5 text-sm ${secondaryLabel} hover:text-x-blue transition-colors`}
              aria-label="Follow on X"
            >
              <XLogo className="w-4 h-4" />
              <span className="hidden sm:inline">Follow</span>
            </a>
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

            {/* Toggles */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-4 sm:mb-5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
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
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={premium}
                  onChange={(e) => setPremium(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-9 h-5 rounded-full bg-[#cfd9de] peer-checked:bg-x-blue transition-colors">
                  <div
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${
                      premium ? "translate-x-4" : ""
                    }`}
                  />
                </div>
                <span className={`text-sm ${labelColor}`}>Premium (25K chars)</span>
              </label>
            </div>

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
                  className={`text-sm font-medium tabular-nums ${getCharCountColor(charCount, charLimit)} ${
                    !getCharCountColor(charCount, charLimit) ? secondaryLabel : ""
                  }`}
                >
                  {charCount.toLocaleString()}/{charLimit.toLocaleString()}
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
            {/* Header row */}
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <h2 className={`text-base font-bold ${labelColor}`}>Live Preview</h2>
              <div className="flex items-center gap-2">
                {/* Device switcher */}
                <div
                  className={`flex items-center rounded-lg border ${
                    darkMode ? "border-[#38444d] bg-[#1e2732]" : "border-[#e1e4e8] bg-white"
                  } p-0.5`}
                >
                  {(
                    [
                      { key: "mobile" as DeviceView, icon: MobileIcon, label: "Mobile" },
                      { key: "tablet" as DeviceView, icon: TabletIcon, label: "Tablet" },
                      { key: "desktop" as DeviceView, icon: DesktopIcon, label: "Desktop" },
                    ] as const
                  ).map(({ key, icon: Icon, label }) => {
                    const isActive = deviceView === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setDeviceView(key)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                          isActive
                            ? "bg-x-blue text-white shadow-sm"
                            : darkMode
                              ? "text-[#8b98a5] hover:bg-[#273340]"
                              : "text-[#536471] hover:bg-[#f0f2f5]"
                        }`}
                        type="button"
                        title={label}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{label}</span>
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setShowThemeSelector(true)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-medium text-xs transition-all cursor-pointer ${
                    darkMode
                      ? "bg-[#1e2732] border-[#38444d] text-[#e7e9ea] hover:bg-[#273340]"
                      : "bg-white border-[#e1e4e8] text-[#0f1419] hover:bg-[#f0f2f5]"
                  }`}
                  type="button"
                >
                  <PaletteIcon className="w-4 h-4 text-x-blue" />
                  <span className="hidden sm:inline">Theme</span>
                </button>
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                    copied
                      ? "bg-x-green text-white"
                      : "hover:opacity-90 active:scale-95 bg-x-blue text-white"
                  }`}
                  type="button"
                >
                  {copied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                  <span className="hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
                </button>
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                    downloading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:opacity-90 active:scale-95"
                  } bg-x-blue text-white`}
                  type="button"
                >
                  <DownloadIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">{downloading ? "Exporting..." : "Download"}</span>
                </button>
              </div>
            </div>

            {/* Preview frame */}
            <div className="flex justify-center">
              <div
                className={`transition-all duration-300 ${
                  deviceView === "mobile"
                    ? `rounded-4xl overflow-hidden border-[3px] ${
                        darkMode ? "border-[#38444d] bg-black" : "border-[#d1d5db] bg-white"
                      } shadow-lg`
                    : ""
                }`}
                style={{
                  width: deviceView === "mobile" ? "375px" : deviceView === "tablet" ? "540px" : "100%",
                  maxWidth: "100%",
                }}
              >
                <div
                  ref={previewRef}
                  className={`${
                    deviceView === "mobile"
                      ? ""
                      : `rounded-2xl p-6 sm:p-10 border transition-all duration-300 ${
                          darkMode ? "border-[#38444d]" : "border-[#e1e4e8]"
                        }`
                  }`}
                  style={{
                    backgroundColor: deviceView === "mobile"
                      ? (darkMode ? "#000" : "#fff")
                      : (!background ? (darkMode ? "#1e2732" : "#f7f9f9") : undefined),
                    backgroundImage: deviceView !== "mobile" && background ? `url(${background})` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <TweetPreview 
                    tweet={tweet} 
                    darkMode={darkMode} 
                    device={deviceView} 
                  />
                </div>
                {deviceView === "mobile" && (
                  <div className={`h-6 flex items-center justify-center ${darkMode ? "bg-black" : "bg-white"}`}>
                    <div className={`w-28 h-1 rounded-full ${darkMode ? "bg-[#555]" : "bg-[#d1d5db]"}`} />
                  </div>
                )}
              </div>
            </div>

            <p className={`mt-4 text-xs sm:text-sm ${secondaryLabel} text-center`}>
              {deviceView === "mobile"
                ? "Mobile view (375px) · Themes are available on tablet & desktop views"
                : deviceView === "tablet"
                  ? "Tablet view (540px)"
                  : "Desktop view (full width)"}
              {deviceView !== "mobile" && <>{" · "}Actual rendering on X may vary slightly.</>}
            </p>
          </div>
        </div>

        {showThemeSelector && (
          <ThemeSelector
            darkMode={darkMode}
            currentTheme={background}
            onSelect={setBackground}
            onClose={() => setShowThemeSelector(false)}
          />
        )}
      </main>

      {/* Footer */}
      <footer
        className={`mt-auto border-t ${
          darkMode ? "border-[#38444d]" : "border-[#e1e4e8]"
        } transition-colors duration-200`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
            <p className={`flex items-center gap-1 text-sm ${secondaryLabel}`}>
              Made with
              <HeartIcon className="w-3.5 h-3.5 text-x-pink" />
              <span className="sr-only">love</span>
              by
              <a
                href="https://x.com/Star_Knight12"
                target="_blank"
                rel="noopener noreferrer"
                className="text-x-blue hover:underline"
              >
                @Star_Knight12
              </a>
            </p>
            <span className={`hidden sm:inline ${secondaryLabel}`}>·</span>
            <p className={`text-xs ${secondaryLabel}`}>
              Not affiliated with X Corp. No data is stored or sent to any server.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
