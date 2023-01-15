/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tenor.com",
        port: "",
        pathname: "/view/*",
      },
    ],
  },
};

module.exports = nextConfig;
