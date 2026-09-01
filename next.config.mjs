const isProd = process.env.NODE_ENV === "production";
const internalHost = process.env.TAURI_DEV_HOST || "localhost";
// Must match `dev` in package.json and `devUrl` in src-tauri/tauri.conf.json.
// 3000/3001 are already taken by other projects on this machine.
const DEV_PORT = 3456;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tauri has no Node server: everything must be static HTML/JS/CSS.
  output: "export",
  // next/image's optimizer is a server feature; unoptimized makes it a passthrough.
  images: { unoptimized: true },
  // Emits out/thumbnail-generator/index.html instead of .../thumbnail-generator.html,
  // which is what the asset protocol can actually resolve.
  trailingSlash: true,
  // Tauri loads dev from tauri://localhost, so relative _next/static URLs 404
  // unless they are absolutised against the dev server.
  assetPrefix: isProd ? undefined : `http://${internalHost}:${DEV_PORT}`,
  reactStrictMode: true,
};

export default nextConfig;
