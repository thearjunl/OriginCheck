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
  title: "OriginCheck — Plagiarism Detection Platform",
  description: "Professional-grade plagiarism detection with multi-source scanning, AI detection, and comprehensive reports.",
  keywords: "plagiarism, detection, originality, academic integrity, similarity check",
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
