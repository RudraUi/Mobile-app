import { useState, useRef, useEffect } from "react";

interface OtpScreenProps {
  email: string;
  onVerify: () => void;
  onBack: () => void;
}

export function OtpScreen({ email, onVerify, onBack }: OtpScreenProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(18);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const handleChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const filled = otp.filter(Boolean).length;
  const isComplete = filled === 6;

  return (
    <div className="flex flex-col h-full bg-white">
      <div
        className="absolute top-0 left-0 right-0 h-64 pointer-events-none"
        style={{ background: "linear-gradient(180deg, rgba(0,82,255,0.06) 0%, transparent 100%)" }}
      />

      <div className="flex-1 flex flex-col px-7 pt-16 pb-8 relative">
        {/* Header */}
        <div className="mb-10 animate-slide-up">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-7 shadow-lg"
            style={{ background: "linear-gradient(135deg, #0052ff 0%, #003dd1 100%)" }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h1 className="text-[32px] font-extrabold leading-none" style={{ color: "#0052ff", letterSpacing: "-1px" }}>
            Verify OTP
          </h1>
          <p className="text-[14px] mt-2 font-medium leading-relaxed" style={{ color: "#7c8498" }}>
            Code sent to{" "}
            <span className="font-bold" style={{ color: "#0052ff" }}>{email}</span>
          </p>
        </div>

        {/* Label */}
        <p className="text-[13px] font-bold uppercase tracking-wider mb-3" style={{ color: "#94a3b8" }}>
          Enter 6-digit code
        </p>

        {/* OTP boxes */}
        <div className="flex gap-2 animate-slide-up" style={{ animationDelay: "0.06s" }}>
          {otp.map((digit, i) => {
            const isFilled = !!digit;
            const isCurrent = !digit && otp.slice(0, i).every(Boolean);
            return (
              <input
                key={i}
                ref={(el) => { refs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="flex-1 h-[56px] rounded-2xl text-center text-[22px] font-bold outline-none border-2 transition-all duration-150"
                style={{
                  backgroundColor: isFilled ? "#0052ff" : isCurrent ? "#fff" : "#f4f7ff",
                  borderColor: isFilled ? "#0052ff" : isCurrent ? "#0052ff" : "transparent",
                  color: isFilled ? "white" : "#1a1f36",
                  boxShadow: isCurrent ? "0 0 0 3px rgba(0,82,255,0.12)" : isFilled ? "0 4px 12px rgba(0,82,255,0.3)" : "none",
                }}
              />
            );
          })}
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mt-4">
          {otp.map((d, i) => (
            <span
              key={i}
              className="h-1 rounded-full transition-all duration-200"
              style={{
                width: d ? "20px" : "6px",
                backgroundColor: d ? "#0052ff" : "#e2e8f0",
              }}
            />
          ))}
        </div>

        {/* Resend */}
        <div className="flex justify-end mt-5">
          {timer > 0 ? (
            <span className="text-[13px] font-medium" style={{ color: "#94a3b8" }}>
              Resend in <span className="font-bold" style={{ color: "#0052ff" }}>{timer}s</span>
            </span>
          ) : (
            <button
              onClick={() => setTimer(30)}
              className="text-[13px] font-bold"
              style={{ color: "#0052ff" }}
            >
              Resend code
            </button>
          )}
        </div>

        <div className="flex-1" />

        {/* Back */}
        <button onClick={onBack} className="flex items-center gap-1.5 mb-4 self-start">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          <span className="text-[13px] font-semibold" style={{ color: "#94a3b8" }}>Back to login</span>
        </button>

        {/* Verify button */}
        <button
          onClick={onVerify}
          className="w-full h-[56px] rounded-2xl flex items-center justify-center text-white text-[16px] font-bold transition-all duration-200 active:scale-[0.97]"
          style={{
            background: isComplete
              ? "linear-gradient(135deg, #0052ff 0%, #003dd1 100%)"
              : "linear-gradient(135deg, #93b5ff 0%, #7a9ff0 100%)",
            boxShadow: isComplete ? "0 8px 24px rgba(0,82,255,0.35)" : "none",
          }}
        >
          {isComplete ? "Verify & Continue" : `${filled} of 6 digits`}
        </button>

        <p className="text-center text-[12px] font-bold mt-7 tracking-[3px]" style={{ color: "#c8d3f0" }}>
          BIMBOX.AI
        </p>
      </div>
    </div>
  );
}
