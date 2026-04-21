"use client";

import { useState, useEffect, memo } from "react";
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
  const parts = text.split(/((?:@\w+)|(?:#\w+)|(?:https?:\/\/\S+))/g);
  return parts.map((part, i) => {
    if (part.match(/^@\w+$/) || part.match(/^#\w+$/) || part.match(/^https?:\/\/\S+$/)) {
      return (
        <span key={i} className="text-x-blue hover:underline cursor-pointer">
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export type DeviceView = "mobile" | "tablet" | "desktop";

export default function TweetPreview({
  tweet,
  darkMode,
  device = "desktop",
  background = null,
}: {
  tweet: TweetData;
  darkMode: boolean;
  device?: DeviceView;
  background?: string | null;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const isMobile = device === "mobile";

  const bg = darkMode ? "bg-black" : "bg-white";
  const textColor = darkMode ? "text-[#e7e9ea]" : "text-[#0f1419]";
  const secondaryText = darkMode ? "text-[#71767b]" : "text-[#536471]";
  const borderColor = darkMode ? "border-[#2f3336]" : "border-[#eff3f4]";
  const avatarBg = darkMode ? "bg-[#333639]" : "bg-[#cfd9de]";
  const dividerColor = darkMode ? "border-[#2f3336]" : "border-[#eff3f4]";

  return (
    <div
      className={`${bg} w-full transition-colors duration-200 ${
        isMobile ? "rounded-[12px]" : `${borderColor} border rounded-2xl overflow-hidden shadow-sm`
      }`}
    >
      <div className={`${isMobile ? "px-4 pt-4 pb-0" : "px-4 pt-3 pb-1"}`}>
        <div className={`flex ${isMobile ? "gap-2.5" : "gap-3"}`}>
          {/* Avatar */}
          <div className="shrink-0">
            {tweet.avatarUrl ? (
              <img
                src={tweet.avatarUrl}
                alt=""
                className={`rounded-full object-cover ${isMobile ? "w-9 h-9" : "w-10 h-10"}`}
              />
            ) : (
              <div
                className={`rounded-full ${avatarBg} flex items-center justify-center ${
                  isMobile ? "w-9 h-9" : "w-10 h-10"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  className={`${isMobile ? "w-4 h-4" : "w-5 h-5"} ${
                    darkMode ? "text-[#71767b]" : "text-[#536471]"
                  }`}
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
              <span
                className={`font-bold ${textColor} truncate ${
                  isMobile ? "text-[14px]" : "text-[15px]"
                }`}
              >
                {tweet.displayName || "Display Name"}
              </span>
              {tweet.verified && (
                <VerifiedIcon
                  className={`text-x-blue shrink-0 ${
                    isMobile ? "w-4 h-4" : "w-[18px] h-[18px]"
                  }`}
                />
              )}
              <span
                className={`${secondaryText} truncate ${
                  isMobile ? "text-[13px]" : "text-[15px]"
                }`}
              >
                @{tweet.handle || "handle"}
              </span>
              <span className={`${secondaryText} ${isMobile ? "text-[13px]" : "text-[15px]"}`}>
                ·
              </span>
              <span
                className={`${secondaryText} shrink-0 ${
                  isMobile ? "text-[13px]" : "text-[15px]"
                }`}
              >
                {mounted ? formatTimestamp(tweet.timestamp) : "now"}
              </span>
              <div className="ml-auto shrink-0">
                <MoreIcon
                  className={`${secondaryText} ${
                    isMobile ? "w-4 h-4" : "w-[18.75px] h-[18.75px]"
                  }`}
                />
              </div>
            </div>

            {/* Tweet text */}
            {tweet.text && (
              <div
                className={`${textColor} mt-0.5 whitespace-pre-wrap wrap-break-word ${
                  isMobile ? "text-[14px] leading-[18px]" : "text-[15px] leading-5"
                }`}
              >
                {renderTextWithEntities(tweet.text)}
              </div>
            )}

            {/* Media */}
            {tweet.mediaUrl && (
              <MediaPreview
                mediaUrl={tweet.mediaUrl}
                mediaType={tweet.mediaType}
                borderColor={borderColor}
              />
            )}

            {/* Action bar */}
            {isMobile ? (
              <MobileActionBar tweet={tweet} secondaryText={secondaryText} />
            ) : (
              <DesktopActionBar tweet={tweet} secondaryText={secondaryText} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const MediaPreview = memo(function MediaPreview({
  mediaUrl,
  mediaType,
  borderColor,
}: {
  mediaUrl: string;
  mediaType: MediaType;
  borderColor: string;
}) {
  return (
    <div
      className={`mt-3 rounded-2xl border ${borderColor} relative ${
        mediaType === "video" ? "" : "overflow-hidden"
      }`}
    >
      {mediaType === "video" ? (
        <video
          key={mediaUrl}
          src={mediaUrl}
          controls
          controlsList="nodownload"
          preload="metadata"
          playsInline
          className="w-full max-h-[510px] object-contain bg-black rounded-2xl"
          style={{ minHeight: "200px", display: "block" }}
        />
      ) : (
        <img src={mediaUrl} alt="" className="w-full max-h-[510px] object-cover" />
      )}
    </div>
  );
});

function MobileActionBar({
  tweet,
  secondaryText,
}: {
  tweet: TweetData;
  secondaryText: string;
}) {
  return (
    <div className="flex items-center justify-between mt-2.5 mb-2 -ml-1.5">
      <MobileAction
        icon={<ReplyIcon className="w-[16px] h-[16px]" />}
        count={tweet.replies}
        secondaryText={secondaryText}
      />
      <MobileAction
        icon={<RetweetIcon className="w-[16px] h-[16px]" />}
        count={tweet.retweets}
        secondaryText={secondaryText}
      />
      <MobileAction
        icon={<LikeIcon className="w-[16px] h-[16px]" />}
        count={tweet.likes}
        secondaryText={secondaryText}
      />
      <MobileAction
        icon={<ViewIcon className="w-[16px] h-[16px]" />}
        count={tweet.views}
        secondaryText={secondaryText}
      />
      <div className="flex items-center gap-3">
        <div className={secondaryText}>
          <BookmarkIcon className="w-[16px] h-[16px]" />
        </div>
        <div className={secondaryText}>
          <ShareIcon className="w-[16px] h-[16px]" />
        </div>
      </div>
    </div>
  );
}

function MobileAction({
  icon,
  count,
  secondaryText,
}: {
  icon: React.ReactNode;
  count: number;
  secondaryText: string;
}) {
  return (
    <div className={`flex items-center gap-1 ${secondaryText}`}>
      {icon}
      {count > 0 && (
        <span className="text-[12px]">{formatNumber(count)}</span>
      )}
    </div>
  );
}

function DesktopActionBar({
  tweet,
  secondaryText,
}: {
  tweet: TweetData;
  secondaryText: string;
}) {
  return (
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
