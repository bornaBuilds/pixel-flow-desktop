import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const gilroy = localFont({
  src: [
    { path: "./fonts/Gilroy-Regular.otf", style: "normal", weight: "400" },
    {
      path: "./fonts/Gilroy-RegularItalic.otf",
      style: "italic",
      weight: "400",
    },
    {
      path: "./fonts/Gilroy-Semibold.otf",
      style: "normal",
      weight: "600",
    },
    {
      path: "./fonts/Gilroy-Black.otf",
      style: "normal",
      weight: "900",
    },
  ],
  variable: "--font-gilroy",
  weight: "400 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-pt-40">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${gilroy.variable} antialiased`}
      >
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
