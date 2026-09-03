import { useEffect } from "react"

interface SuccessScreenProps {
  onDone: () => void
}

export function SuccessScreen({ onDone }: SuccessScreenProps) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="flex flex-col h-full bg-white items-center justify-center gap-6 px-8">
      {/* Ripple rings */}
      <div className="relative flex items-center justify-center">
        <div
          className="absolute w-32 h-32 rounded-full"
          style={{
            backgroundColor: "rgba(0,82,255,0.06)",
            animation: "scaleIn 0.6s ease both",
          }}
        />
        <div
          className="absolute w-24 h-24 rounded-full"
          style={{
            backgroundColor: "rgba(0,82,255,0.1)",
            animation: "scaleIn 0.5s ease 0.1s both",
          }}
        />
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #0052ff 0%, #003dd1 100%)",
            boxShadow: "0 12px 32px rgba(0,82,255,0.4)",
            animation: "scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.15s both",
          }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path
              d="M10 18l6 6 10-12"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ animation: "fadeIn 0.3s ease 0.5s both" }}
            />
          </svg>
        </div>
      </div>

      <div
        className="text-center animate-slide-up"
        style={{ animationDelay: "0.3s" }}
      >
        <p
          className="text-[28px] font-extrabold"
          style={{ color: "#1a1f36", letterSpacing: "-0.5px" }}
        >
          Login Successful!
        </p>
        <p
          className="text-[15px] mt-2 font-medium"
          style={{ color: "#94a3b8" }}
        >
          Welcome back to BIMBOX Field
        </p>
      </div>

      <div
        className="flex items-center gap-2 px-5 py-3 rounded-2xl animate-slide-up"
        style={{
          backgroundColor: "#f4f7ff",
          animationDelay: "0.4s",
        }}
      >
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span
          className="text-[13px] font-semibold"
          style={{ color: "#7c8498" }}
        >
          Redirecting to your dashboard…
        </span>
      </div>
    </div>
  )
}
