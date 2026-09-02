import { useEffect } from "react";

interface LoggedOutScreenProps {
  onDone: () => void;
}

export function LoggedOutScreen({ onDone }: LoggedOutScreenProps) {
  useEffect(() => {
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      onClick={onDone}
      className="flex flex-col justify-between items-center h-full bg-[#0055ff] px-7 pt-14 pb-8 select-none cursor-pointer"
    >
      <div className="w-full" />

      {/* Centered Simple Animated Logout Icon and Text - No Box Shadow, No Border */}
      <div className="flex flex-col items-center justify-center">
        {/* Simple Animated White Logout Icon SVG */}
        <svg
          width="82"
          height="82"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="select-none"
        >
          {/* Door Frame */}
          <path
            d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
            className="animate-check-tick"
          />
          {/* Arrow Sliding Out */}
          <g className="animate-slide-out-arrow">
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </g>
        </svg>

        {/* Logged Out Message Text */}
        <h2
          className="text-[24px] font-bold text-white mt-5 tracking-tight animate-slide-up text-center"
          style={{ fontFamily: "'Nunito Sans', sans-serif", animationDelay: "0.2s" }}
        >
          Logged Out !
        </h2>

        {/* Subtitle */}
        <p
          className="text-[13.5px] text-white/80 font-normal mt-1 animate-slide-up text-center"
          style={{ animationDelay: "0.3s" }}
        >
          See you soon
        </p>
      </div>

      {/* Bottom Brand */}
      <div className="text-center pb-2">
        <span
          className="text-[26px] font-black tracking-wider select-none text-white/30"
          style={{ letterSpacing: "0.04em" }}
        >
          BIMBOX.AI
        </span>
      </div>
    </div>
  );
}
