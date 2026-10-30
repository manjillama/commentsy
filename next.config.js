/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return ["/api/:path*", "/embed/:path*", "/apps/:path*", "/dashboard", "/account", "/signin", "/signup"].map(source => ({
      source,
      headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
    }));
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "*.googleapis.com",
        port: "",
        pathname: "**",
      },
    ],
    domains: ["avatars.githubusercontent.com"],
  },
};

module.exports = nextConfig;
