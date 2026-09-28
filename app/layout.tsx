import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const poppins = localFont({
  variable: "--font-poppins",
  display: "swap",
  src: [
    { path: "../fonts/poppins/Poppins-Regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/poppins/Poppins-Medium.ttf", weight: "500", style: "normal" },
    { path: "../fonts/poppins/Poppins-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../fonts/poppins/Poppins-Bold.ttf", weight: "700", style: "normal" },
  ],
});

const orbitron = localFont({
  variable: "--font-orbitron",
  display: "swap",
  src: "../fonts/orbitron/Orbitron-VariableFont_wght.ttf",
});

export const metadata: Metadata = {
  title: "SRS | School Report System",
  description:
    "Soul Valley's SRS (School Report System) demo — turning a teacher's report into structured information for school leadership.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${orbitron.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
