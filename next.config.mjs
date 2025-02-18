/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 30,
    },
  },
  typescript: {
    ignoreBuildErrors: true, // ✅ Ignores TypeScript errors during build
  },
  eslint: {
    ignoreDuringBuilds: true, // ✅ Ignores ESLint errors during build
  },
  serverExternalPackages: ["@node-rs/argon2"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/*`,
      },
    ],
  },
  rewrites: async () => {
    return [
      {
        source: "/hashtag/:tag",
        destination: "/search?q=%23:tag",
      },
    ];
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false }; // ✅ Prevents certain server-side modules from breaking
    return config;
  },
};

export default nextConfig;
