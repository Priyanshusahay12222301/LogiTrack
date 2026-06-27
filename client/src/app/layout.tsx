import "@/styles/index.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LogiTrack Dashboard",
  description: "Monitor and manage shipments with ease.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
