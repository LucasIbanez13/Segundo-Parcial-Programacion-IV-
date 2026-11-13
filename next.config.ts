import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // El cliente de libSQL usa binarios nativos en desarrollo (archivo SQLite local): no se empaqueta.
  serverExternalPackages: ["@libsql/client", "libsql"],
};

export default nextConfig;
