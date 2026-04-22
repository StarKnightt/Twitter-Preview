"use client";

import { PaletteIcon } from "./XIcons";

interface ThemeSelectorProps {
  onSelect: (imageUrl: string | null) => void;
  onClose: () => void;
  currentTheme: string | null;
  darkMode: boolean;
}

const THEME_IMAGES = [
  "Astra.webp",
  "Bliss.webp",
  "Burst.webp",
  "Dusk.webp",
  "Flash.webp",
  "Ghost.webp",
  "Helix.webp",
  "Horizon.webp",
  "Peak.webp",
  "cube.webp",
  "cubemono.webp",
  "disaster.webp",
  "distortion.webp",
  "radiant.jpg",
  "vercel.jpg",
];

export default function ThemeSelector({ onSelect, onClose, currentTheme, darkMode }: ThemeSelectorProps) {
  const panelBg = darkMode ? "bg-[#1e2732]" : "bg-white";
  const textColor = darkMode ? "text-white" : "text-[#0f1419]";
  const secondaryText = darkMode ? "text-[#71767b]" : "text-[#536471]";
  const borderColor = darkMode ? "border-[#38444d]" : "border-[#e1e4e8]";
  const hoverBg = darkMode ? "hover:bg-[#273340]" : "hover:bg-[#f7f9f9]";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={onClose}
      />
      <div className={`${panelBg} ${borderColor} border relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]`}>
        <div className={`p-4 border-b ${borderColor} flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <PaletteIcon className="w-5 h-5 text-x-blue" />
            <div>
              <h2 className={`font-bold text-lg ${textColor}`}>Select Theme</h2>
              <p className={`text-xs ${secondaryText}`}>Choose a background for your post</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-full ${hoverBg} transition-colors ${textColor}`}
            aria-label="Close"
            type="button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <button
            onClick={() => {
              onSelect(null);
              onClose();
            }}
            className={`relative aspect-video rounded-xl border-2 transition-all group overflow-hidden ${
              currentTheme === null 
                ? "border-x-blue ring-2 ring-x-blue/20" 
                : `${borderColor} hover:border-[#71767b]`
            } ${darkMode ? "bg-black" : "bg-white"}`}
          >
            <div className={`absolute inset-0 flex flex-col items-center justify-center gap-2 ${secondaryText}`}>
               <span className="text-xs font-medium">No Background</span>
            </div>
          </button>

          {THEME_IMAGES.map((img) => {
            const url = `/Background/${img}`;
            const isActive = currentTheme === url;
            return (
              <button
                key={img}
                onClick={() => {
                  onSelect(url);
                  onClose();
                }}
                className={`relative aspect-video rounded-xl border-2 transition-all group overflow-hidden ${
                  isActive 
                    ? "border-x-blue ring-2 ring-x-blue/20" 
                    : `${borderColor} hover:border-[#71767b]`
                }`}
              >
                <img 
                  src={url} 
                  alt={img} 
                  className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                {isActive && (
                    <div className="absolute top-1 right-1 bg-x-blue text-white rounded-full p-0.5 shadow-sm">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                )}
              </button>
            );
          })}
        </div>
        
        <div className={`p-4 border-t ${borderColor} bg-opacity-50 flex justify-end`}>
            <button
                onClick={onClose}
                className="px-4 py-2 rounded-full font-bold text-sm bg-x-blue text-white hover:bg-x-blue/90"
            >
                Done
            </button>
        </div>
      </div>
    </div>
  );
}
