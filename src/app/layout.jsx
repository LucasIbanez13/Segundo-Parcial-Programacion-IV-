// Layout raíz de la aplicación (html, body, fuentes, estilos globales).
import "./globals.css";

export const metadata = {
  title: "mostrador · Gestión comercial",
  description: "Sistema de ventas y gestión comercial",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
