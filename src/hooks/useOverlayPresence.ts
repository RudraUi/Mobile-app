import { useEffect, useState } from "react"

// Keep a dismissed overlay visible only long enough to finish its exit motion.
// Reopening cancels the pending removal; callers make the closing tree inert.
export default function useOverlayPresence(isOpen: boolean) {
  const [isPresent, setIsPresent] = useState(isOpen)

  useEffect(() => {
    if (isOpen) {
      setIsPresent(true)
      return
    }

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (motionPreference.matches) {
      setIsPresent(false)
      return
    }

    // Matches the shared overlay exit duration in index.css.
    const timer = window.setTimeout(() => setIsPresent(false), 180)
    const finishIfReduced = () => {
      if (motionPreference.matches) setIsPresent(false)
    }
    motionPreference.addEventListener("change", finishIfReduced)
    return () => {
      window.clearTimeout(timer)
      motionPreference.removeEventListener("change", finishIfReduced)
    }
  }, [isOpen])

  return isOpen || isPresent
}
