import { useState } from "react"

interface CustomKeyboardProps {
  type: "alpha" | "numeric"
  onKeyPress?: (char: string) => void
  onBackspace?: () => void
  onSubmit?: () => void
  actionLabel?: string
}

const ALPHA_ROW_1 = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"]
const ALPHA_ROW_2 = ["a", "s", "d", "f", "g", "h", "j", "k", "l"]
const ALPHA_ROW_3 = ["z", "x", "c", "v", "b", "n", "m"]

const NUM_SYMBOLS_ROW_1 = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]
const NUM_SYMBOLS_ROW_2 = ["-", "/", ":", ";", "(", ")", "$", "&", "@", '"']
const NUM_SYMBOLS_ROW_3 = [".", ",", "?", "!", "'"]

const NUMERIC_PAD = [
  { num: "1", sub: "" },
  { num: "2", sub: "ABC" },
  { num: "3", sub: "DEF" },
  { num: "4", sub: "GHI" },
  { num: "5", sub: "JKL" },
  { num: "6", sub: "MNO" },
  { num: "7", sub: "PQRS" },
  { num: "8", sub: "TUV" },
  { num: "9", sub: "WXYZ" },
  { num: "", sub: "" },
  { num: "0", sub: "" },
  { num: "backspace", sub: "" },
]

export function CustomKeyboard({
  type,
  onKeyPress,
  onBackspace,
  onSubmit,
  actionLabel = "Go",
}: CustomKeyboardProps) {
  const [isShift, setIsShift] = useState(false)
  const [isSymbols, setIsSymbols] = useState(false)

  // =========================================================================
  // NUMERIC KEYPAD (FOR OTP SCREEN)
  // =========================================================================
  if (type === "numeric") {
    return (
      <div className="w-full bg-[#E4E8EE]/95 backdrop-blur-md pt-2.5 pb-2 px-2.5 select-none shrink-0 border-t border-slate-200/80">
        <div className="grid grid-cols-3 gap-2 max-w-[370px] mx-auto">
          {NUMERIC_PAD.map((item, idx) => {
            if (item.num === "backspace") {
              return (
                <button
                  type="button"
                  key={`num-backspace-${idx}`}
                  onClick={() => onBackspace?.()}
                  className="h-[46px] rounded-lg flex items-center justify-center text-slate-700 active:bg-slate-300/80 transition-colors cursor-pointer"
                  aria-label="Backspace"
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                    <line x1="18" y1="9" x2="12" y2="15" />
                    <line x1="12" y1="9" x2="18" y2="15" />
                  </svg>
                </button>
              )
            }

            if (item.num === "") {
              return <div key={`num-empty-${idx}`} className="h-[46px]" />
            }

            return (
              <button
                type="button"
                key={item.num}
                onClick={() => onKeyPress?.(item.num)}
                className="h-[46px] rounded-lg bg-white shadow-[0_1px_1px_rgba(0,0,0,0.22)] active:bg-slate-100 flex flex-col items-center justify-center transition-all duration-75 cursor-pointer active:scale-[0.98]"
              >
                <span className="text-[20px] font-semibold text-slate-800 leading-none">
                  {item.num}
                </span>
                {item.sub && (
                  <span className="text-[8.5px] font-bold text-slate-400 tracking-[0.16em] leading-none mt-0.5">
                    {item.sub}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* iOS Home Indicator Bar */}
        <div className="flex justify-center pt-2.5 pb-1">
          <div className="w-[134px] h-[4.5px] bg-slate-800/40 rounded-full" />
        </div>
      </div>
    )
  }

  // =========================================================================
  // ALPHA KEYBOARD (QWERTY FOR TEXT FIELDS / LOGIN SCREEN)
  // =========================================================================
  const row1 = isSymbols ? NUM_SYMBOLS_ROW_1 : ALPHA_ROW_1
  const row2 = isSymbols ? NUM_SYMBOLS_ROW_2 : ALPHA_ROW_2
  const row3 = isSymbols ? NUM_SYMBOLS_ROW_3 : ALPHA_ROW_3

  return (
    <div className="w-full bg-[#D7DCE3]/95 backdrop-blur-md pt-2 pb-2 px-1 select-none shrink-0 border-t border-slate-300/70">
      <div className="flex flex-col gap-2 max-w-[390px] mx-auto">
        {/* ROW 1 */}
        <div className="flex justify-center gap-1.5 px-0.5">
          {row1.map((char) => {
            const displayChar =
              isShift && !isSymbols ? char.toUpperCase() : char
            return (
              <button
                type="button"
                key={char}
                onClick={() => onKeyPress?.(displayChar)}
                className="flex-1 max-w-[34px] h-[42px] bg-white rounded-md shadow-[0_1px_1px_rgba(0,0,0,0.28)] flex items-center justify-center text-[18px] text-slate-900 font-normal active:bg-slate-100 active:scale-[0.97] transition-all cursor-pointer"
              >
                {displayChar}
              </button>
            )
          })}
        </div>

        {/* ROW 2 */}
        <div className="flex justify-center gap-1.5 px-3">
          {row2.map((char) => {
            const displayChar =
              isShift && !isSymbols ? char.toUpperCase() : char
            return (
              <button
                type="button"
                key={char}
                onClick={() => onKeyPress?.(displayChar)}
                className="flex-1 max-w-[34px] h-[42px] bg-white rounded-md shadow-[0_1px_1px_rgba(0,0,0,0.28)] flex items-center justify-center text-[18px] text-slate-900 font-normal active:bg-slate-100 active:scale-[0.97] transition-all cursor-pointer"
              >
                {displayChar}
              </button>
            )
          })}
        </div>

        {/* ROW 3 (Shift + Letters + Backspace) */}
        <div className="flex justify-between items-center gap-1.5 px-0.5">
          {/* Shift Key */}
          <button
            type="button"
            onClick={() => setIsShift(!isShift)}
            className={`w-[42px] h-[42px] rounded-md flex items-center justify-center transition-all cursor-pointer active:scale-[0.97] ${
              isShift
                ? "bg-white text-slate-900 shadow-[0_1px_1px_rgba(0,0,0,0.28)]"
                : "bg-[#BAC0CA] text-slate-800 shadow-[0_1px_1px_rgba(0,0,0,0.2)]"
            }`}
            aria-label="Shift"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={isShift ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 4L4 12h5v8h6v-8h5L12 4z" />
            </svg>
          </button>

          {/* Letters */}
          <div className="flex-1 flex justify-center gap-1.5">
            {row3.map((char) => {
              const displayChar =
                isShift && !isSymbols ? char.toUpperCase() : char
              return (
                <button
                  type="button"
                  key={char}
                  onClick={() => onKeyPress?.(displayChar)}
                  className="flex-1 max-w-[34px] h-[42px] bg-white rounded-md shadow-[0_1px_1px_rgba(0,0,0,0.28)] flex items-center justify-center text-[18px] text-slate-900 font-normal active:bg-slate-100 active:scale-[0.97] transition-all cursor-pointer"
                >
                  {displayChar}
                </button>
              )
            })}
          </div>

          {/* Backspace Key */}
          <button
            type="button"
            onClick={() => onBackspace?.()}
            className="w-[42px] h-[42px] bg-[#BAC0CA] text-slate-800 rounded-md shadow-[0_1px_1px_rgba(0,0,0,0.2)] flex items-center justify-center transition-all active:scale-[0.97] cursor-pointer"
            aria-label="Backspace"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
              <line x1="18" y1="9" x2="12" y2="15" />
              <line x1="12" y1="9" x2="18" y2="15" />
            </svg>
          </button>
        </div>

        {/* ROW 4 (123 + Globe + Space + Go) */}
        <div className="flex items-center gap-1.5 px-0.5">
          {/* Numbers / ABC Toggle */}
          <button
            type="button"
            onClick={() => setIsSymbols(!isSymbols)}
            className="w-[48px] h-[42px] bg-[#BAC0CA] rounded-md shadow-[0_1px_1px_rgba(0,0,0,0.2)] flex items-center justify-center text-[13px] font-semibold text-slate-800 active:bg-white transition-all cursor-pointer"
          >
            {isSymbols ? "ABC" : "123"}
          </button>

          {/* Globe Emoji */}
          <button
            type="button"
            onClick={() => onKeyPress?.("@")}
            className="w-[38px] h-[42px] bg-[#BAC0CA] rounded-md shadow-[0_1px_1px_rgba(0,0,0,0.2)] flex items-center justify-center text-slate-800 active:bg-white transition-all cursor-pointer"
            aria-label="Symbols"
            title="@"
          >
            <span className="text-[14px] font-bold">@</span>
          </button>

          {/* Space Bar */}
          <button
            type="button"
            onClick={() => onKeyPress?.(" ")}
            className="flex-1 h-[42px] bg-white rounded-md shadow-[0_1px_1px_rgba(0,0,0,0.28)] flex items-center justify-center text-[13.5px] text-slate-500 font-medium active:bg-slate-100 transition-all cursor-pointer"
          >
            space
          </button>

          {/* Go / Action Button */}
          <button
            type="button"
            onClick={() => onSubmit?.()}
            className="w-[74px] h-[42px] bg-[#0055ff] rounded-md shadow-[0_1px_2px_rgba(0,85,255,0.35)] flex items-center justify-center text-[14px] font-bold text-white active:bg-blue-600 transition-all cursor-pointer"
          >
            {actionLabel}
          </button>
        </div>
      </div>

      {/* iOS Home Indicator Bar */}
      <div className="flex justify-center pt-2.5 pb-1">
        <div className="w-[134px] h-[4.5px] bg-slate-800/40 rounded-full" />
      </div>
    </div>
  )
}
