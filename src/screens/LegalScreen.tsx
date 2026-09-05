import { useRef, useState } from "react"
import { BackButton } from "../components/BackButton"
import { Chip } from "../components/Chip"
import { legalDocuments } from "../data/supportData"

interface LegalScreenProps {
  doc: "terms" | "privacy"
  onBack: () => void
  /** Jump straight to the other document without going back first. */
  onSwitchDoc: (doc: "terms" | "privacy") => void
}

/**
 * Renders the Terms and the Privacy Policy from the same shell — the two
 * documents differ only in content, so they share the section navigator,
 * scroll behaviour and typography.
 */
export function LegalScreen({ doc, onBack, onSwitchDoc }: LegalScreenProps) {
  const document = legalDocuments[doc]
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeSection, setActiveSection] = useState(document.sections[0].id)

  const jumpTo = (id: string) => {
    setActiveSection(id)
    const container = scrollRef.current
    const target = container?.querySelector<HTMLElement>(`#legal-${id}`)
    if (container && target) {
      container.scrollTo({
        top: Math.max(0, target.offsetTop - 12),
        behavior: "smooth",
      })
    }
  }

  return (
    <div className="ui-screen relative flex h-full flex-col overflow-hidden select-none">
      <header className="ui-divider shrink-0 border-b px-4 py-3">
        <div className="flex items-center gap-2.5">
          <BackButton onClick={onBack} />
          <div className="min-w-0 flex-1">
            <h1 className="ui-text text-[16px] font-bold leading-tight tracking-tight">
              {document.title}
            </h1>
            <p className="ui-text-dim text-[11px] font-medium leading-tight">
              Last updated {document.updated}
            </p>
          </div>
          <Chip
            size="sm"
            onClick={() => onSwitchDoc(doc === "terms" ? "privacy" : "terms")}
          >
            {doc === "terms" ? "Privacy" : "Terms"}
          </Chip>
        </div>

        {/* Section navigator */}
        <div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {document.sections.map((section, index) => (
            <Chip
              key={section.id}
              selected={activeSection === section.id}
              onClick={() => jumpTo(section.id)}
            >
              {`${index + 1}. ${section.heading.replace(/^\d+\.\s*/, "")}`}
            </Chip>
          ))}
        </div>
      </header>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto px-4 pb-12 pt-3"
      >
        <p className="ui-text-muted text-[12.5px] font-medium leading-[18px]">
          {document.summary}
        </p>

        <div className="ui-divider mt-3.5 divide-y border-t [&>*]:border-inherit">
          {document.sections.map((section) => (
            <section
              key={section.id}
              id={`legal-${section.id}`}
              className="ui-divider scroll-mt-3 py-4"
            >
              <h2 className="ui-text text-[13px] font-bold leading-snug">
                {section.heading}
              </h2>
              <div className="mt-1.5 space-y-2">
                {section.paragraphs.map((paragraph, i) => (
                  <p
                    key={i}
                    className="ui-text-muted text-[12px] leading-[18px]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="ui-text-dim mt-4 text-[10.5px] leading-[15px]">
          This document is provided for reference inside the app. Where it
          conflicts with the signed agreement held by your organisation, that
          agreement takes precedence.
        </p>
      </div>
    </div>
  )
}

export default LegalScreen
