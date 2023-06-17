/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'res.cloudinary.com',  
      },
    ],
  },
  reactStrictMode: true,
}

module.exports = nextConfig

