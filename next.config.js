/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/login",
        destination: "/admin/login",
        permanent: true,
      },
      // Canonical host = www (match NEXT_PUBLIC_SITE_URL). HTTPS is enforced by Vercel.
      {
        source: "/:path*",
        has: [{ type: "host", value: "palawanacupuncture.com" }],
        destination: "https://www.palawanacupuncture.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
