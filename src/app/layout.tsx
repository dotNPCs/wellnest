import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist, Jersey_20 } from "next/font/google";
import localFont from "next/font/local";

import { TRPCReactProvider } from "@/trpc/react";
import { Suspense } from "react";
import SplashScreen from "./_components/SplashScreen";
import ClientLayout from "./_components/ClientLayout";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/server/auth";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const jersey20 = Jersey_20({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-jersey-20",
  display: "swap",
});

const pixelMix = localFont({
  src: [
    {
      path: "../../public/fonts/pixelmix.ttf",
      weight: "400",
      style: "normal",
    },

    {
      path: "../../public/fonts/pixelmix_bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-pixelmix",
  display: "swap",
  preload: true,
  fallback: ["sans-serif"],
});

export const metadata: Metadata = {
  title: "WellNest",
  description: "Take care of your mental health, one pet at a time.",
  openGraph: {
    title: "WellNest",
    description: "Take care of your mental health, one pet at a time.",

    siteName: "WellNest",

    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WellNest",
    description: "Take care of your mental health, one pet at a time.",
  },
  icons: {
    icon: [
      { rel: "icon", url: "/favicon.ico" },
      {
        rel: "icon",
        type: "image/png",
        sizes: "192x192",
        url: "/icons/android-chrome-192x192.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "512x512",
        url: "/icons/android-chrome-512x512.png",
      },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  other: {
    "darkreader-lock": "",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth(); // TODO: Replace with actual session retrieval logic
  return (
    <html
      lang="en"
      className={`${pixelMix.variable} ${geist.variable} ${jersey20.variable}`}
    >
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body className="w-full overflow-x-hidden">
        <div className="mx-auto flex min-h-screen w-full max-w-[768px] flex-col bg-white md:border-2 md:border-black">
          <TRPCReactProvider>
            <SessionProvider session={session}>
              {" "}
              <ClientLayout>{children}</ClientLayout>
            </SessionProvider>
          </TRPCReactProvider>
        </div>
      </body>
    </html>
  );
}
