import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath, URL } from "node:url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    nodePolyfills({
      include: ['crypto', 'stream', 'util', 'buffer'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "client", "src"),
      "@shared": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "shared"),
      "@assets": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "attached_assets"),
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: [
      '@solana/wallet-adapter-base',
      '@solana/wallet-adapter-react',
      '@solana/wallet-adapter-react-ui',
      '@solana/wallet-adapter-wallets',
      '@solana/web3.js'
    ]
  },
  root: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "client"),
  build: {
    outDir: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "dist"),
    emptyOutDir: true,
    rollupOptions: {
      external: [],
    },
  },
  server: {
    fs: {
      strict: false,
    },
  },
});
