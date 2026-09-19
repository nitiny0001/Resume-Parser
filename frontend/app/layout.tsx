import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume Intelligence Platform",
  description: "Turn resumes into structured, searchable intelligence.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
