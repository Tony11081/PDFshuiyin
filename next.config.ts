import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // 启用类型检查优化
    typedRoutes: false,
  },
  typescript: {
    // 确保 TypeScript 错误得到正确处理
    ignoreBuildErrors: false,
  },
  eslint: {
    // 确保 ESLint 错误得到正确处理
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
