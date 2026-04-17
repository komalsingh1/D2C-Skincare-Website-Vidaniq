/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/Vidaniq",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
