import { useState, useRef, useEffect } from "react";
import { BimboxLogo } from "./LoginScreen";

interface OtpScreenProps {
  email: string;
  onVerify: () => void;
  onBack: () => void;
}

export function OtpScreen({ email, onVerify, onBack: _onBack }: OtpScreenProps) {
  const [otp, setOtp] = useState(["5", "3", "", "", "", ""]);
  const [timer, setTimer] = useState(18);
  const [activeIndex, setActiveIndex] = useState(2);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus the 3rd box initially (matching image 3)
    inputRefs.current[2]?.focus();
  }, []);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const handleChange = (i: number, val: string) => {
    const lastChar = val.slice(-1);
    if (!/^\d*$/.test(lastChar)) return;

    const next = [...otp];
    next[i] = lastChar;
    setOtp(next);

    if (lastChar && i < 5) {
      inputRefs.current[i + 1]?.focus();
      setActiveIndex(i + 1);
    } else if (!lastChar && i > 0) {
      inputRefs.current[i - 1]?.focus();
      setActiveIndex(i - 1);
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
      setActiveIndex(i - 1);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onVerify();
  };

  return (
    <div className="flex flex-col justify-between h-full bg-white px-7 pt-14 pb-8 select-none">
      {/* Top Header & Form */}
      <div>
        {/* Logo */}
        <div className="animate-slide-up">
          <BimboxLogo size={46} />
        </div>

        {/* Heading */}
        <div className="mt-5 animate-slide-up" style={{ animationDelay: "0.04s" }}>
          <h1
            className="text-[26px] font-bold leading-tight"
            style={{ color: "#0055ff", fontFamily: "'Nunito Sans', sans-serif" }}
          >
            Verify OTP
          </h1>
          <p className="text-[13px] mt-1 text-slate-500 font-normal">
            Code has been sent to{" "}
            <span style={{ color: "#0055ff" }}>
              {email || "get@ziontutorial.com"}
            </span>
          </p>
        </div>

        {/* Enter OTP Label & Inputs */}
        <form onSubmit={handleSubmit} className="mt-8 animate-slide-up" style={{ animationDelay: "0.08s" }}>
          <label className="block text-[13.5px] font-medium text-slate-700 mb-3">
            Enter OTP
          </label>

          {/* 6 OTP Boxes */}
          <div className="flex items-center justify-between gap-2.5">
            {otp.map((digit, idx) => {
              const isFilled = digit !== "";
              const isActive = activeIndex === idx;

              return (
                <div key={idx} className="relative flex-1 max-w-[50px] h-[52px]">
                  <input
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onFocus={() => setActiveIndex(idx)}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className={`w-full h-full text-center text-[19px] font-bold rounded-2xl outline-none transition-all duration-150 ${
                      isFilled
                        ? "bg-[#0055ff] text-white border-transparent"
                        : isActive
                        ? "bg-white border-[1.5px] border-[#0055ff] text-slate-900 caret-[#0055ff]"
                        : "bg-[#f1f5f9] text-transparent border-transparent"
                    }`}
                  />
                  {/* Blinking cursor line emulation if active and empty */}
                  {isActive && !isFilled && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-[1.5px] h-5 bg-slate-400 animate-pulse" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Resend countdown */}
          <div className="flex justify-end mt-3">
            {timer > 0 ? (
              <span className="text-[13px] text-slate-700 font-normal">
                Resend code in {timer}s
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setTimer(30)}
                className="text-[13px] font-semibold hover:underline"
                style={{ color: "#0055ff" }}
              >
                Resend code
              </button>
            )}
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            className="w-full h-[50px] mt-10 rounded-2xl flex items-center justify-center text-white text-[15px] font-semibold transition-all active:scale-[0.98] shadow-sm hover:opacity-95"
            style={{ backgroundColor: "#0055ff" }}
          >
            Verify
          </button>
        </form>
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
