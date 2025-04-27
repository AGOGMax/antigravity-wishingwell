/** @type {import('next').NextConfig} */

const TEST_API_ENDPOINT = process.env.NEXT_PUBLIC_TEST_BACKEND;
const API_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND;

const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    // ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: "ik.imagekit.io",
        protocol: "https",
      },
      {
        hostname: "s3.amazonaws.com",
        protocol: "https",
      },
      {
        hostname: "cdn.sanity.io",
        protocol: "https",
      },
      {
        hostname: "antigravity-s3.s3.us-east-1.amazonaws.com",
        protocol: "https",
      },
      {
        hostname: "assets.coingecko.com",
        protocol: "https",
      },
      {
        hostname: "coin-images.coingecko.com",
        protocol: "https",
      },
      {
        hostname: "assets.geckoterminal.com",
        protocol: "https",
      },
      {
        hostname: "ui-avatars.com",
        protocol: "https",
      },
    ],
    dangerouslyAllowSVG: true,
  },
  async rewrites() {
    return [
      {
        source: "/test/api/:path*",
        destination: `${TEST_API_ENDPOINT}/api/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${API_ENDPOINT}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
