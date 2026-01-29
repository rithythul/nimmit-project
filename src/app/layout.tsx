import type { Metadata } from "next";
import { Newsreader, Source_Sans_3, JetBrains_Mono } from "next/font/google";
import { SessionProvider } from "@/components/providers/session-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Display font - elegant serif for headings
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

// Body font - clean and readable
const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// Mono font - for code and technical content
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Nimmit - Your Overnight Assistant Team",
  description:
    "Get your tasks done overnight. US clients sleep, wake up to completed work by our dedicated Cambodia-based team.",
  openGraph: {
    title: "Nimmit - Your Overnight Assistant Team",
    description: "Get your tasks done overnight. US clients sleep, wake up to completed work.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${newsreader.variable} ${sourceSans.variable} ${jetbrainsMono.variable}`}>
      <head>
        {/* Preconnect for faster font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <SessionProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "var(--nimmit-bg-elevated)",
                border: "1px solid var(--nimmit-border)",
                color: "var(--nimmit-text-primary)",
                borderRadius: "var(--nimmit-radius-lg)",
                boxShadow: "var(--nimmit-shadow-lg)",
              },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}
