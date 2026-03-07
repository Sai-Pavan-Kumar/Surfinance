import type { Metadata } from "next";
import "./globals.css";

// Fonts are being loaded via Google Fonts for easy setup
export const metadata: Metadata = {
  title: "Surfinance",
  description: "Buttery smooth personal finance tracker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Loading Outfit and using a high-quality Sans-serif fallback for Switzer */}
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}