import { useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent, ReactNode } from "react";
import type { Item, Severity, Status } from "../data/mockData";

interface ItemDetailScreenProps {
  item: Item;
  onBack: () => void;
  onNavigate: (item: Item) => void;
  onUpdate: (id: string, changes: Partial<Item>) => void;
}

type DetailTab = "details" | "activity";

const statusOrder: Status[] = ["TO DO", "IN PROGRESS", "REVIEW", "COMPLETED"];
const priorityOrder: Severity[] = ["LOW", "MEDIUM", "HIGH"];

const defaultSitePhotos = [
  "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1000&h=700&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1000&h=700&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?w=1000&h=700&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=1000&h=700&fit=crop&auto=format",
];

function DeviceStatusBar() {
  return (
    <div className="relative h-[48px] shrink-0 text-[#1E293B]" aria-hidden="true">
      <div className="absolute left-[24px] top-[14px] flex items-center gap-[7px]">
        <span className="text-[16.5px] font-semibold leading-none">9:41</span>
        <span className="h-[14px] w-[14px] rounded-full bg-[#1E293B]" />
      </div>
      <div className="absolute right-[20px] top-[14px] flex items-center gap-[6px]">
        <svg width="11" height="15" viewBox="0 0 12 17" fill="none">
          <path d="m6 1 4 4-4 3V1Zm0 7v8l4-4-4-4ZM6 8 2.5 4.8M6 8l-3.5 3.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <svg width="15" height="13" viewBox="0 0 17 14" fill="currentColor">
          <path d="M.5 3.8A12 12 0 0 1 16.5 3.8L8.5 13z" />
        </svg>
        <span className="flex items-end gap-[2px]">
          <span className="h-[5px] w-[3.5px] bg-current" />
          <span className="h-[7.5px] w-[3.5px] bg-current" />
          <span className="h-[10px] w-[3.5px] bg-current" />
        </span>
        <svg width="13" height="16" viewBox="0 0 14 18" fill="currentColor">
          <rect x="2" y="2" width="10" height="15" rx="1.5" />
          <rect x="4.5" width="5" height="3" rx="1" />
        </svg>
        <span className="text-[14.5px] font-semibold leading-none">79%</span>
      </div>
    </div>
  );
}

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="m14 3-8 8 8 8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg width="22" height="7" viewBox="0 0 25 8" fill="currentColor" aria-hidden="true">
      <circle cx="3.5" cy="4" r="2.3" />
      <circle cx="12.5" cy="4" r="2.3" />
      <circle cx="21.5" cy="4" r="2.3" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="20" height="22" viewBox="0 0 23 25" fill="none" aria-hidden="true">
      <path d="M11.5 16V2M6.5 7l5-5 5 5M4 10v10.5c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TimerIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="13" r="7.3" stroke="currentColor" strokeWidth="2" />
      <path d="M9 2h6M12 6V3M17.4 7.6l1.8-1.8M12 9v4l3 1.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TaskGlyph({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="m1.8 5.2 1.4 1.4 2.3-2.5M1.8 10.1l1.4 1.4L5.5 9M1.8 15l1.4 1.4 2.3-2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 5.5h9M8 10.4h9M8 15.3h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ChipIcon({ type }: { type: string }) {
  const shared = { width: 14, height: 14, viewBox: "0 0 20 20", fill: "none" };
  if (type === "status") {
    return <svg {...shared}><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2" strokeDasharray="3 2" /></svg>;
  }
  if (type === "assignee") {
    return <svg {...shared}><circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="1.7" /><path d="M3.7 17c.5-3.5 2.6-5.2 6.3-5.2s5.8 1.7 6.3 5.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>;
  }
  if (type === "date") {
    return <svg {...shared}><rect x="3" y="4" width="14" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.7" /><path d="M6 2.5v3M14 2.5v3M3 8h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>;
  }
  if (type === "priority") {
    return <svg {...shared}><path d="M5 18V3.5c4-2.5 6 2.5 10 0v8c-4 2.5-6-2.5-10 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  }
  if (type === "time") {
    return <svg {...shared}><circle cx="10" cy="11" r="6" stroke="currentColor" strokeWidth="1.7" /><path d="M7 2.5h6M10 5V2.5M10 8v3l2 1.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>;
  }
  if (type === "points") {
    return <svg {...shared}><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.7" /><path d="m10 5.7 1.3 2.6 2.9.4-2.1 2 .5 2.9-2.6-1.4-2.6 1.4.5-2.9-2.1-2 2.9-.4z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>;
  }
  if (type === "estimate") {
    return <svg {...shared}><path d="M5 3h10M5 17h10M6 3c0 4 3 4.3 4 7-1 2.7-4 3-4 7M14 3c0 4-3 4.3-4 7 1 2.7 4 3 4 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>;
  }
  return <svg {...shared}><path d="m3 11 8-8h5v5l-8 8a2.1 2.1 0 0 1-3 0l-2-2a2.1 2.1 0 0 1 0-3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><circle cx="13.5" cy="5.5" r="1" fill="currentColor" /></svg>;
}

function DetailSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="px-[16px] py-[18px]">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-extrabold text-[#1E293B] tracking-tight">{title}</h3>
        {action}
      </div>
      <div className="mt-[14px]">{children}</div>
    </section>
  );
}

function Divider() {
  return <div className="h-[8px] shrink-0 bg-[#F8FAFC] border-y border-slate-100/80" />;
}

export function ItemDetailScreen({ item, onBack, onNavigate, onUpdate }: ItemDetailScreenProps) {
  const [tab, setTab] = useState<DetailTab>("details");
  const [comment, setComment] = useState("");
  const [description, setDescription] = useState(item.description);
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [checklists, setChecklists] = useState<string[]>([]);
  const [relationships, setRelationships] = useState<string[]>([]);
  const [photos, setPhotos] = useState(item.photos);
  const [showUpdates, setShowUpdates] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayPhotos = photos && photos.length > 0 ? photos : defaultSitePhotos;

  const cycleStatus = () => {
    const current = statusOrder.indexOf(item.status);
    onUpdate(item.id, { status: statusOrder[(current + 1) % statusOrder.length] });
  };

  const cyclePriority = () => {
    const current = priorityOrder.indexOf(item.severity);
    onUpdate(item.id, { severity: priorityOrder[(current + 1) % priorityOrder.length] });
  };

  const saveDescription = () => {
    if (description !== item.description) onUpdate(item.id, { description });
  };

  const addAttachment = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const next = [URL.createObjectURL(file), ...photos];
    setPhotos(next);
    onUpdate(item.id, { photos: next });
  };

  const addComment = () => {
    const value = comment.trim();
    if (!value) return;
    onUpdate(item.id, {
      activity: [
        ...item.activity,
        {
          id: `comment-${Date.now()}`,
          text: value,
          date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        },
      ],
    });
    setComment("");
  };

  const handleCommentKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") addComment();
  };

  // Dynamic Priority Styles with refined tone and color fade
  const getPriorityStyle = (severity: Severity) => {
    switch (severity) {
      case "HIGH":
        return {
          container: "bg-red-50/90 text-red-700 border border-red-200/90 shadow-2xs",
          dot: "#DC2626",
          iconColor: "text-red-600",
        };
      case "MEDIUM":
        return {
          container: "bg-amber-50/90 text-amber-800 border border-amber-200/90 shadow-2xs",
          dot: "#D97706",
          iconColor: "text-amber-600",
        };
      case "LOW":
        return {
          container: "bg-blue-50/90 text-blue-700 border border-blue-200/90 shadow-2xs",
          dot: "#2563EB",
          iconColor: "text-blue-600",
        };
    }
  };

  // Dynamic Status Badge Styles
  const getStatusStyle = (status: Status) => {
    switch (status) {
      case "TO DO":
        return "bg-[#0F172A] text-white shadow-2xs";
      case "IN PROGRESS":
        return "bg-[#0055ff] text-white shadow-2xs shadow-blue-500/25";
      case "REVIEW":
        return "bg-indigo-600 text-white shadow-2xs";
      case "COMPLETED":
        return "bg-emerald-600 text-white shadow-2xs";
    }
  };

  const priorityStyle = getPriorityStyle(item.severity);

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-white text-[#1E293B]">
      <DeviceStatusBar />

      {/* Top Header Bar */}
      <header className="shrink-0 border-b border-slate-100 bg-white">
        <div className="flex h-[44px] items-center px-[16px] text-[#334155]">
          <button
            type="button"
            onClick={onBack}
            className="flex h-8 w-8 items-center justify-start cursor-pointer hover:text-[#0F172A] active:scale-95 transition-all"
            aria-label="Back"
          >
            <BackIcon />
          </button>
          <h1 className="ml-[2px] min-w-0 flex-1 truncate pr-2 text-[16px] font-bold text-[#0F172A]">
            {tab === "activity" ? item.title : ""}
          </h1>
          <div className="flex items-center gap-[15px]">
            <button
              type="button"
              onClick={() => onNavigate(item)}
              className="text-[#334155] hover:text-[#0055ff] active:scale-95 transition-all cursor-pointer"
              aria-label="Navigate to task"
            >
              <TimerIcon />
            </button>
            <button
              type="button"
              className="text-[#334155] hover:text-[#0055ff] active:scale-95 transition-all cursor-pointer"
              aria-label="Share task"
            >
              <ShareIcon />
            </button>
            <button
              type="button"
              className="text-[#334155] hover:text-[#0055ff] active:scale-95 transition-all cursor-pointer"
              aria-label="More options"
            >
              <MoreIcon />
            </button>
          </div>
        </div>

        {/* Details & Activity Tabs */}
        <div className="grid h-[42px] grid-cols-2 border-t border-slate-50">
          {(["details", "activity"] as DetailTab[]).map((value) => {
            const active = tab === value;
            return (
              <button
                type="button"
                key={value}
                onClick={() => setTab(value)}
                className={`relative text-[15px] capitalize cursor-pointer transition-colors ${
                  active ? "text-[#0055ff] font-extrabold" : "text-[#64748B] font-semibold hover:text-[#1E293B]"
                }`}
              >
                {value}
                {active && <span className="absolute inset-x-0 bottom-0 h-[2.5px] bg-[#0055ff] rounded-t-full" />}
              </button>
            );
          })}
        </div>
      </header>

      {tab === "details" ? (
        <div className="min-h-0 flex-1 overflow-y-auto bg-white">
          <section className="px-[16px] pb-[14px] pt-[14px]">
            {/* Breadcrumb Hierarchy */}
            <div className="flex items-center gap-[6px] text-[#475569]">
              <span className="flex h-[22px] w-[22px] items-center justify-center rounded-[6px] bg-[#0055ff] text-[12px] font-extrabold text-white shadow-2xs">
                S
              </span>
              <span className="text-[14px] font-bold text-[#0F172A]">Stalwart</span>
              <span className="mx-[1px] text-[16px] font-normal text-[#94A3B8]">/</span>
              <span className="text-[#0055ff]"><TaskGlyph size={16} /></span>
              <span className="text-[13.5px] font-bold font-mono text-[#0055ff]">{item.id}</span>
              <button type="button" className="ml-[3px] text-[20px] font-light leading-none text-[#64748B] hover:text-[#0F172A]" aria-label="Add to task">+</button>
            </div>

            {/* Main Title */}
            <h2 className="mt-[14px] text-[20px] font-black leading-[1.3] tracking-tight text-[#0F172A]">
              {item.title}
            </h2>

            {/* Bluish Dark Tone Chips & Priority Tone */}
            <div className="mt-[12px] flex flex-wrap gap-[6px]">
              {/* Status Chip */}
              <button
                type="button"
                onClick={cycleStatus}
                className={`flex h-[28px] items-center gap-[5px] rounded-[7px] px-[8px] text-[11px] font-bold leading-none cursor-pointer active:scale-95 transition-transform ${getStatusStyle(item.status)}`}
              >
                <ChipIcon type="status" />
                <span className="whitespace-nowrap">{item.status}</span>
              </button>

              {/* Assignees Chip */}
              <button
                type="button"
                className="flex h-[28px] items-center gap-[5px] rounded-[7px] px-[8px] text-[11px] font-bold leading-none bg-[#F0F4F9] hover:bg-[#E2E8F0] active:scale-95 border border-[#D8E2EE] text-[#1E293B] transition-all cursor-pointer"
              >
                <ChipIcon type="assignee" />
                <span className="whitespace-nowrap">
                  {item.assignees.length ? `${item.assignees.length} Assignees` : "Assignees"}
                </span>
              </button>

              {/* Dates Chip */}
              <button
                type="button"
                className="flex h-[28px] items-center gap-[5px] rounded-[7px] px-[8px] text-[11px] font-bold leading-none bg-[#F0F4F9] hover:bg-[#E2E8F0] active:scale-95 border border-[#D8E2EE] text-[#1E293B] transition-all cursor-pointer"
              >
                <ChipIcon type="date" />
                <span className="whitespace-nowrap">{item.dueDate ? "Dates" : "Add dates"}</span>
              </button>

              {/* Priority Chip with specific tone fade */}
              <button
                type="button"
                onClick={cyclePriority}
                className={`flex h-[28px] items-center gap-[5px] rounded-[7px] px-[8px] text-[11px] font-bold leading-none cursor-pointer active:scale-95 transition-all ${priorityStyle.container}`}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: priorityStyle.dot }} />
                <span className="whitespace-nowrap">{item.severity} Priority</span>
              </button>

              {/* Track Time */}
              <button
                type="button"
                className="flex h-[28px] items-center gap-[5px] rounded-[7px] px-[8px] text-[11px] font-bold leading-none bg-[#F0F4F9] hover:bg-[#E2E8F0] active:scale-95 border border-[#D8E2EE] text-[#1E293B] transition-all cursor-pointer"
              >
                <ChipIcon type="time" />
                <span className="whitespace-nowrap">Track time</span>
              </button>

              {/* Sprint Points */}
              <button
                type="button"
                className="flex h-[28px] items-center gap-[5px] rounded-[7px] px-[8px] text-[11px] font-bold leading-none bg-[#F0F4F9] hover:bg-[#E2E8F0] active:scale-95 border border-[#D8E2EE] text-[#1E293B] transition-all cursor-pointer"
              >
                <ChipIcon type="points" />
                <span className="whitespace-nowrap">Sprint points</span>
              </button>

              {/* Time Estimate */}
              <button
                type="button"
                className="flex h-[28px] items-center gap-[5px] rounded-[7px] px-[8px] text-[11px] font-bold leading-none bg-[#F0F4F9] hover:bg-[#E2E8F0] active:scale-95 border border-[#D8E2EE] text-[#1E293B] transition-all cursor-pointer"
              >
                <ChipIcon type="estimate" />
                <span className="whitespace-nowrap">Time estimate</span>
              </button>

              {/* Tags */}
              <button
                type="button"
                className="flex h-[28px] items-center gap-[5px] rounded-[7px] px-[8px] text-[11px] font-bold leading-none bg-[#F0F4F9] hover:bg-[#E2E8F0] active:scale-95 border border-[#D8E2EE] text-[#1E293B] transition-all cursor-pointer"
              >
                <ChipIcon type="tags" />
                <span className="whitespace-nowrap">{item.tags?.length ? `${item.tags.length} Tags` : "Tags"}</span>
              </button>
            </div>
          </section>

          {/* Inspection Image Preview Section */}
          <div className="px-[16px] mb-3">
            <div
              onClick={() => {
                setActivePhotoIndex(0);
                setIsModalOpen(true);
              }}
              className="group relative h-[180px] w-full overflow-hidden rounded-2xl bg-slate-100 shadow-sm cursor-pointer"
            >
              <img
                src={displayPhotos[0]}
                alt="Task capture preview"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-md">
                  Photo 1 of {displayPhotos.length}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePhotoIndex(0);
                    setIsModalOpen(true);
                  }}
                  className="rounded-full bg-white/95 px-3 py-1 text-[11.5px] font-bold text-[#0F172A] shadow-md backdrop-blur-md transition-colors hover:bg-white active:scale-95 cursor-pointer"
                >
                  Show More
                </button>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="border-y border-slate-100 px-[16px] py-[16px] bg-slate-50/40">
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              onBlur={saveDescription}
              placeholder="Add description..."
              rows={3}
              className="w-full resize-none bg-transparent text-[14px] leading-relaxed text-[#1E293B] outline-none placeholder:text-[#94A3B8] font-normal"
            />
          </div>

          <Divider />
          <DetailSection title="Subtasks">
            <div className="space-y-[8px]">
              {subtasks.map((subtask) => (
                <p key={subtask} className="pl-[28px] text-[13.5px] font-semibold text-[#334155]">{subtask}</p>
              ))}
              <button
                type="button"
                onClick={() => setSubtasks((current) => [...current, `New subtask ${current.length + 1}`])}
                className="flex items-center gap-[8px] text-[13px] font-bold text-[#0055ff] hover:underline cursor-pointer"
              >
                <span className="text-[18px] font-light leading-none">+</span>
                <span>Add Subtask</span>
              </button>
            </div>
          </DetailSection>

          <Divider />
          <DetailSection title="Checklists">
            <div className="space-y-[8px]">
              {checklists.map((checklist) => (
                <p key={checklist} className="pl-[28px] text-[13.5px] font-semibold text-[#334155]">{checklist}</p>
              ))}
              <button
                type="button"
                onClick={() => setChecklists((current) => [...current, `Checklist ${current.length + 1}`])}
                className="flex items-center gap-[8px] text-[13px] font-bold text-[#0055ff] hover:underline cursor-pointer"
              >
                <span className="text-[18px] font-light leading-none">+</span>
                <span>Add Checklist</span>
              </button>
            </div>
          </DetailSection>

          <Divider />
          <DetailSection
            title="Relationships"
            action={<svg width="16" height="16" viewBox="0 0 19 19" fill="none"><path d="m7 3 6 6.5L7 16" stroke="#64748B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          >
            <div className="space-y-[8px]">
              {relationships.map((relationship) => (
                <p key={relationship} className="pl-[28px] text-[13.5px] font-semibold text-[#334155]">{relationship}</p>
              ))}
              <button
                type="button"
                onClick={() => setRelationships((current) => [...current, `Related task ${current.length + 1}`])}
                className="flex items-center gap-[8px] text-[13px] font-bold text-[#0055ff] hover:underline cursor-pointer"
              >
                <span className="text-[18px] font-light leading-none">+</span>
                <span>Add Relationships</span>
              </button>
            </div>
          </DetailSection>

          <Divider />
          <DetailSection
            title="Attachments"
            action={<svg width="16" height="16" viewBox="0 0 19 19" fill="none"><path d="m7 3 6 6.5L7 16" stroke="#64748B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          >
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={addAttachment} />
            <div className="flex gap-[8px] overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-[48px] min-w-[120px] items-center gap-[8px] rounded-[10px] border border-slate-200 bg-slate-50/70 hover:bg-slate-100 px-[10px] text-left text-[12px] font-bold text-[#334155] transition-colors cursor-pointer"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white border border-slate-200 text-[16px] font-light text-[#0055ff]">+</span>
                <span>Add file</span>
              </button>
              {photos.map((photo, index) => (
                <div key={photo} className="flex h-[48px] min-w-[120px] items-center gap-[8px] rounded-[10px] border border-slate-200 bg-white px-[8px] shadow-2xs">
                  <img src={photo} alt="" className="h-[32px] w-[32px] rounded-md object-cover" />
                  <span className="truncate text-[11.5px] font-bold text-[#1E293B]">Photo {index + 1}.png</span>
                </div>
              ))}
            </div>
          </DetailSection>
          <div className="h-[18px]" />
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col bg-white">
          <div className="min-h-0 flex-1 overflow-y-auto px-[14px] pb-[12px]">
            <div className="flex min-h-full flex-col justify-end">
              <button
                type="button"
                onClick={() => setShowUpdates((current) => !current)}
                className="mb-[14px] flex h-[38px] items-center gap-[12px] px-[10px] text-[14px] font-bold text-[#334155]"
              >
                <svg width="18" height="18" viewBox="0 0 21 21" fill="none" aria-hidden="true">
                  <path d="M1 12h3l2-7 4 13 3-10 2 4h5" stroke="#334155" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Show {item.activity.length} updates</span>
                <svg className="ml-auto" width="16" height="16" viewBox="0 0 18 18" fill="none" style={{ transform: showUpdates ? "rotate(180deg)" : "none" }}>
                  <path d="m4 7 5 5 5-5" stroke="#334155" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {showUpdates && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 px-[16px] py-[16px]">
                  {item.activity.length === 0 ? (
                    <p className="text-[13px] text-[#64748B]">No updates yet.</p>
                  ) : (
                    <div className="space-y-[18px]">
                      {item.activity.slice(-2).map((entry, index) => (
                        <div key={entry.id} className="flex items-start gap-[12px]">
                          {index === 0 ? (
                            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" className="mt-[2px] shrink-0 text-[#64748B]">
                              <path d="M4 5h10M4 9h7M4 13h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" className="mt-[2px] shrink-0 text-[#64748B]">
                              <path d="M6.2 9.3v3.2a3 3 0 0 0 6 0V6a4.2 4.2 0 0 0-8.4 0v7.2a5.2 5.2 0 0 0 10.4 0V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          )}
                          <p className="text-[13.5px] leading-[1.45] text-[#1E293B]">
                            <span className="font-bold text-[#0F172A]">ANIL KUMAR PATRA</span> {entry.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Comment Input */}
          <div className="shrink-0 rounded-t-[24px] border border-slate-200 bg-white px-[14px] pb-[16px] pt-[12px] shadow-sm">
            <div className="flex items-center gap-[12px]">
              <button
                type="button"
                className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-[22px] font-light text-[#334155] transition-colors"
                aria-label="Add attachment"
              >
                +
              </button>
              <input
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                onKeyDown={handleCommentKeyDown}
                placeholder="Write a comment..."
                className="min-w-0 flex-1 bg-transparent text-[14px] text-[#0F172A] outline-none placeholder:text-[#94A3B8] font-medium"
              />
              <button
                type="button"
                onClick={addComment}
                className="text-[13px] font-bold text-[#0055ff] disabled:opacity-30 hover:underline cursor-pointer"
                disabled={!comment.trim()}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Slider Modal */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 select-none backdrop-blur-xs animate-fade-in"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(false);
            }}
            className="absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-colors hover:bg-white/30 active:scale-95 cursor-pointer"
            aria-label="Close image preview"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Previous Arrow */}
          {displayPhotos.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : displayPhotos.length - 1));
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-colors hover:bg-white/30 active:scale-95 cursor-pointer"
              aria-label="Previous photo"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          {/* Main Image View */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[85vh] max-w-[90vw] flex-col items-center justify-center"
          >
            <img
              src={displayPhotos[activePhotoIndex]}
              alt={`Preview ${activePhotoIndex + 1}`}
              className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
            />

            {/* Dot Indicators */}
            {displayPhotos.length > 1 && (
              <div className="mt-4 flex items-center gap-2">
                {displayPhotos.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePhotoIndex(idx);
                    }}
                    className={`h-2 rounded-full transition-all duration-200 cursor-pointer ${
                      idx === activePhotoIndex ? "w-6 bg-white" : "w-2 bg-white/40"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Next Arrow */}
          {displayPhotos.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActivePhotoIndex((prev) => (prev < displayPhotos.length - 1 ? prev + 1 : 0));
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-colors hover:bg-white/30 active:scale-95 cursor-pointer"
              aria-label="Next photo"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
