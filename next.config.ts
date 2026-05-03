import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self' https://*.firebaseio.com https://*.googleapis.com https://*.firebaseapp.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.firebaseapp.com https://apis.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.gstatic.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://*.huggingface.co https://*.googleusercontent.com https://www.gstatic.com; connect-src 'self' https://*.huggingface.co https://api-inference.huggingface.co https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com; frame-src 'self' https://*.firebaseapp.com https://*.firebaseio.com;",
          },
        ],
      },
    ];
  },
};


export default nextConfig;
