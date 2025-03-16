import type { NextConfig } from 'next';

const repo = process.env.GITHUB_REPOSITORY?.replace(/.*?\//, '') || '';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // Configurações necessárias para o GitHub Pages
  assetPrefix: process.env.NODE_ENV === 'production' ? `/${repo}` : '',
  basePath: process.env.NODE_ENV === 'production' ? `/${repo}` : '',
  // Necessário para exportação estática
  output: 'export',
  // Desabilitar trailing slash
  trailingSlash: false,
};

export default nextConfig;