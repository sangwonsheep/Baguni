import fs from 'node:fs';
import { resolve } from 'node:path';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import type { PluginOption } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import tsconfigPaths from 'vite-tsconfig-paths';

function updateManifestPlugin(mode: string): PluginOption {
  const env = loadEnv(mode, process.cwd());

  return {
    name: 'update-manifest-plugin',
    generateBundle() {
      const manifestPath = resolve(
        __dirname,
        'src/chrome-extension/manifest.json',
      );
      const outManifestPath = resolve(__dirname, 'dist/manifest.json');

      if (!fs.existsSync(manifestPath)) {
        console.error(`Error: manifest.json not found at ${manifestPath}`);
        return;
      }

      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

      manifest.host_permissions = [
        env.VITE_HOST_PERMISSIONS_HTTPS,
        env.VITE_HOST_PERMISSIONS_HTTP,
        env.VITE_PUBLIC_API,
      ];

      if (!fs.existsSync(resolve(__dirname, 'dist'))) {
        fs.mkdirSync(resolve(__dirname, 'dist'), { recursive: true });
      }

      try {
        fs.writeFileSync(outManifestPath, JSON.stringify(manifest, null, 2));
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error writing manifest.json: ${error.message}`);
        }
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          background: resolve(__dirname, 'src/chrome-extension/background.ts'),
          popup: resolve(__dirname, './index.html'),
        },
        output: {
          entryFileNames: '[name].js',
        },
      },
      outDir: 'dist',
    },
    plugins: [
      react(),
      vanillaExtractPlugin(),
      tsconfigPaths(),
      updateManifestPlugin(mode),
      viteStaticCopy({
        targets: [
          {
            src: 'src/chrome-extension/*.png',
            dest: '.',
          },
        ],
      }),
    ],
  };
});
