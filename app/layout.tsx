import type { Metadata } from "next";
import { LayoutContent } from "@/src/components/LayoutContent";
import { GlobalErrorDisplay } from "@/src/components/GlobalErrorDisplay";
import "./globals.css";

export const metadata: Metadata = {
  title: "Joldi Tech | Modern Solutions",
  description: "Next-generation technology solutions for modern businesses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <GlobalErrorDisplay />
        <LayoutContent>
          {children}
        </LayoutContent>
      </body>
    </html>
  );
}
