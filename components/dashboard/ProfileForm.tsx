"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronRight, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { csrfHeaders } from "@/utils/csrf";

type ProfileFormProps = {
  user: {
    name: string;
    email: string;
    avatarUrl?: string;
    college?: string;
    role?: string;
    experience?: string;
    company?: string;
  };
};

type ProfileValues = {
  fullName: string;
  college: string;
  role: string;
  experience: string;
  company: string;
};

type TextFieldKey = "fullName" | "college";
type SelectorKey = "role" | "experience" | "company";

const textFields: { id: TextFieldKey; label: string }[] = [
  { id: "fullName", label: "Full name" },
  { id: "college", label: "College/University" },
];

const selectorFields: {
  id: SelectorKey;
  label: string;
  title: string;
  description: string;
  options: string[];
}[] = [
  {
    id: "role",
    label: "Target role",
    title: "Choose target role",
    description:
      "This role will be used to generate your next interview questions.",
    options: [
      "SDE",
      "SDE Fresher",
      "Product Manager",
      "Operations",
      "MBA",
      "Consulting",
      "Data Analyst",
    ],
  },
  {
    id: "experience",
    label: "Experience level",
    title: "Choose experience level",
    description: "This helps PrepPeer set the right difficulty and expectations.",
    options: ["Fresher", "0-1 years", "1-3 years", "3-6 years", "6+ years"],
  },
  {
    id: "company",
    label: "Target company type",
    title: "Choose company type",
    description: "This changes the style and benchmark of your next interview.",
    options: [
      "FAANG",
      "Product startup",
      "Product Company",
      "Service Company",
      "Consulting firm",
      "PSU / Govt",
      "Mid-size tech",
      "Marketplace",
      "Fintech",
      "Consumer App",
      "Logistics",
    ],
  },
];

const profileContextLabels: Record<SelectorKey, string> = {
  role: "Target role",
  experience: "Experience",
  company: "Company type",
};

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();

  const [values, setValues] = useState<ProfileValues>({
    fullName: user.name,
    college: user.college ?? "",
    role: user.role ?? "SDE Fresher",
    experience: user.experience ?? "0-1 years",
    company: user.company ?? "Product startup",
  });
  const [activeSelector, setActiveSelector] = useState<SelectorKey | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const activeSelectorConfig = selectorFields.find(
    (field) => field.id === activeSelector
  );

  const saveProfile = async () => {
    if (values.fullName.trim().length < 2 || values.college.trim().length < 2) {
      setMessage("Please enter a valid name and college.");
      return;
    }

    setSaving(true);
    setMessage("");

    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: csrfHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(values),
    });
    const result = await response.json();

    setSaving(false);

    if (!response.ok) {
      setMessage(result.error ?? "Profile could not be saved.");
      return;
    }

    setMessage("Profile saved.");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-5xl p-5 sm:p-8">
      <div className="mb-8">
        <p className="font-inter text-xs font-bold uppercase tracking-[0.22em] text-[#006cff]">
          Profile
        </p>
        <h1 className="mt-3 font-inter text-[clamp(38px,6vw,72px)] font-black leading-none tracking-[-0.05em] text-[#07111f]">
          Your PrepPeer identity.
        </h1>
        <p className="mt-4 max-w-2xl font-inter text-base font-medium leading-7 text-[#64748b]">
          Keep your role and target context ready for sharper interview sessions.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-[#006cff]/16 bg-white/88 p-7 shadow-[0_24px_80px_rgba(0,108,255,0.12)] backdrop-blur-xl"
        >
          <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-[#006cff]/10 blur-[90px]" />

          <div className="relative z-10">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-20 w-20 rounded-full border border-[rgba(0,132,255,0.16)] object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#006cff] font-inter text-3xl font-black text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}

            <h2 className="mt-5 font-inter text-2xl font-black text-[#07111f]">
              {values.fullName || user.name}
            </h2>

            <p className="mt-1 font-inter text-sm font-semibold text-[#64748b]">
              {user.email}
            </p>

            <div className="mt-8 border-l-2 border-[#006cff] pl-5">
              <p className="font-inter text-[11px] font-black uppercase tracking-[0.2em] text-[#006cff]">
                Interview context
              </p>

              <div className="mt-4 divide-y divide-[rgba(0,132,255,0.12)]">
                {(["role", "experience", "company"] as SelectorKey[]).map(
                  (key) => (
                    <div
                      key={key}
                      className="group flex items-center justify-between gap-5 py-3"
                    >
                      <span className="font-inter text-xs font-bold uppercase tracking-[0.14em] text-[#8ba0b8] transition group-hover:text-[#006cff]">
                        {profileContextLabels[key]}
                      </span>
                      <span className="text-right font-inter text-sm font-black text-[#07111f]">
                        {values[key]}
                      </span>
                    </div>
                  )
                )}
              </div>

              {values.college && (
                <div className="mt-4 border-t border-[rgba(0,132,255,0.12)] pt-4">
                  <p className="font-inter text-xs font-bold uppercase tracking-[0.14em] text-[#8ba0b8]">
                    College
                  </p>
                  <p className="mt-1 font-inter text-sm font-black text-[#07111f]">
                    {values.college}
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="rounded-2xl border border-[rgba(0,132,255,0.12)] bg-white/88 p-6 shadow-[0_18px_60px_rgba(0,108,255,0.08)] backdrop-blur-xl"
        >
          <div className="grid gap-4">
            {textFields.map((field) => (
              <label key={field.id} className="block">
                <span className="font-inter text-xs font-bold uppercase tracking-[0.16em] text-[#64748b]">
                  {field.label}
                </span>

                <input
                  value={values[field.id]}
                  minLength={2}
                  maxLength={field.id === "fullName" ? 80 : 120}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      [field.id]: event.target.value,
                    }))
                  }
                  className="mt-2 h-12 w-full rounded-xl border border-[rgba(0,132,255,0.12)] bg-[#f7fbff] px-4 font-inter text-sm font-semibold text-[#07111f] outline-none transition placeholder:text-[#9aa9bb] focus:border-[#006cff]/60 focus:bg-white focus:shadow-[0_0_24px_rgba(0,108,255,0.12)]"
                />
              </label>
            ))}

            {selectorFields.map((field) => (
              <div key={field.id}>
                <span className="font-inter text-xs font-bold uppercase tracking-[0.16em] text-[#64748b]">
                  {field.label}
                </span>

                <button
                  type="button"
                  onClick={() => setActiveSelector(field.id)}
                  className="mt-2 flex h-12 w-full items-center justify-between rounded-xl border border-[rgba(0,132,255,0.12)] bg-[#f7fbff] px-4 text-left font-inter text-sm font-semibold text-[#07111f] outline-none transition hover:border-[#006cff]/45 hover:bg-white hover:shadow-[0_0_24px_rgba(0,108,255,0.10)]"
                >
                  <span>{values[field.id]}</span>
                  <ChevronRight className="h-4 w-4 text-[#64748b]" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={saveProfile}
            disabled={saving}
            className="mt-6 rounded-full bg-[#006cff] px-6 py-3 font-inter text-sm font-bold text-white transition hover:bg-[#0057cc] hover:shadow-[0_0_20px_rgba(0,108,255,0.25)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving
              </span>
            ) : (
              "Save profile"
            )}
          </button>

          {message && (
            <p className="mt-4 font-inter text-sm font-semibold text-[#64748b]">
              {message}
            </p>
          )}
        </motion.section>
      </div>

      <AnimatePresence>
        {activeSelectorConfig && (
          <motion.div
            className="fixed inset-0 z-[80] flex justify-end bg-[#07111f]/35 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveSelector(null)}
          >
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              onClick={(event) => event.stopPropagation()}
              className="h-full w-full max-w-md overflow-y-auto border-l border-[rgba(0,132,255,0.18)] bg-white p-6 shadow-[-24px_0_80px_rgba(0,108,255,0.18)]"
            >
              <div className="mb-8 flex items-start justify-between gap-5">
                <div>
                  <p className="font-inter text-xs font-bold uppercase tracking-[0.2em] text-[#006cff]">
                    Update profile
                  </p>

                  <h2 className="mt-3 font-inter text-2xl font-black tracking-[-0.04em] text-[#07111f]">
                    {activeSelectorConfig.title}
                  </h2>

                  <p className="mt-2 font-inter text-sm font-semibold leading-6 text-[#64748b]">
                    {activeSelectorConfig.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveSelector(null)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgba(0,132,255,0.14)] bg-[#f7fbff] text-[#64748b] transition hover:border-[#006cff]/35 hover:text-[#006cff]"
                  aria-label="Close selector"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-3">
                {activeSelectorConfig.options.map((option) => {
                  const selected = values[activeSelectorConfig.id] === option;

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setValues((current) => ({
                          ...current,
                          [activeSelectorConfig.id]: option,
                        }));
                        setActiveSelector(null);
                      }}
                      className={
                        selected
                          ? "flex min-h-14 items-center justify-between rounded-2xl border border-[#006cff] bg-[#006cff] px-5 py-3 text-left font-inter text-sm font-black text-white shadow-[0_14px_34px_rgba(0,108,255,0.20)]"
                          : "flex min-h-14 items-center justify-between rounded-2xl border border-[rgba(0,132,255,0.12)] bg-[#f7fbff] px-5 py-3 text-left font-inter text-sm font-bold text-[#07111f] transition hover:border-[#006cff]/45 hover:bg-white hover:text-[#006cff]"
                      }
                    >
                      <span>{option}</span>
                      {selected && <Check className="h-4 w-4" />}
                    </button>
                  );
                })}
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
