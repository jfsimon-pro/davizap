import type { Metadata } from "next";
import "./globals.css";

// Disable static generation for the entire app since it uses client-side
// hooks and context that cannot be executed during the build phase
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "WhatsApp Davi - Cloud API Integration",
  description: "Sistema de integração com WhatsApp Cloud API",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
