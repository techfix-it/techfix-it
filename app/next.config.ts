import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ['lucide-react'],
  serverExternalPackages: ['discord.js'],
};

export default nextConfig;
