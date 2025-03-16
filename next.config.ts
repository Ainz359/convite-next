import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  // Se você estiver usando imagens, desative a otimização para build estático
  images: {
    unoptimized: true,
  },
  // Se você estiver usando rotas dinâmicas, pode ser necessário configurar trailingSlash
  trailingSlash: true,
};

export default nextConfig;