"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const roles = ["SDE Fresher", "SDE Experienced", "MBA Finance"];
const companies = ["Product Company", "Service Company", "Startup"];
const windows = ["This week", "This month", "All time"];

function FilterDropdown({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="appearance-none font-inter text-sm text-text pl-3.5 pr-9 py-2 rounded-[10px] backdrop-blur-[10px] bg-[rgba(255,255,255,0.6)] border border-[rgba(0,0,0,0.08)] cursor-pointer outline-none focus:border-blue"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
      />
    </div>
  );
}

export function LeaderboardFilters() {
  const [role, setRole] = useState(roles[0]);
  const [company, setCompany] = useState(companies[0]);
  const [timeWindow, setTimeWindow] = useState(windows[0]);

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      <FilterDropdown
        label="Role"
        options={roles}
        value={role}
        onChange={setRole}
      />
      <FilterDropdown
        label="Company type"
        options={companies}
        value={company}
        onChange={setCompany}
      />
      <FilterDropdown
        label="Time window"
        options={windows}
        value={timeWindow}
        onChange={setTimeWindow}
      />
    </div>
  );
}
