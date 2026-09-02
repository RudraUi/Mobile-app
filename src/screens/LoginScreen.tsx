import { useState } from "react";
import { CustomKeyboard } from "../components/CustomKeyboard";

interface LoginScreenProps {
  onLogin: (email: string) => void;
  onOtp: () => void;
}

export function BimboxLogo({ size = 46 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 46 46" fill="none">
      <rect width="46" height="46" rx="11" fill="#0055ff" />
      <path
        d="M13.5 19.5C13.5 20.6 14.4 21.5 15.5 21.5H20.5C21.6 21.5 22.5 20.6 22.5 19.5V18H26.5V24.5C26.5 25.6 27.4 26.5 28.5 26.5H29.5C30.6 26.5 31.5 25.6 31.5 24.5V16C31.5 14.34 30.16 13 28.5 13H15.5C14.4 13 13.5 13.9 13.5 15V19.5Z"
        fill="white"
      />
    </svg>
  );
}

export function LoginScreen({ onLogin, onOtp }: LoginScreenProps) {
  const [email, setEmail] = useState("alphainvent@gmail.com");
  const [password, setPassword] = useState("••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(true);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onLogin(email || "alphainvent@gmail.com");
  };

  const isEmailValid = email.trim().length > 0 && email.includes("@");

  return (
    <div className="flex flex-col justify-between h-full bg-white select-none">
      {/* Top Header & Form Container */}
      <div className="px-7 pt-24 pb-2 overflow-y-auto no-scrollbar">
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
            Sign in
          </h1>
          <p className="text-[13px] mt-1 text-slate-500 font-normal">
            Stay updated in the professional BIM world
          </p>
        </div>

        {/* Input Fields */}
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 animate-slide-up" style={{ animationDelay: "0.08s" }}>
          {/* Email Input */}
          <div
            className={`w-full h-[52px] px-4 rounded-2xl flex items-center gap-3 transition-all duration-150 ${
              emailFocused
                ? "bg-white border-[1.5px] border-[#0055ff]"
                : "bg-[#f4f7fc] border border-transparent"
            }`}
          >
            {/* Mail icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2.5" />
              <path d="M22 7l-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" />
            </svg>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              placeholder="Enter Email"
              className="flex-1 bg-transparent text-[14px] text-slate-800 placeholder-slate-400 font-normal outline-none"
            />
            {isEmailValid && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>

          {/* Password Input */}
          <div
            className={`w-full h-[52px] px-4 rounded-2xl flex items-center gap-3 transition-all duration-150 ${
              passFocused
                ? "bg-white border-[1.5px] border-[#0055ff]"
                : "bg-[#f4f7fc] border border-transparent"
            }`}
          >
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPassFocused(true)}
              onBlur={() => setPassFocused(false)}
              placeholder="Password"
              className="flex-1 bg-transparent text-[14px] text-slate-800 placeholder-slate-400 font-normal outline-none tracking-wide"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-500 hover:text-slate-700 p-1 focus:outline-none"
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              )}
            </button>
          </div>

          {/* Login with OTP instead link */}
          <div className="mt-1">
            <button
              type="button"
              onClick={onOtp}
              className="text-[13.5px] font-semibold text-left transition-opacity hover:opacity-80"
              style={{ color: "#0055ff" }}
            >
              Login with OTP instead
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full h-[42px] mt-5 rounded-full flex items-center justify-center text-white text-[14.5px] font-bold transition-all active:scale-[0.98] shadow-xs hover:opacity-95 cursor-pointer"
            style={{ backgroundColor: "#0055ff" }}
          >
            Login
          </button>
        </form>
      </div>

      {/* Custom Alpha Mobile Keyboard (For look & interactive typing) */}
      <CustomKeyboard
        type="alpha"
        actionLabel="Login"
        onKeyPress={(char) => {
          if (emailFocused) {
            setEmail((prev) => prev + char);
          } else if (passFocused) {
            setPassword((prev) => prev + char);
          }
        }}
        onBackspace={() => {
          if (emailFocused) {
            setEmail((prev) => prev.slice(0, -1));
          } else if (passFocused) {
            setPassword((prev) => prev.slice(0, -1));
          }
        }}
        onSubmit={() => handleSubmit()}
      />
    </div>
  );
}
