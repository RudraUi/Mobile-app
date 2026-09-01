import { useState, useEffect } from "react";
import { MapView } from "../components/MapView";
import { TopBar } from "../components/TopBar";
import type { Item } from "../data/mockData";
import { typeColors } from "../data/mockData";

interface NavigateScreenProps {
  item: Item;
  onBack: () => void;
  onArrived: () => void;
}

export function NavigateScreen({ item, onBack, onArrived }: NavigateScreenProps) {
  const [progress, setProgress] = useState(0);
  const [arrived, setArrived] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    if (progress >= 1) {
      setTimeout(() => setArrived(true), 400);
      return;
    }
    const t = setTimeout(() => setProgress((p) => Math.min(p + 0.02, 1)), 60);
    return () => clearTimeout(t);
  }, [started, progress]);

  const typeColor = typeColors[item.type];
  const dist = Math.round(
    Math.sqrt(Math.pow(item.location.x - 225, 2) + Math.pow(item.location.y - 450, 2)) * 0.3
  );
  const remaining = Math.round(dist * (1 - progress));
  const eta = Math.max(1, Math.ceil(remaining / 80));

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "#eef2ff" }}>
      <TopBar title="Navigate" subtitle={item.location.label} onBack={onBack} />

      {/* Info card */}
      <div className="mx-4 mt-3 bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 shrink-0" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${typeColor}14` }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={typeColor} strokeWidth="2" strokeLinecap="round">
            <path d="M3 11l19-9-9 19-2-8-8-2z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold truncate" style={{ color: "#1a1f36" }}>{item.title}</p>
          <p className="text-[12px] font-medium mt-0.5" style={{ color: "#94a3b8" }}>~{dist}m · {item.location.label}</p>
        </div>
        {!started && !arrived && (
          <button
            onClick={() => setStarted(true)}
            className="px-4 h-9 rounded-xl text-white text-[13px] font-bold shrink-0 active:scale-95 transition-transform"
            style={{ backgroundColor: typeColor, boxShadow: `0 4px 12px ${typeColor}40` }}
          >
            Start
          </button>
        )}
        {started && !arrived && (
          <div className="text-right shrink-0">
            <p className="text-[15px] font-bold" style={{ color: typeColor }}>{Math.round(progress * 100)}%</p>
            <p className="text-[11px] font-medium" style={{ color: "#94a3b8" }}>En route</p>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 relative overflow-hidden mt-3">
        <MapView
          items={[item]}
          showNavPath={true}
          navProgress={progress}
          targetItem={item}
          onPinClick={() => {}}
          interactive={false}
        />

        {/* Progress overlay */}
        {started && !arrived && (
          <div
            className="absolute bottom-4 left-4 right-4 bg-white rounded-3xl p-4 animate-slide-up"
            style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-[15px] font-bold" style={{ color: "#1a1f36" }}>Walking to location…</p>
                <p className="text-[12px] font-medium mt-0.5" style={{ color: "#94a3b8" }}>~{remaining}m remaining · {eta} min</p>
              </div>
              <span className="text-[18px] font-bold" style={{ color: typeColor }}>{Math.round(progress * 100)}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "#f0f4ff" }}>
              <div
                className="h-full rounded-full transition-all duration-200"
                style={{ width: `${progress * 100}%`, background: `linear-gradient(90deg, ${typeColor} 0%, ${typeColor}cc 100%)` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Arrived modal */}
      {arrived && (
        <div className="absolute inset-0 flex items-end z-30" style={{ backgroundColor: "rgba(15,20,40,0.5)" }}>
          <div className="bg-white rounded-t-[2rem] w-full px-5 pt-6 pb-8 animate-slide-up" style={{ boxShadow: "0 -8px 40px rgba(0,0,0,0.2)" }}>
            {/* Handle */}
            <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ backgroundColor: "#e0e7ff" }} />

            <div className="flex flex-col items-center gap-4">
              {/* Icon */}
              <div className="relative">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${typeColor}15` }}
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: typeColor, boxShadow: `0 6px 20px ${typeColor}50` }}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" fill="white" opacity="0.3" />
                      <circle cx="12" cy="10" r="3" fill="white" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Text */}
              <div className="text-center">
                <p className="text-[24px] font-bold leading-tight" style={{ color: "#1a1f36" }}>You've Arrived!</p>
                <p className="text-[14px] font-medium mt-1" style={{ color: "#94a3b8" }}>{item.location.label}</p>
              </div>

              {/* Item chip */}
              <div
                className="w-full flex items-center gap-3 rounded-2xl p-3"
                style={{ backgroundColor: `${typeColor}08`, border: `1.5px solid ${typeColor}20` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${typeColor}18` }}
                >
                  <span className="text-[11px] font-bold" style={{ color: typeColor }}>{item.id.split("-")[0]}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold" style={{ color: "#1a1f36" }}>{item.id}</p>
                  <p className="text-[12px] font-medium truncate" style={{ color: "#94a3b8" }}>{item.title}</p>
                </div>
              </div>

              <p className="text-[13px] font-medium" style={{ color: "#94a3b8" }}>What would you like to do here?</p>

              {/* Actions */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={onBack}
                  className="flex-1 py-3.5 rounded-2xl border-2 text-[14px] font-bold active:scale-95 transition-transform"
                  style={{ borderColor: typeColor, color: typeColor }}
                >
                  View Item
                </button>
                <button
                  onClick={onArrived}
                  className="flex-1 py-3.5 rounded-2xl text-white text-[14px] font-bold active:scale-95 transition-transform"
                  style={{ backgroundColor: typeColor, boxShadow: `0 4px 16px ${typeColor}50` }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
