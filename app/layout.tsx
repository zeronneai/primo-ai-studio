import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const nunito = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-nunito",
  display: "swap",
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "Primo AI Studio",
  description: "AI-powered visual content generation for premium brands",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#E55B3C",
          colorBackground: "#FFFFFF",
          colorInputBackground: "#FAF0DD",
          colorInputText: "#1A2E3F",
          colorText: "#1A2E3F",
        },
      }}
    >
      <html lang="es" className={nunito.variable}>
        <body className="font-sans">{children}</body>
      </html>
    </ClerkProvider>
  );
}
