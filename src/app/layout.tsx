import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mystical Realms 3D",
  description: "A dark mystical space exploration",
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
