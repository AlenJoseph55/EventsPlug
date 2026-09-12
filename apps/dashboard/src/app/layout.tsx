import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk, Inter, Outfit, Fira_Code } from "next/font/google";
import QueryProvider from "@/providers/QueryProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EventsPlug Organizer Dashboard",
  description: "The multi-tenant SaaS console to organize events and manage embeddable registration widgets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${inter.variable} ${outfit.variable} ${firaCode.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var path = window.location.pathname;
                  var isHub = path.indexOf('/o/') !== -1 || path.indexOf('/e/') !== -1;
                  if (isHub) {
                    var savedHub = localStorage.getItem('eventsplug-hub-theme-preference');
                    if (savedHub === 'light') {
                      document.documentElement.classList.add('light-hub');
                      document.documentElement.setAttribute('data-hub-theme', 'light');
                    } else {
                      document.documentElement.classList.add('dark-hub');
                      document.documentElement.setAttribute('data-hub-theme', 'dark');
                    }
                  } else {
                    var savedAdmin = localStorage.getItem('eventsplug-admin-theme-preference');
                    if (savedAdmin === 'dark') {
                      document.documentElement.classList.add('dark-admin');
                    } else {
                      document.documentElement.classList.add('light-admin');
                    }
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <ToastProvider>
            <AuthProvider>{children}</AuthProvider>
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
