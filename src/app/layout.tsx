import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TEMPO - Appointment and Request Management System",
  description: "School Appointment and Request Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
