import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interview",
  description: "Practice AI mock interview questions tailored to your role.",
};

export default function InterviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
