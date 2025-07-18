/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // async headers() {
  //   return [
  //     {
  //       source: "/api/:path*",
  //       headers: [
  //         {
  //           key: "Access-Control-Allow-Origin",
  //           value:
  //             "https://cbpd-new-version.vercel.app, https://cbpd-admin.vercel.app",
  //         },
  //         {
  //           key: "Access-Control-Allow-Methods",
  //           value: "GET,POST,PUT,DELETE,OPTIONS",
  //         },
  //         {
  //           key: "Access-Control-Allow-Headers",
  //           value: "Content-Type, Authorization",
  //         },
  //         {
  //           key: "Access-Control-Allow-Credentials",
  //           value: "true",
  //         },
  //       ],
  //     },
  //   ];
  // },
};

export default nextConfig;
