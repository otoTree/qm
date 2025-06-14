import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/qimen/:path*',
        destination: 'https://api.yuanfenju.com/index.php/v1/Liupan/:path*'
      }
    ]
  }
};

export default nextConfig;
