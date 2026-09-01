import { useRef, useState } from "react";
import type { ItemType, Severity, Status } from "../data/mockData";

interface CreateItemScreenProps {
  initialType?: ItemType;
  onBack: () => void;
  onSubmit: (
    type: ItemType,
    title: string,
    description: string,
    severity: Severity,
    dueDate: string,
    assignToMe: boolean,
  ) => void;
}

const itemTypeOptions: Array<{ type: ItemType; label: string; desc: string; color: string; bg: string }> = [
  { type: "task", label: "Task", desc: "General action item or milestone", color: "#0055ff", bg: "bg-blue-50 text-[#0055ff]" },
  { type: "issue", label: "Issue", desc: "Site clash, defect, or safety hazard", color: "#DC2626", bg: "bg-red-50 text-red-600" },
  { type: "rfi", label: "RFI", desc: "Request for Information from design team", color: "#D97706", bg: "bg-amber-50 text-amber-600" },
  { type: "fieldnote", label: "Field Note", desc: "Site observation or photo log", color: "#059669", bg: "bg-emerald-50 text-emerald-600" },
];

const availableMembers = [
  { id: "me", name: "Anil Kumar", role: "BIM Coordinator (You)", initials: "AK", color: "#0055ff" },
  { id: "sj", name: "Sarah Jenkins", role: "Structural Lead", initials: "SJ", color: "#8B5CF6" },
  { id: "dz", name: "David Zhang", role: "MEP Engineer", initials: "DZ", color: "#10B981" },
  { id: "pp", name: "Priya Patel", role: "Site Supervisor", initials: "PP", color: "#F59E0B" },
];

const priorities: Array<{ value: Severity; label: string; color: string }> = [
  { value: "LOW", label: "Low", color: "#2563EB" },
  { value: "MEDIUM", label: "Medium", color: "#D97706" },
  { value: "HIGH", label: "High", color: "#DC2626" },
];

const statuses: Array<{ value: Status; label: string; bg: string; text: string }> = [
  { value: "TO DO", label: "TO DO", bg: "bg-[#0F172A]", text: "text-white" },
  { value: "IN PROGRESS", label: "IN PROGRESS", bg: "bg-blue-600", text: "text-white" },
  { value: "COMPLETED", label: "COMPLETED", bg: "bg-emerald-600", text: "text-white" },
];

const quickTags = ["MEP", "Structural", "Level 03", "HVAC", "Safety", "Quality"];

export function CreateItemScreen({ initialType = "task", onBack, onSubmit }: CreateItemScreenProps) {
  const [selectedType, setSelectedType] = useState<ItemType>(initialType);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priorityIndex, setPriorityIndex] = useState(1);
  const [status, setStatus] = useState<Status>("TO DO");
  const [dueDate, setDueDate] = useState("");
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>(["me"]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [attachedPhotos, setAttachedPhotos] = useState<string[]>([]);

  // Popups and picker modal states
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isAssigneePickerOpen, setIsAssigneePickerOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isStatusPickerOpen, setIsStatusPickerOpen] = useState(false);
  const [isTagPickerOpen, setIsTagPickerOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const priority = priorities[priorityIndex];
  const canSubmit = title.trim().length > 0;

  const handleCreate = () => {
    if (!canSubmit) return;
    onSubmit(
      selectedType,
      title.trim(),
      description.trim(),
      priority.value,
      dueDate,
      selectedAssignees.includes("me")
    );
  };

  const toggleAssignee = (id: string) => {
    setSelectedAssignees((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newPhoto = URL.createObjectURL(e.target.files[0]);
      setAttachedPhotos((prev) => [...prev, newPhoto]);
    }
  };

  const setQuickDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const dateStr = d.toISOString().split("T")[0];
    setDueDate(dateStr);
    setIsDatePickerOpen(false);
  };

  const getTypeIcon = (type: ItemType) => {
    switch (type) {
      case "task":
        return (
          <svg width="13.5" height="13.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1.5" y="1.5" width="13" height="13" rx="3" />
            <path d="m4.8 8 2.2 2.2 4.2-4.5" />
          </svg>
        );
      case "issue":
        return (
          <svg width="13.5" height="13.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="8" cy="8" r="6.5" />
            <path d="M8 4.8v3.6" />
            <circle cx="8" cy="11.2" r=".9" fill="currentColor" stroke="none" />
          </svg>
        );
      case "rfi":
        return (
          <svg width="13.5" height="13.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round">
            <path d="M3.5 1.5h6l4 4v9h-10z" />
            <path d="M9.5 1.5v4h4" />
            <path d="M5.5 7.5h4M5.5 10.5h3.2" />
          </svg>
        );
      case "fieldnote":
        return (
          <svg width="13.5" height="13.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round">
            <path d="M2.8 2.2h7.8a1.5 1.5 0 0 1 1.5 1.5v9H4.2a1.5 1.5 0 0 1-1.4-1.5z" />
            <path d="m6.2 9.5 1-2.2 3.2-3.2.8.8-3.2 3.2z" fill="currentColor" stroke="none" />
          </svg>
        );
    }
  };

  const selectedTypeInfo = itemTypeOptions.find((t) => t.type === selectedType) || itemTypeOptions[0];

  return (
    <div className="absolute inset-0 z-50 flex items-end bg-black/45 backdrop-blur-2xs select-none animate-fade-in" role="dialog" aria-modal="true">
      <button type="button" onClick={onBack} className="absolute inset-0 cursor-default" aria-label="Close dialog" />

      <section
        className="relative z-10 flex h-[calc(100%_-_120px)] min-h-[580px] max-h-[740px] w-full flex-col overflow-hidden rounded-t-[26px] bg-white shadow-[0_-16px_40px_rgba(0,0,0,0.2)] border-t border-slate-100"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Top Sheet Header */}
        <div className="flex flex-col items-center pt-2.5 pb-2 px-4 border-b border-slate-100 relative">
          <div className="w-9 h-1 bg-slate-200 rounded-full mb-2" />
          
          <div className="w-full flex items-center justify-between">
            {/* Type Switcher Dropdown Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsTypeDropdownOpen((v) => !v)}
                className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100/90 px-3 py-1.2 rounded-full text-[12px] font-bold text-[#0055ff] transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                <span className="w-[14px] h-[14px] flex items-center justify-center">
                  {getTypeIcon(selectedType)}
                </span>
                <span>Create {selectedTypeInfo.label}</span>
                <svg width="8" height="5" viewBox="0 0 10 6" fill="none" className="ml-0.5">
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Type Switcher Dropdown Popover */}
              {isTypeDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsTypeDropdownOpen(false)} />
                  <div className="absolute top-full left-0 mt-1.5 w-60 bg-white rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.18)] border border-slate-100 p-1.5 z-40 animate-slide-up">
                    <div className="px-2 py-1 text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">
                      Select Item Type
                    </div>
                    <div className="space-y-0.5">
                      {itemTypeOptions.map((opt) => (
                        <button
                          type="button"
                          key={opt.type}
                          onClick={() => {
                            setSelectedType(opt.type);
                            setIsTypeDropdownOpen(false);
                          }}
                          className={`w-full p-2 rounded-xl flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                            selectedType === opt.type
                              ? "bg-blue-50 text-[#0055ff]"
                              : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${opt.bg}`}>
                            {getTypeIcon(opt.type)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-[12px] font-bold">{opt.label}</h4>
                            <p className="text-[9.5px] text-slate-400 truncate">{opt.desc}</p>
                          </div>
                          {selectedType === opt.type && (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0055ff" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right side Close Button */}
            <button
              type="button"
              onClick={onBack}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Sheet Scrollable Body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-3 pb-4 space-y-3">
          {/* Workspace Location Breadcrumb */}
          <div className="flex items-center gap-1.5 text-slate-500 text-[11.5px] font-medium">
            <span>In</span>
            <span className="text-[#0F172A] font-bold">Stalwart</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-400 font-mono text-[11px]">Level 03</span>
          </div>

          {/* Title Row with Type Icon */}
          <div className="flex items-start gap-2.5">
            <div className="mt-1 w-7 h-7 rounded-lg bg-blue-50 text-[#0055ff] flex items-center justify-center shrink-0">
              {getTypeIcon(selectedType)}
            </div>
            <textarea
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              rows={2}
              placeholder={`Untitled ${selectedTypeInfo.label}`}
              className="min-h-[48px] min-w-0 flex-1 resize-none bg-transparent text-[16px] font-bold leading-snug text-[#0F172A] outline-none placeholder:text-slate-400"
            />
          </div>

          {/* Description Textarea */}
          <div className="pl-9.5">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Tap to add a description..."
              className="w-full resize-none bg-transparent text-[12.5px] leading-relaxed text-[#1E293B] outline-none placeholder:text-slate-400 font-medium"
            />
          </div>

          {/* Property Rows: Assignee, Date, Tags (All Uniform 28px Icon Boxes and 12.5px Text) */}
          <div className="pl-9.5 divide-y divide-slate-100 border-t border-slate-100 pt-1 space-y-0.5">
            {/* Assignee Row */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsAssigneePickerOpen((v) => !v)}
                className="flex min-h-[38px] w-full items-center gap-2.5 text-left transition-colors hover:bg-slate-50 rounded-xl px-1.5 py-1 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0055ff] flex items-center justify-center shrink-0">
                  <svg width="13.5" height="13.5" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="7" r="3.8" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M4 17c.4-3.4 2.5-4.8 6-4.8s5.6 1.4 6 4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>
                
                <div className="min-w-0 flex-1 flex items-center gap-1.5 flex-wrap">
                  {selectedAssignees.length === 0 ? (
                    <span className="text-[12.5px] font-semibold text-slate-500">Add assignees</span>
                  ) : (
                    selectedAssignees.map((id) => {
                      const member = availableMembers.find((m) => m.id === id);
                      if (!member) return null;
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold"
                        >
                          <span
                            className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[8.5px] font-extrabold text-white"
                            style={{ backgroundColor: member.color }}
                          >
                            {member.initials}
                          </span>
                          <span>{member.name}</span>
                        </span>
                      );
                    })
                  )}
                </div>

                <span className="text-slate-400 text-[13px] font-bold">›</span>
              </button>

              {/* Assignee Picker Dropdown */}
              {isAssigneePickerOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsAssigneePickerOpen(false)} />
                  <div className="absolute top-full left-0 mt-1 w-60 bg-white rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.18)] border border-slate-100 p-2 z-40 animate-slide-up">
                    <div className="px-2 py-1 text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">
                      Assign Team Members
                    </div>
                    <div className="space-y-0.5">
                      {availableMembers.map((m) => {
                        const isAssigned = selectedAssignees.includes(m.id);
                        return (
                          <button
                            type="button"
                            key={m.id}
                            onClick={() => toggleAssignee(m.id)}
                            className={`w-full p-2 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer ${
                              isAssigned ? "bg-blue-50 text-[#0055ff]" : "hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="w-6 h-6 rounded-full flex items-center justify-center text-[8.5px] font-extrabold text-white"
                                style={{ backgroundColor: m.color }}
                              >
                                {m.initials}
                              </span>
                              <div>
                                <h4 className="text-[12px] font-bold leading-tight">{m.name}</h4>
                                <p className="text-[9.5px] text-slate-400 leading-tight">{m.role}</p>
                              </div>
                            </div>
                            {isAssigned && (
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0055ff" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Date Row */}
            <div className="relative pt-0.5">
              <button
                type="button"
                onClick={() => setIsDatePickerOpen((v) => !v)}
                className="flex min-h-[38px] w-full items-center gap-2.5 text-left transition-colors hover:bg-slate-50 rounded-xl px-1.5 py-1 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0055ff] flex items-center justify-center shrink-0">
                  <svg width="13.5" height="13.5" viewBox="0 0 20 20" fill="none">
                    <rect x="3" y="4" width="14" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M6 2.5v3M14 2.5v3M3 8h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>
                
                <span className={`text-[12.5px] font-semibold flex-1 ${dueDate ? "text-[#0F172A] font-bold" : "text-slate-500"}`}>
                  {dueDate
                    ? new Date(`${dueDate}T00:00:00`).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "Set dates"}
                </span>

                {dueDate ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDueDate("");
                    }}
                    className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[9px] hover:bg-slate-300"
                  >
                    ✕
                  </button>
                ) : (
                  <span className="text-slate-400 text-[13px] font-bold">›</span>
                )}
              </button>

              {/* Date Quick Picker Dropdown */}
              {isDatePickerOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsDatePickerOpen(false)} />
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.18)] border border-slate-100 p-2 z-40 animate-slide-up space-y-0.5">
                    <div className="px-2 py-1 text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">
                      Due Date
                    </div>
                    <button
                      type="button"
                      onClick={() => setQuickDate(0)}
                      className="w-full px-2.5 py-1.5 rounded-lg text-left text-[11.5px] font-bold text-slate-700 hover:bg-blue-50 hover:text-[#0055ff]"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDate(1)}
                      className="w-full px-2.5 py-1.5 rounded-lg text-left text-[11.5px] font-bold text-slate-700 hover:bg-blue-50 hover:text-[#0055ff]"
                    >
                      Tomorrow
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDate(7)}
                      className="w-full px-2.5 py-1.5 rounded-lg text-left text-[11.5px] font-bold text-slate-700 hover:bg-blue-50 hover:text-[#0055ff]"
                    >
                      Next Week (+7 days)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsDatePickerOpen(false);
                        dateInputRef.current?.showPicker?.();
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg text-left text-[11.5px] font-bold text-[#0055ff] hover:bg-blue-50 border-t border-slate-100"
                    >
                      Custom calendar...
                    </button>
                  </div>
                </>
              )}

              <input
                ref={dateInputRef}
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="pointer-events-none absolute h-0 w-0 opacity-0"
                tabIndex={-1}
              />
            </div>

            {/* Tags Row */}
            <div className="relative pt-0.5">
              <button
                type="button"
                onClick={() => setIsTagPickerOpen((v) => !v)}
                className="flex min-h-[38px] w-full items-center gap-2.5 text-left transition-colors hover:bg-slate-50 rounded-xl px-1.5 py-1 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0055ff] flex items-center justify-center shrink-0">
                  <svg width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
                    <path d="m3 14 10-10h7v7L10 21a2.5 2.5 0 0 1-3.5 0L3 17.5A2.5 2.5 0 0 1 3 14Z" />
                    <circle cx="16.5" cy="7.5" r="1.5" fill="currentColor" />
                  </svg>
                </div>
                
                <div className="min-w-0 flex-1 flex items-center gap-1.5 flex-wrap">
                  {selectedTags.length === 0 ? (
                    <span className="text-[12.5px] font-semibold text-slate-500">Add tags</span>
                  ) : (
                    selectedTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-[#0055ff] text-[11px] font-bold"
                      >
                        #{tag}
                      </span>
                    ))
                  )}
                </div>

                <span className="text-slate-400 text-[13px] font-bold">›</span>
              </button>

              {/* Tag Picker Popover */}
              {isTagPickerOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsTagPickerOpen(false)} />
                  <div className="absolute top-full left-0 mt-1 w-60 bg-white rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.18)] border border-slate-100 p-2.5 z-40 animate-slide-up">
                    <div className="px-1 py-1 text-[9.5px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Select Tags
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {quickTags.map((tag) => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                          <button
                            type="button"
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#0055ff] text-white shadow-2xs"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            #{tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Attached Photos Preview */}
            {attachedPhotos.length > 0 && (
              <div className="pt-2 flex items-center gap-2 overflow-x-auto py-1">
                {attachedPhotos.map((url, idx) => (
                  <div key={idx} className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                    <img src={url} alt="Attached" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setAttachedPhotos((prev) => prev.filter((_, i) => i !== idx))}
                      className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 text-white text-[9px] flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Toolbar & Create Action (Uniformly Sized 28px) */}
        <div className="flex h-[50px] shrink-0 items-center gap-1.5 border-t border-slate-100 bg-slate-50/80 px-4">
          {/* Status Badge with Picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsStatusPickerOpen((v) => !v)}
              className="flex h-[28px] items-center gap-1.5 rounded-full bg-[#0F172A] px-2.5 text-[10px] font-bold text-white shadow-2xs cursor-pointer hover:opacity-90 active:scale-95"
            >
              <span className="w-1.5 h-1.5 rounded-full border border-white/80" />
              <span>{status}</span>
            </button>

            {isStatusPickerOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsStatusPickerOpen(false)} />
                <div className="absolute bottom-full left-0 mb-2 w-36 bg-white rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.16)] border border-slate-100 p-1 z-40 space-y-0.5">
                  {statuses.map((st) => (
                    <button
                      type="button"
                      key={st.value}
                      onClick={() => {
                        setStatus(st.value);
                        setIsStatusPickerOpen(false);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg text-left text-[11px] font-bold text-slate-800 hover:bg-slate-100 flex items-center justify-between"
                    >
                      <span>{st.label}</span>
                      {status === st.value && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0055ff]" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <span className="h-4 w-px bg-slate-200 mx-0.5" />

          {/* Priority Toggle Flag Button */}
          <button
            type="button"
            onClick={() => setPriorityIndex((current) => (current + 1) % priorities.length)}
            className="flex h-[28px] w-[28px] items-center justify-center rounded-lg hover:bg-slate-200/80 active:scale-95 transition-all cursor-pointer"
            title={`Priority: ${priority.label} (Tap to change)`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M4 15s1-0.8 4-0.8 5 1.6 8 1.6 4-0.8 4-0.8V3s-1 0.8-4 0.8-5-1.6-8-1.6-4 0.8-4 0.8z" fill={priority.color} />
              <line x1="4" y1="22" x2="4" y2="2" stroke={priority.color} strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>

          {/* Attach Photo Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-[28px] w-[28px] items-center justify-center rounded-lg text-slate-500 hover:text-[#0055ff] hover:bg-blue-50 active:scale-95 transition-all cursor-pointer"
            aria-label="Attach photo"
            title="Attach photo"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 12.5 15.5 6a3.2 3.2 0 0 1 4.5 4.5l-8.8 8.8a5.2 5.2 0 0 1-7.4-7.4l9-9" />
            </svg>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />

          {/* Quick Tag Button */}
          <button
            type="button"
            onClick={() => setIsTagPickerOpen(true)}
            className={`flex h-[28px] w-[28px] items-center justify-center rounded-lg transition-all cursor-pointer active:scale-95 ${
              selectedTags.length > 0 ? "text-[#0055ff] bg-blue-50" : "text-slate-500 hover:text-[#0055ff] hover:bg-blue-50"
            }`}
            aria-label="Add tag"
            title="Add tag"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
              <path d="m3 14 10-10h7v7L10 21a2.5 2.5 0 0 1-3.5 0L3 17.5A2.5 2.5 0 0 1 3 14Z" />
              <circle cx="16.5" cy="7.5" r="1.5" fill="currentColor" />
            </svg>
          </button>

          {/* Quick Date Button */}
          <button
            type="button"
            onClick={() => setIsDatePickerOpen(true)}
            className={`flex h-[28px] w-[28px] items-center justify-center rounded-lg transition-all cursor-pointer active:scale-95 ${
              dueDate ? "text-[#0055ff] bg-blue-50" : "text-slate-500 hover:text-[#0055ff] hover:bg-blue-50"
            }`}
            aria-label="Set due date"
            title="Set due date"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 3h14M5 21h14M7 3c0 5 3.5 5.5 5 9-1.5 3.5-5 4-5 9M17 3c0 5-3.5 5.5-5 9 1.5 3.5 5 4 5 9" />
            </svg>
          </button>

          {/* Create Button */}
          <button
            type="button"
            onClick={handleCreate}
            disabled={!canSubmit}
            className={`ml-auto h-[28px] px-3.5 rounded-full text-[11.5px] font-bold transition-all ${
              canSubmit
                ? "bg-[#0055ff] hover:bg-blue-600 active:scale-95 text-white shadow-xs shadow-blue-500/25 cursor-pointer"
                : "bg-slate-200/80 text-slate-400 cursor-not-allowed"
            }`}
          >
            Create
          </button>
        </div>
      </section>
    </div>
  );
}
