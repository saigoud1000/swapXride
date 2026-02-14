/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    eslint: {
        ignoreDuringBuilds: true,
    },
    transpilePackages: ['@swapxride/shared'],
};

export default nextConfig;
