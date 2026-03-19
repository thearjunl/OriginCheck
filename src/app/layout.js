import { Inter, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-plex-sans",
  display: "swap",
});

export const metadata = {
  title: "OriginCheck — AI Humanizer & Integrity Scanner",
  description: "Transform AI-generated text into natural, human-sounding content. Includes an integrity scanner for plagiarism and AI detection.",
  keywords: "AI humanizer, text humanizer, AI detection, plagiarism check, content originality, bypass AI detection",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${plexSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
