import { IBM_Plex_Sans_Arabic, Inter } from "next/font/google";

// Foundation uses Inter for Latin and IBM Plex Sans Arabic for Arabic.
// The host splices these variables after the SaudiRiyal glyph font.
// Western digits are the default in both languages.
/* `subsets` is what gets PRELOADED, not what exists: every Google subset
   still ships as an @font-face with its unicode-range, so Turkish and French
   letters load latin-ext the moment a page needs them. Preloading it too put
   an 83 KB file in front of every page, Arabic ones included. */
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  /* Every rung anything actually renders. 600 is here for the landing deck's
       sub-headings; a weight not in this list is synthesized by the browser
       into a faux-bold smear rather than falling back to a real cut. */
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-arabic",
  display: "swap",
});
