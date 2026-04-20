"use client";

import { useState, useEffect } from "react";
import {
  ReplyIcon,
  RetweetIcon,
  LikeIcon,
  ViewIcon,
  BookmarkIcon,
  ShareIcon,
  VerifiedIcon,
  MoreIcon,
} from "./XIcons";

export type MediaType = "image" | "video";

export interface TweetData {
  displayName: string;
  handle: string;
  avatarUrl: string | null;
  verified: boolean;
  text: string;
  mediaUrl: string | null;
  mediaType: MediaType;
  timestamp: Date;
  replies: number;
  retweets: number;
  likes: number;
  views: number;
  bookmarks: number;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toString();
}

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 60) return `${seconds}s`;
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function renderTextWithEntities(text: string) {
  const parts = text.split(
    /((?:@\w+)|(?:#\w+)|(?:https?:\/\/\S+))/g
  );
  return parts.map((part, i) => {
    if (part.match(/^@\w+$/)) {
      return (
        <span key={i} className="text-x-blue hover:underline cursor-pointer">
          {part}
        </span>
      );
    }
    if (part.match(/^#\w+$/)) {
      return (
        <span key={i} className="text-x-blue hover:underline cursor-pointer">
          {part}
        </span>
      );
    }
    if (part.match(/^https?:\/\/\S+$/)) {
      return (
        <span key={i} className="text-x-blue hover:underline cursor-pointer">
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function TweetPreview({
  tweet,
  darkMode,
}: {
  tweet: TweetData;
  darkMode: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const bg = darkMode ? "bg-black" : "bg-white";
  const textColor = darkMode ? "text-[#e7e9ea]" : "text-[#0f1419]";
  const secondaryText = darkMode ? "text-[#71767b]" : "text-[#536471]";
  const borderColor = darkMode ? "border-[#2f3336]" : "border-[#eff3f4]";
  const avatarBg = darkMode ? "bg-[#333639]" : "bg-[#cfd9de]";

  return (
    <div
      className={`${bg} ${borderColor} border rounded-2xl overflow-hidden w-full transition-colors duration-200`}
    >
      <div className="px-4 pt-3 pb-1">
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="shrink-0">
            {tweet.avatarUrl ? (
              <img
                src={tweet.avatarUrl}
                alt=""
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div
                className={`w-10 h-10 rounded-full ${avatarBg} flex items-center justify-center`}
              >
                <svg
                  viewBox="0 0 24 24"
                  className={`w-5 h-5 ${darkMode ? "text-[#71767b]" : "text-[#536471]"}`}
                  fill="currentColor"
                >
                  <path d="M12 11.816c1.355 0 2.872-.15 3.84-1.256.814-.93 1.078-2.368.806-4.392-.38-2.825-2.117-4.512-4.646-4.512S7.734 3.343 7.354 6.168c-.272 2.024-.008 3.462.806 4.392.968 1.107 2.485 1.256 3.84 1.256zM8.84 6.368c.162-1.2.787-3.212 3.16-3.212s2.998 2.013 3.16 3.212c.207 1.55.057 2.627-.45 3.205-.455.52-1.266.743-2.71.743s-2.255-.223-2.71-.743c-.507-.578-.657-1.656-.45-3.205zm11.44 12.868c-.877-3.526-4.282-5.99-8.28-5.99s-7.403 2.464-8.28 5.99c-.172.692-.028 1.4.395 1.94.408.52 1.04.82 1.733.82h12.304c.693 0 1.325-.3 1.733-.82.424-.54.567-1.247.394-1.94zm-1.576 1.016c-.126.16-.316.246-.552.246H5.848c-.235 0-.426-.085-.552-.246-.137-.174-.18-.412-.12-.654.71-2.855 3.517-4.85 6.824-4.85s6.114 1.994 6.824 4.85c.06.242.017.48-.12.654z" />
                </svg>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Name row */}
            <div className="flex items-center gap-1 leading-5">
              <span className={`font-bold text-[15px] ${textColor} truncate`}>
                {tweet.displayName || "Display Name"}
              </span>
              {tweet.verified && (
                <VerifiedIcon className="w-[18px] h-[18px] text-x-blue shrink-0" />
              )}
              <span className={`text-[15px] ${secondaryText} truncate`}>
                @{tweet.handle || "handle"}
              </span>
              <span className={`${secondaryText} text-[15px]`}>·</span>
              <span
                className={`text-[15px] ${secondaryText} shrink-0 hover:underline cursor-pointer`}
              >
                {mounted ? formatTimestamp(tweet.timestamp) : "now"}
              </span>
              <div className="ml-auto shrink-0">
                <MoreIcon className={`w-[18.75px] h-[18.75px] ${secondaryText}`} />
              </div>
            </div>

            {/* Tweet text */}
            {tweet.text && (
              <div
                className={`text-[15px] leading-5 ${textColor} mt-0.5 whitespace-pre-wrap wrap-break-word`}
              >
                {renderTextWithEntities(tweet.text)}
              </div>
            )}

            {/* Media */}
            {tweet.mediaUrl && (
              <div className={`mt-3 rounded-2xl overflow-hidden border ${borderColor}`}>
                {tweet.mediaType === "video" ? (
                  <video
                    src={tweet.mediaUrl}
                    controls
                    className="w-full max-h-[510px] object-contain bg-black"
                    playsInline
                  />
                ) : (
                  <img
                    src={tweet.mediaUrl}
                    alt=""
                    className="w-full max-h-[510px] object-cover"
                  />
                )}
              </div>
            )}

            {/* Action bar */}
            <div className="flex justify-between mt-3 mb-1 max-w-[425px] -ml-2">
              <ActionButton
                icon={<ReplyIcon className="w-[18.75px] h-[18.75px]" />}
                count={tweet.replies}
                color="group-hover:text-x-blue"
                bgColor="group-hover:bg-x-blue/10"
                secondaryText={secondaryText}
              />
              <ActionButton
                icon={<RetweetIcon className="w-[18.75px] h-[18.75px]" />}
                count={tweet.retweets}
                color="group-hover:text-x-green"
                bgColor="group-hover:bg-x-green/10"
                secondaryText={secondaryText}
              />
              <ActionButton
                icon={<LikeIcon className="w-[18.75px] h-[18.75px]" />}
                count={tweet.likes}
                color="group-hover:text-x-pink"
                bgColor="group-hover:bg-x-pink/10"
                secondaryText={secondaryText}
              />
              <ActionButton
                icon={<ViewIcon className="w-[18.75px] h-[18.75px]" />}
                count={tweet.views}
                color="group-hover:text-x-blue"
                bgColor="group-hover:bg-x-blue/10"
                secondaryText={secondaryText}
              />
              <div className="flex items-center gap-0.5">
                <button className="group flex items-center cursor-pointer" type="button">
                  <div className={`p-2 rounded-full group-hover:bg-x-blue/10 transition-colors ${secondaryText}`}>
                    <BookmarkIcon className="w-[18.75px] h-[18.75px] group-hover:text-x-blue" />
                  </div>
                </button>
                <button className="group flex items-center cursor-pointer" type="button">
                  <div className={`p-2 rounded-full group-hover:bg-x-blue/10 transition-colors ${secondaryText}`}>
                    <ShareIcon className="w-[18.75px] h-[18.75px] group-hover:text-x-blue" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  count,
  color,
  bgColor,
  secondaryText,
}: {
  icon: React.ReactNode;
  count: number;
  color: string;
  bgColor: string;
  secondaryText: string;
}) {
  return (
    <button className="group flex items-center cursor-pointer" type="button">
      <div className={`p-2 rounded-full ${bgColor} transition-colors ${secondaryText} ${color}`}>
        {icon}
      </div>
      {count > 0 && (
        <span className={`text-[13px] ${secondaryText} ${color} -ml-1 transition-colors`}>
          {formatNumber(count)}
        </span>
      )}
    </button>
  );
}
