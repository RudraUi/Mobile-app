import { useState, useRef, useEffect } from "react"
import { BimboxLogo } from "./LoginScreen"
import { CustomKeyboard } from "../components/CustomKeyboard"

interface OtpScreenProps {
  email: string
  onVerify: () => void
  onBack: () => void
}

export function OtpScreen({
  email,
  onVerify,
  onBack: _onBack,
}: OtpScreenProps) {
  const [otp, setOtp] = useState(["5", "3", "", "", "", ""])
  const [timer, setTimer] = useState(18)
  const [activeIndex, setActiveIndex] = useState(2)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Focus the 3rd box initially (matching image 3)
    inputRefs.current[2]?.focus()
  }, [])

  useEffect(() => {
    if (timer <= 0) return
    const t = setTimeout(() => setTimer((v) => v - 1), 1000)
    return () => clearTimeout(t)
  }, [timer])

  const handleChange = (i: number, val: string) => {
    const lastChar = val.slice(-1)
    if (!/^\d*$/.test(lastChar)) return

    const next = [...otp]
    next[i] = lastChar
    setOtp(next)

    if (lastChar && i < 5) {
      inputRefs.current[i + 1]?.focus()
      setActiveIndex(i + 1)
    } else if (!lastChar && i > 0) {
      inputRefs.current[i - 1]?.focus()
      setActiveIndex(i - 1)
    }
  }

  const handleKeyDown = (
    i: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      inputRefs.current[i - 1]?.focus()
      setActiveIndex(i - 1)
    }
  }

  const handleNumericKeyPress = (num: string) => {
    const next = [...otp]
    next[activeIndex] = num
    setOtp(next)
    if (activeIndex < 5) {
      setActiveIndex(activeIndex + 1)
      inputRefs.current[activeIndex + 1]?.focus()
    }
  }

  const handleNumericBackspace = () => {
    const next = [...otp]
    if (next[activeIndex]) {
      next[activeIndex] = ""
      setOtp(next)
    } else if (activeIndex > 0) {
      next[activeIndex - 1] = ""
      setOtp(next)
      setActiveIndex(activeIndex - 1)
      inputRefs.current[activeIndex - 1]?.focus()
    }
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    onVerify()
  }

  return (
    <div className="flex flex-col justify-between h-full bg-white select-none">
      {/* Top Header & Form Container */}
      <div className="px-7 pt-24 pb-2 overflow-y-auto no-scrollbar">
        {/* Logo */}
        <div className="animate-slide-up">
          <BimboxLogo size={46} />
        </div>

        {/* Heading */}
        <div
          className="mt-5 animate-slide-up"
          style={{ animationDelay: "0.04s" }}
        >
          <h1
            className="text-[26px] font-bold leading-tight"
            style={{
              color: "#0055ff",
              fontFamily: "'Nunito Sans', sans-serif",
            }}
          >
            Verify OTP
          </h1>
          <p className="text-[14px] mt-1 text-slate-800 font-normal">
            Code has been sent to{" "}
            <span style={{ color: "#0055ff" }}>
              {email || "get@ziontutorial.com"}
            </span>
          </p>
        </div>

        {/* Enter OTP Label & Inputs */}
        <form
          onSubmit={handleSubmit}
          className="mt-7 animate-slide-up"
          style={{ animationDelay: "0.08s" }}
        >
          <label className="block text-[15px] font-normal text-slate-700 mb-3.5">
            Enter OTP
          </label>

          {/* 6 OTP Boxes */}
          <div className="flex items-center justify-between gap-2.5">
            {otp.map((digit, idx) => {
              const isFilled = digit !== ""
              const isActive = activeIndex === idx

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setActiveIndex(idx)
                    inputRefs.current[idx]?.focus()
                  }}
                  className={`relative flex-1 max-w-[48px] h-[52px] rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-150 ${
                    isFilled
                      ? "bg-[#0055ff] text-white shadow-xs"
                      : isActive
                        ? "bg-white border-[1.5px] border-[#0055ff]"
                        : "bg-[#f1f4f9] border border-slate-200/50"
                  }`}
                >
                  <input
                    ref={(el) => {
                      inputRefs.current[idx] = el
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onFocus={() => setActiveIndex(idx)}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {isFilled ? (
                    <span className="text-[20px] font-bold text-white select-none">
                      {digit}
                    </span>
                  ) : isActive ? (
                    <div className="w-[1.5px] h-[22px] bg-slate-400 animate-pulse pointer-events-none" />
                  ) : null}
                </div>
              )
            })}
          </div>

          {/* Resend Countdown (Right Aligned matching reference image) */}
          <div className="text-right mt-3.5">
            {timer > 0 ? (
              <span className="text-[13.5px] text-slate-800 font-normal">
                Resend code in {timer}s
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setTimer(30)}
                className="text-[13.5px] font-semibold hover:underline cursor-pointer"
                style={{ color: "#0055ff" }}
              >
                Resend code
              </button>
            )}
          </div>

          {/* Verify Button (Rounded & Sleek less height) */}
          <button
            type="submit"
            className="w-full h-[42px] mt-4 rounded-full flex items-center justify-center text-white text-[14.5px] font-bold transition-all active:scale-[0.98] shadow-xs hover:opacity-95 cursor-pointer"
            style={{ backgroundColor: "#0055ff" }}
          >
            Verify
          </button>
        </form>
      </div>

      {/* Custom Numeric Mobile Keypad (For look & interactive digit entry) */}
      <CustomKeyboard
        type="numeric"
        onKeyPress={handleNumericKeyPress}
        onBackspace={handleNumericBackspace}
        onSubmit={() => handleSubmit()}
      />
    </div>
  )
}
