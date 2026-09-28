/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
      },
    ];
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
};

export default config;