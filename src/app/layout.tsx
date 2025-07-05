import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { DynamicLayout } from "@/components/layout/DynamicLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Manga Reader",
  description: "Busca, lee y guarda tus mangas favoritos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <Sidebar />
          <DynamicLayout>
        {children}
          </DynamicLayout>
        </div>
      </body>
    </html>
  );
}
