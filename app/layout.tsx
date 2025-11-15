import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Judi Online Simulator",
  description: "Simulator untuk membuktikan judi online scam",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
