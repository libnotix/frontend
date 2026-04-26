import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Added the functionaility to maintain path safety for the DolgozatEditor pages :-)
  async redirects() {
    return [
      {
        source: "/dashboard/dolgozatszerkeszto",
        destination: "/dashboard/dolgozatok",
        permanent: true,
      },
      {
        source: "/dashboard/dolgozatszerkeszto/:id",
        destination: "/dashboard/dolgozatok/:id",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
