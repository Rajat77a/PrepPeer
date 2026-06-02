"use client";

import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

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

export function ProfileForm({ user }: ProfileFormProps) {
  const [values, setValues] = useState({
    fullName: user.name,
    college: user.college ?? "",
    role: user.role ?? "SDE Fresher",
    experience: user.experience ?? "0-1 years",
    company: user.company ?? "Product startup",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const fields = [
    { id: "fullName", label: "Full name" },
    { id: "college", label: "College/University" },
    { id: "role", label: "Target role" },
    { id: "experience", label: "Experience level" },
    { id: "company", label: "Target company type" },
  ] as const;

  const saveProfile = async () => {
    setSaving(true);
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: values.fullName.trim(),
        name: values.fullName.trim(),
        college: values.college.trim(),
        target_role: values.role.trim(),
        experience_level: values.experience.trim(),
        target_company_type: values.company.trim(),
        onboarding_complete: Boolean(values.fullName.trim() && values.college.trim()),
      },
    });

    setSaving(false);
    setMessage(error ? error.message : "Profile saved.");
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
            {values.college && (
              <p className="mt-4 inline-flex rounded-full border border-[rgba(0,132,255,0.14)] bg-[#f7fbff] px-3 py-1.5 font-inter text-xs font-bold text-[#64748b]">
                {values.college}
              </p>
            )}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="rounded-2xl border border-[rgba(0,132,255,0.12)] bg-white/88 p-6 shadow-[0_18px_60px_rgba(0,108,255,0.08)] backdrop-blur-xl"
        >
          <div className="grid gap-4">
            {fields.map((field) => (
              <label key={field.id} className="block">
                <span className="font-inter text-xs font-bold uppercase tracking-[0.16em] text-[#64748b]">
                  {field.label}
                </span>
                <input
                  value={values[field.id]}
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
          </div>

          <button
            type="button"
            onClick={saveProfile}
            disabled={saving}
            className="mt-6 rounded-full bg-[#006cff] px-6 py-3 font-inter text-sm font-bold text-white transition hover:bg-[#0057cc] hover:shadow-[0_0_20px_rgba(0,108,255,0.25)]"
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
    </div>
  );
}
