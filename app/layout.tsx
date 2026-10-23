import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SAKAN EUROPE | The Art of Living Well",
  description: "Discover considered furniture, bedroom collections, bedding and decor for your European home.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
