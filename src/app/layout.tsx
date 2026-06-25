import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import CustomCursor from "@/components/shared/CustomCursor";
import LoadingScreen from "@/components/shared/LoadingScreen";

export const metadata: Metadata = {
  title: "Zenith Quest — Your Personal Sky Guide",
  description: "Discover what's happening above you tonight. Real-time celestial tracking, AI sky narration, satellite tracking, and gamified stargazing missions.",
  keywords: ["astronomy", "stargazing", "satellite tracking", "ISS", "sky guide", "celestial", "space"],
  authors: [{ name: "Zenith Quest" }],
  openGraph: {
    title: "Zenith Quest — Your Personal Sky Guide",
    description: "Discover what's happening above you tonight.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className="antialiased min-h-screen">
          <LoadingScreen />
          <CustomCursor />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
