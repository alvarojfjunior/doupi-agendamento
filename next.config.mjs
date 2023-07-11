/** @type {import('next').NextConfig} */
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env/server.mjs"));

const nextConfig = {
  env: {
    NEXT_PUBLIC_API_BODY_SIZE_LIMIT: "5mb",
  },
  reactStrictMode: true,
  // esmExternals: false,
  images: {
    dangerouslyAllowSVG: true,
    unoptimized: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
