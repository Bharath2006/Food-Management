import type { Metadata } from "next";
import "./globals.css";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import { AuthProvider } from "./contexts/AuthContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import NotificationWrapper from "./components/NotificationWrapper";

export const metadata: Metadata = {
  title: "Zero Food Hero - AI-Powered Food Redistribution",
  description: "Connect surplus food with people who need it most. Powered by AI to reduce waste and fight hunger.",
  keywords: "food redistribution, AI, food waste, hunger, donation, volunteer, NGO",
  authors: [{ name: "Zero Food Hero Team" }],
  openGraph: {
    title: "Zero Food Hero - AI-Powered Food Redistribution",
    description: "Connect surplus food with people who need it most. Powered by AI to reduce waste and fight hunger.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zero Food Hero - AI-Powered Food Redistribution",
    description: "Connect surplus food with people who need it most. Powered by AI to reduce waste and fight hunger.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <SettingsProvider>
            <NotificationProvider>
              <NotificationWrapper>
                <Navigation />
                <main className="min-h-screen">
                  {children}
                </main>
                <Footer />
              </NotificationWrapper>
            </NotificationProvider>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
