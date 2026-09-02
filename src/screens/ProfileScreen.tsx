import { useState, useRef } from "react";

export interface UserProfileData {
  name: string;
  email: string;
  role: string;
  organization: string;
  phone: string;
  avatar: string;
  trade: string;
  location: string;
  notifications: boolean;
  offlineSync: boolean;
}

interface ProfileScreenProps {
  profile: UserProfileData;
  onUpdateProfile: (updated: Partial<UserProfileData>) => void;
  onBack: () => void;
  onSignOut: () => void;
}

export function ProfileScreen({
  profile,
  onUpdateProfile,
  onBack,
  onSignOut,
}: ProfileScreenProps) {
  const [formData, setFormData] = useState<UserProfileData>(profile);
  const [savedToast, setSavedToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, avatar: url }));
    onUpdateProfile({ avatar: url });
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onUpdateProfile(formData);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2200);
  };

  return (
    <div className="relative flex flex-col h-full bg-white select-none overflow-hidden text-slate-900">
      {/* Sleek Minimalist Header */}
      <header className="shrink-0 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between z-10">
        <button
          type="button"
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 flex items-center justify-center transition-all cursor-pointer shrink-0"
          aria-label="Go back"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <h1 className="text-[15px] font-bold text-slate-900">Profile</h1>

        <button
          type="button"
          onClick={() => handleSave()}
          className="px-3.5 py-1.5 rounded-full bg-[#0055ff] text-white text-[12px] font-semibold hover:bg-blue-600 active:scale-95 transition-all cursor-pointer shadow-xs"
        >
          Save
        </button>
      </header>

      {/* Main Content Area - Clean, Seamless, Unboxed */}
      <main className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
        {/* Seamless Hero Profile Header (No box) */}
        <div className="flex flex-col items-center text-center">
          {/* Avatar with Camera Icon */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-slate-100 bg-slate-100 shadow-sm">
              <img
                src={formData.avatar}
                alt={formData.name}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#0055ff] text-white flex items-center justify-center shadow-md hover:bg-blue-600 active:scale-90 transition-all border-2 border-white cursor-pointer"
              aria-label="Upload photo"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>

          {/* Name & Subtitle */}
          <h2 className="text-[17px] font-bold text-slate-900 mt-2.5 tracking-tight">{formData.name}</h2>
          <p className="text-[12.5px] text-slate-500 font-medium mt-0.5">
            {formData.role} · <span className="text-slate-700">{formData.organization}</span>
          </p>
        </div>

        {/* Clean Integrated Stats Row (No Box-in-Box) */}
        <div className="grid grid-cols-3 py-3 border-y border-slate-100">
          <div className="text-center">
            <div className="text-[17px] font-bold text-slate-900 tracking-tight">32</div>
            <div className="text-[10.5px] font-medium text-slate-400 mt-0.5">Tasks Done</div>
          </div>
          <div className="text-center border-x border-slate-100">
            <div className="text-[17px] font-bold text-slate-900 tracking-tight">18</div>
            <div className="text-[10.5px] font-medium text-slate-400 mt-0.5">Issues Logged</div>
          </div>
          <div className="text-center">
            <div className="text-[17px] font-bold text-emerald-600 tracking-tight">98%</div>
            <div className="text-[10.5px] font-medium text-slate-400 mt-0.5">On-time Score</div>
          </div>
        </div>

        {/* Clean Grouped Form Rows (Apple / Linear Settings Style) */}
        <div className="space-y-4">
          <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block px-1">
            Personal Information
          </span>

          <div className="divide-y divide-slate-100 bg-slate-50/60 rounded-2xl border border-slate-100/80 px-4">
            {/* Full Name */}
            <div className="py-2.5 flex items-center justify-between gap-3">
              <label className="text-[12.5px] font-medium text-slate-500 shrink-0 w-28">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="text-[13px] font-semibold text-slate-900 bg-transparent text-right outline-none flex-1 focus:text-[#0055ff]"
              />
            </div>

            {/* Email */}
            <div className="py-2.5 flex items-center justify-between gap-3">
              <label className="text-[12.5px] font-medium text-slate-500 shrink-0 w-28">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="text-[13px] font-semibold text-slate-900 bg-transparent text-right outline-none flex-1 focus:text-[#0055ff]"
              />
            </div>

            {/* Phone */}
            <div className="py-2.5 flex items-center justify-between gap-3">
              <label className="text-[12.5px] font-medium text-slate-500 shrink-0 w-28">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="text-[13px] font-semibold text-slate-900 bg-transparent text-right outline-none flex-1 focus:text-[#0055ff]"
              />
            </div>

            {/* Trade / Discipline */}
            <div className="py-2.5 flex items-center justify-between gap-3">
              <label className="text-[12.5px] font-medium text-slate-500 shrink-0 w-28">Specialization</label>
              <input
                type="text"
                value={formData.trade}
                onChange={(e) => setFormData({ ...formData, trade: e.target.value })}
                className="text-[13px] font-semibold text-slate-900 bg-transparent text-right outline-none flex-1 focus:text-[#0055ff]"
              />
            </div>

            {/* Location */}
            <div className="py-2.5 flex items-center justify-between gap-3">
              <label className="text-[12.5px] font-medium text-slate-500 shrink-0 w-28">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="text-[13px] font-semibold text-slate-900 bg-transparent text-right outline-none flex-1 focus:text-[#0055ff]"
              />
            </div>
          </div>
        </div>

        {/* Preferences Section (Clean Rows) */}
        <div className="space-y-4">
          <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block px-1">
            Preferences
          </span>

          <div className="divide-y divide-slate-100 bg-slate-50/60 rounded-2xl border border-slate-100/80 px-4">
            <div className="py-3 flex items-center justify-between">
              <div>
                <div className="text-[13px] font-semibold text-slate-800">Push Notifications</div>
                <div className="text-[11px] text-slate-400">Issue alerts and RFI updates</div>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, notifications: !formData.notifications })}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                  formData.notifications ? "bg-[#0055ff]" : "bg-slate-300"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    formData.notifications ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <div className="text-[13px] font-semibold text-slate-800">Offline Field Cache</div>
                <div className="text-[11px] text-slate-400">Save 2D drawings for offline use</div>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, offlineSync: !formData.offlineSync })}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                  formData.offlineSync ? "bg-[#0055ff]" : "bg-slate-300"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    formData.offlineSync ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Sign Out Button - Clean and Left-Aligned */}
        <div className="pt-2 pb-6">
          <button
            type="button"
            onClick={onSignOut}
            className="py-2.5 px-2 text-left text-red-500 hover:text-red-600 text-[13.5px] font-semibold transition-colors cursor-pointer hover:bg-red-50/50 rounded-xl flex items-center gap-2 active:scale-98"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </main>

      {/* Saved Toast Alert */}
      {savedToast && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md text-white text-[12px] font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-slide-up z-50">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Profile saved</span>
        </div>
      )}
    </div>
  );
}
