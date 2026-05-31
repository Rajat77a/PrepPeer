"use client";

import { motion } from "framer-motion";
import { useState } from "react";

type ProfileFormProps = {
  user: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
};

const fields = [
  { id: "college", label: "College/University", value: "NIT Trichy" },
  { id: "role", label: "Target role", value: "SDE Fresher" },
  { id: "experience", label: "Experience level", value: "0-1 years" },
  { id: "company", label: "Target company type", value: "Product startup" },
];

export function ProfileForm({ user }: ProfileFormProps) {
  const [values, setValues] = useState(
    Object.fromEntries(fields.map((field) => [field.id, field.value]))
  );

  return (
    <div className="mx-auto max-w-5xl p-5 sm:p-8">
      <div className="mb-8">
        <p className="font-inter text-xs font-bold uppercase tracking-[0.22em] text-[#006cff]">
          Profile
        </p>
        <h1 className="mt-3 font-inter text-[clamp(38px,6vw,72px)] font-black leading-none tracking-[-0.05em] text-white">
          Your PrepPeer identity.
        </h1>
        <p className="mt-4 max-w-2xl font-inter text-base leading-7 text-white/40">
          Keep your role and target context ready for sharper interview sessions.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-[#006cff]/20 bg-gradient-to-br from-[#0d1929] to-[#080808] p-7"
        >
          <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-[#006cff]/10 blur-[90px]" />
          <div className="relative z-10">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-20 w-20 rounded-full border border-white/10 object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#006cff] font-inter text-3xl font-black text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <h2 className="mt-5 font-inter text-2xl font-black text-white">
              {user.name}
            </h2>
            <p className="mt-1 font-inter text-sm font-semibold text-white/35">
              {user.email}
            </p>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="rounded-2xl border border-white/[0.08] bg-[#0d0d0d] p-6"
        >
          <div className="grid gap-4">
            {fields.map((field) => (
              <label key={field.id} className="block">
                <span className="font-inter text-xs font-bold uppercase tracking-[0.16em] text-white/30">
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
                  className="mt-2 h-12 w-full rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 font-inter text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-[#006cff]/60 focus:shadow-[0_0_24px_rgba(0,108,255,0.12)]"
                />
              </label>
            ))}
          </div>

          <button
            type="button"
            className="mt-6 rounded-full bg-[#006cff] px-6 py-3 font-inter text-sm font-bold text-white transition hover:bg-[#0057cc] hover:shadow-[0_0_20px_rgba(0,108,255,0.25)]"
          >
            Save profile
          </button>
        </motion.section>
      </div>
    </div>
  );
}
