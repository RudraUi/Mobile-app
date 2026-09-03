import { useEffect } from "react"

interface SuccessScreenProps {
  onDone: () => void
}

export function SuccessScreen({ onDone }: SuccessScreenProps) {
  useEffect(() => {
    const t = setTimeout(onDone, 2000)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div
      onClick={onDone}
      className="flex flex-col justify-between items-center h-full bg-[#0055ff] px-7 pt-14 pb-8 select-none cursor-pointer"
    >
      <div className="w-full" />

      {/* Centered Simple Tick Animation and Text - No Box Shadow, No Border */}
      <div className="flex flex-col items-center justify-center">
        {/* Simple Animated White Tick SVG */}
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
          <polyline points="4 12 9 17 20 6" className="animate-check-tick" />
        </svg>

        {/* Success Message Text */}
        <h2
          className="text-[24px] font-bold text-white mt-5 tracking-tight animate-slide-up text-center"
          style={{
            fontFamily: "'Nunito Sans', sans-serif",
            animationDelay: "0.2s",
          }}
        >
          Login Success !
        </h2>
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
  )
}
