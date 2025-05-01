/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ongwclrnfeefcrlxbgzy.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/cabinImages/**",
        search: "",
      },
    ],
  },

  // output: "export",
};

export default nextConfig;
