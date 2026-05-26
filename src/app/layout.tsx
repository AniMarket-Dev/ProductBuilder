import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";

import "@/app/globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  description: "Mini app конструктора товара под InSales с загрузкой пользовательского изображения.",
  title: "InSales Constructor Mini App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${manrope.variable} ${fraunces.variable} bg-[#F7F4EE] text-ink antialiased`}>
        {children}
      </body>
    </html>
  );
}
