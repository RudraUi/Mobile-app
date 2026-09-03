import { useState } from "react"

interface LoginScreenProps {
  onLogin: (email: string) => void
  onOtp: () => void
}

function BimboxLogo() {
  return (
    <div
      className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
      style={{
        background: "linear-gradient(135deg, #0052ff 0%, #003dd1 100%)",
      }}
    >
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <path d="M7 24V9l8-5 8 5v15H7z" fill="white" opacity="0.25" />
        <path
          d="M7 9l8 4.5 8-4.5"
          stroke="white"
          strokeWidth="2.2"
          fill="none"
          strokeLinejoin="round"
        />
        <path
          d="M15 13.5v10.5"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M11 11.5v10.5M19 11.5v10.5"
          stroke="white"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>
    </div>
  )
}

export function LoginScreen({ onLogin, onOtp }: LoginScreenProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passFocused, setPassFocused] = useState(false)

  const handleLogin = () => {
    onLogin(email || "field.worker@bimbox.ai")
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Top gradient accent */}
      <div
        className="absolute top-0 left-0 right-0 h-64 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,82,255,0.06) 0%, transparent 100%)",
        }}
      />

      <div className="flex-1 flex flex-col px-7 pt-16 pb-8 overflow-y-auto relative">
        {/* Header */}
        <div className="mb-10 animate-slide-up">
          <BimboxLogo />
          <h1
            className="text-[32px] font-extrabold mt-7 leading-none"
            style={{ color: "#0052ff", letterSpacing: "-1px" }}
          >
            Sign in
          </h1>
          <p
            className="text-[15px] mt-2 font-medium"
            style={{ color: "#7c8498" }}
          >
            Stay updated in the professional BIM world
          </p>
        </div>

        {/* Form */}
        <div
          className="flex flex-col gap-3.5 animate-slide-up"
          style={{ animationDelay: "0.05s" }}
        >
          {/* Email */}
          <div
            className="flex items-center gap-3.5 px-4 h-[58px] rounded-2xl border transition-all duration-200"
            style={{
              backgroundColor: emailFocused ? "#fff" : "#f4f7ff",
              borderColor: emailFocused ? "#0052ff" : "transparent",
              boxShadow: emailFocused ? "0 0 0 3px rgba(0,82,255,0.1)" : "none",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke={emailFocused || email ? "#0052ff" : "#94a3b8"}
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <rect x="2" y="4" width="20" height="16" rx="3" />
              <path d="M2 7l10 7 10-7" />
            </svg>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              placeholder="Enter your email"
              className="flex-1 bg-transparent text-[15px] font-medium outline-none"
              style={{ color: "#1a1f36" }}
            />
            {email && (
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#0052ff" }}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            )}
          </div>

          {/* Password */}
          <div
            className="flex items-center gap-3.5 px-4 h-[58px] rounded-2xl border transition-all duration-200"
            style={{
              backgroundColor: passFocused ? "#fff" : "#f4f7ff",
              borderColor: passFocused ? "#0052ff" : "transparent",
              boxShadow: passFocused ? "0 0 0 3px rgba(0,82,255,0.1)" : "none",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke={passFocused || password ? "#0052ff" : "#94a3b8"}
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPassFocused(true)}
              onBlur={() => setPassFocused(false)}
              placeholder="Password"
              className="flex-1 bg-transparent text-[15px] font-medium outline-none"
              style={{
                color: "#1a1f36",
                fontFamily:
                  password && !showPassword
                    ? "inherit"
                    : "Urbanist, sans-serif",
              }}
            />
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setShowPassword(!showPassword)}
              className="p-1"
            >
              {showPassword ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* OTP link */}
        <button
          onClick={onOtp}
          className="mt-5 text-left self-start animate-slide-up"
          style={{ animationDelay: "0.08s" }}
        >
          <span
            className="text-[14px] font-semibold"
            style={{ color: "#0052ff" }}
          >
            Login with OTP instead →
          </span>
        </button>

        <div className="flex-1" />

        {/* CTA */}
        <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <button
            onClick={handleLogin}
            className="w-full h-[56px] rounded-2xl flex items-center justify-center text-white text-[16px] font-bold transition-all active:scale-[0.97]"
            style={{
              background: "linear-gradient(135deg, #0052ff 0%, #003dd1 100%)",
              boxShadow: "0 8px 24px rgba(0,82,255,0.35)",
            }}
          >
            Login
          </button>

          <p
            className="text-center text-[12px] font-bold mt-7 tracking-[3px]"
            style={{ color: "#c8d3f0" }}
          >
            BIMBOX.AI
          </p>
        </div>
      </div>
    </div>
  )
}
