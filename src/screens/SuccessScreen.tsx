import { useEffect } from "react";

interface SuccessScreenProps {
  onDone: () => void;
}

export function SuccessScreen({ onDone }: SuccessScreenProps) {
  useEffect(() => {
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      onClick={onDone}
      className="flex flex-col justify-between items-center h-full bg-white px-7 pt-14 pb-8 select-none cursor-pointer"
    >
      <div className="w-full" />

      {/* Centered Success Badge and Text */}
      <div className="flex flex-col items-center justify-center animate-scale-in">
        {/* Blue Checkmark Circle */}
        <div
          className="w-18 h-18 rounded-full flex items-center justify-center shadow-lg"
          style={{ backgroundColor: "#0055ff", width: "72px", height: "72px" }}
        >
          <svg
            width="34"
            height="34"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        {/* Success Message */}
        <h2
          className="text-[21px] font-bold mt-5 tracking-tight"
          style={{ color: "#0055ff", fontFamily: "'Nunito Sans', sans-serif" }}
        >
          Login Success !
        </h2>
      </div>

      {/* Bottom Brand */}
      <div className="text-center pb-2">
        <span
          className="text-[26px] font-black tracking-wider select-none"
          style={{ color: "#cbd5e1", letterSpacing: "0.04em" }}
        >
          BIMBOX.AI
        </span>
      </div>
    </div>
  );
}
