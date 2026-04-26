import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Path safety: old editor URLs redirect to the dolgozatok routes
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
