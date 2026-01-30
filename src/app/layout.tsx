import type { Metadata } from "next";
import { DM_Sans, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import { SessionProvider } from "@/components/providers/session-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Display font - Modern sans-serif (Anthropic style)
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "700"],
});

// Body font - Elegant serif (Anthropic style)
const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600"],
});

// Mono font - Technical precision
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
    <html lang="en" className={`${dmSans.variable} ${sourceSerif.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Preconnect for faster font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
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
