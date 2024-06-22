import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ArcoResolver } from 'unplugin-vue-components/resolvers';
import path from 'path';
import UnpluginSvgComponent from 'unplugin-svg-component/vite';
import { vitePluginForArco } from '@arco-plugins/vite-vue';

// aliases
const aliases = {
  '@/': `${path.resolve(__dirname, 'src')}/`,
  '@/styles': `${path.resolve(__dirname, 'src')}/styles`,
  '@/components': `${path.resolve(__dirname, 'src')}/components`,
  '@/utils': `${path.resolve(__dirname, 'src')}/utils`,
  '@/stores': `${path.resolve(__dirname, 'src')}/stores`,
  '@/libs': `${path.resolve(__dirname, 'src')}/libs`,
  '@/hooks': `${path.resolve(__dirname, 'src')}/hooks`,
  '@/internal': `${path.resolve(__dirname, 'src')}/internal`,
  '@package': `${path.resolve(__dirname)}/package.json`,
  //
  'hls.js': 'hls.js/dist/hls.min.js',
};

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: aliases,
  },
  plugins: [
    vue(),
    AutoImport({
      dts: true,
      resolvers: [ArcoResolver({ resolveIcons: true })],
    }),
    Components({
      dts: true, // enabled by default if `typescript` is installed
      resolvers: [
        ArcoResolver({
          sideEffect: true,
          resolveIcons: true,
        }),
      ],
    }),
    vitePluginForArco({
      style: 'css',
    }),
    UnpluginSvgComponent({
      iconDir: [path.resolve(__dirname, 'src/assets/icons')],
      dts: true,
      preserveColor: path.resolve(__dirname, 'src/assets/icons/common'),
      dtsDir: path.resolve(__dirname, 'typings'),
      svgSpriteDomId: 'xm-svg-id',
      prefix: 'icon',
      componentName: 'XmSvgIcon',
      symbolIdFormatter: (svgName: string, prefix: string): string => {
        const nameArr = svgName.split('/');
        if (prefix) nameArr.unshift(prefix);
        return nameArr.join('-').replace(/\.svg$/, '');
      },
      optimizeOptions: undefined,
      vueVersion: 3,
      scanStrategy: 'component',
      treeShaking: true,
    }),
  ],

  // Vite optons tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  // prevent vite from obscuring rust errors
  clearScreen: false,
  // tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
  },
  // to make use of `TAURI_DEBUG` and other env variables
  // https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    // Tauri supports es2021
    target: ['es2021', 'chrome100', 'safari13'],
    // don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,
    // 多入口
    // https://cn.vitejs.dev/guide/build.html#multi-page-app
    rollupOptions: {
      input: [path.resolve(__dirname, 'index.html'), path.resolve(__dirname, 'splashscreen.html')],
    },
  },
});
