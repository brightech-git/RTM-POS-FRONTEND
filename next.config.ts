import type { NextConfig } from "next";

interface NextConfigWithESLint extends NextConfig {
  eslint?: {
    ignoreDuringBuilds?: boolean;
  };
}

const nextConfig: NextConfigWithESLint = {
  reactStrictMode: true,
  output: "export",
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;