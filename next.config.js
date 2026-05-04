/** @type {import('next').NextConfig} */
const nextConfig = {
  // Avoid intermittent dev errors: "SegmentViewNode" missing from React Client Manifest /
  // __webpack_modules__[moduleId] is not a function (stale HMR + segment explorer on Windows).
  experimental: {
    devtoolSegmentExplorer: false,
  },
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
