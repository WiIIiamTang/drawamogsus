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
      {
        hostname: "cdn.discordapp.com",
      },
      // {
      //   protocol: "https",
      //   hostname: "**",
      // },
    ],
  },
};

module.exports = nextConfig;
