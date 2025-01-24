/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 30,
    },
  },
  serverExternalPackages: ["@node-rs/argon2"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: "/a/*", // Matches paths for "utfs.io"
      },
      {
        protocol: "https",
        hostname: "*.ufs.sh", // Allows any subdomain of "ufs.sh"
        pathname: "/**", // Matches all paths for "*.ufs.sh"
      },
      {
        protocol: "https",
        hostname: "pkyr6lvk95.ufs.sh", // Explicitly add your image host
        pathname: "/**", // Matches all paths on this hostname
      },
    ],
  },
  rewrites: () => {
    return [
      {
        source: "/hashtag/:tag",
        destination: "/search?q=%23:tag",
      },
    ];
  },
};

export default nextConfig;
