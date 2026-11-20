// Layout raíz: fuentes, avisos (toasts) y tooltips. El panel lateral está en (app)/layout.tsx.
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DATOS_COMERCIO } from "@/lib/constants";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: DATOS_COMERCIO.nombre, template: `%s · ${DATOS_COMERCIO.nombre}` },
  description: "Celulares el Tucu: venta de celulares y accesorios en San Miguel de Tucumán. Facturación, stock y cuentas corrientes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
