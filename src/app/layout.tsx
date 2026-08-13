import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";

export const metadata: Metadata = {
  title: "BoloBiz - AI Business Assistant | बस बोलकर बिज़नेस चलाओ",
  description: "BoloBiz is a voice-first AI assistant to manage your small business sales, customers, credit ledger (khata), and inventory simply by talking in Hindi, Hinglish, or English.",
  keywords: "bolobiz, ai business assistant, voice khata, accounting voice assistant, hinglish business manager, small business tools, inventory voice control",
  authors: [{ name: "BoloBiz Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <main id="app-root">{children}</main>
        </LanguageProvider>
      </body>
    </html>
  );
}
