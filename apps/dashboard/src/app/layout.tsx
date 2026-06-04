import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
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
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var isHub = window.location.pathname.indexOf('/o/') !== -1;
                  if (isHub) {
                    var savedHub = localStorage.getItem('eventsplug-hub-theme-preference');
                    if (savedHub === 'light') {
                      document.documentElement.classList.add('light-hub');
                    } else {
                      document.documentElement.classList.add('dark-hub');
                    }
                  } else {
                    var savedAdmin = localStorage.getItem('eventsplug-admin-theme-preference');
                    if (savedAdmin === 'light') {
                      document.documentElement.classList.add('light-admin');
                    } else {
                      document.documentElement.classList.add('dark-admin');
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
