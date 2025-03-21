// vite.lib.config.ts
import path from "path";
import { lingui } from "file:///home/sergio/moxiehealth/frontend/node_modules/@lingui/vite-plugin/dist/index.cjs";
import react from "file:///home/sergio/moxiehealth/frontend/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { defineConfig } from "file:///home/sergio/moxiehealth/frontend/node_modules/vite/dist/node/index.js";
import { externalizeDeps } from "file:///home/sergio/moxiehealth/frontend/node_modules/vite-plugin-externalize-deps/dist/index.js";
import dts from "file:///home/sergio/moxiehealth/frontend/node_modules/@beda.software/vite-plugin-dts/dist/index.mjs";
var __vite_injected_original_dirname = "/home/sergio/moxiehealth/frontend/contrib/fhir-emr";
var vite_lib_config_default = defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          "macros",
          [
            "babel-plugin-styled-components",
            {
              displayName: true,
              fileName: true,
              meaninglessFileNames: ["index", "styles"]
            }
          ]
        ]
      }
    }),
    lingui(),
    dts({ entryRoot: "src/", exclude: ["node_modules/**", "**/*.stories.ts*"] }),
    externalizeDeps()
  ],
  resolve: {
    alias: [{ find: "src", replacement: path.resolve(__vite_injected_original_dirname, "./src/") }]
  },
  build: {
    copyPublicDir: false,
    lib: {
      entry: [
        path.resolve(__vite_injected_original_dirname, "src/index.ts"),
        path.resolve(__vite_injected_original_dirname, "src/components/index.ts"),
        path.resolve(__vite_injected_original_dirname, "src/uberComponents/index.ts"),
        path.resolve(__vite_injected_original_dirname, "src/containers/index.ts"),
        path.resolve(__vite_injected_original_dirname, "src/hooks/index.ts"),
        path.resolve(__vite_injected_original_dirname, "src/utils/index.ts"),
        path.resolve(__vite_injected_original_dirname, "src/services/index.ts"),
        path.resolve(__vite_injected_original_dirname, "src/contexts/index.ts"),
        path.resolve(__vite_injected_original_dirname, "src/theme/index.ts"),
        path.resolve(__vite_injected_original_dirname, "src/icons/index.ts"),
        path.resolve(__vite_injected_original_dirname, "src/dashboard.config.ts"),
        path.resolve(__vite_injected_original_dirname, "src/setupTests.ts")
      ],
      formats: ["es"],
      fileName: (format, entryName) => `${entryName}.js`
    },
    rollupOptions: {
      output: {
        preserveModules: true,
        preserveModulesRoot: "src/",
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name.includes("node_modules")) {
            return chunkInfo.name.replace(/node_modules/g, "ext") + ".js";
          }
          return "[name].js";
        }
      }
    }
  }
});
export {
  vite_lib_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5saWIuY29uZmlnLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvc2VyZ2lvL21veGllaGVhbHRoL2Zyb250ZW5kL2NvbnRyaWIvZmhpci1lbXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3Nlcmdpby9tb3hpZWhlYWx0aC9mcm9udGVuZC9jb250cmliL2ZoaXItZW1yL3ZpdGUubGliLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9zZXJnaW8vbW94aWVoZWFsdGgvZnJvbnRlbmQvY29udHJpYi9maGlyLWVtci92aXRlLmxpYi5jb25maWcudHNcIjtpbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcblxuaW1wb3J0IHsgbGluZ3VpIH0gZnJvbSAnQGxpbmd1aS92aXRlLXBsdWdpbic7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyBleHRlcm5hbGl6ZURlcHMgfSBmcm9tICd2aXRlLXBsdWdpbi1leHRlcm5hbGl6ZS1kZXBzJztcblxuaW1wb3J0IGR0cyBmcm9tICdAYmVkYS5zb2Z0d2FyZS92aXRlLXBsdWdpbi1kdHMnO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICAgIHBsdWdpbnM6IFtcbiAgICAgICAgcmVhY3Qoe1xuICAgICAgICAgICAgYmFiZWw6IHtcbiAgICAgICAgICAgICAgICBwbHVnaW5zOiBbXG4gICAgICAgICAgICAgICAgICAgICdtYWNyb3MnLFxuICAgICAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICAgICAnYmFiZWwtcGx1Z2luLXN0eWxlZC1jb21wb25lbnRzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZWFuaW5nbGVzc0ZpbGVOYW1lczogWydpbmRleCcsICdzdHlsZXMnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pLFxuICAgICAgICBsaW5ndWkoKSxcbiAgICAgICAgZHRzKHsgZW50cnlSb290OiAnc3JjLycsIGV4Y2x1ZGU6IFsnbm9kZV9tb2R1bGVzLyoqJywgJyoqLyouc3Rvcmllcy50cyonXSB9KSxcbiAgICAgICAgZXh0ZXJuYWxpemVEZXBzKCksXG4gICAgXSxcbiAgICByZXNvbHZlOiB7XG4gICAgICAgIGFsaWFzOiBbeyBmaW5kOiAnc3JjJywgcmVwbGFjZW1lbnQ6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy8nKSB9XSxcbiAgICB9LFxuICAgIGJ1aWxkOiB7XG4gICAgICAgIGNvcHlQdWJsaWNEaXI6IGZhbHNlLFxuICAgICAgICBsaWI6IHtcbiAgICAgICAgICAgIGVudHJ5OiBbXG4gICAgICAgICAgICAgICAgcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9pbmRleC50cycpLFxuICAgICAgICAgICAgICAgIHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvY29tcG9uZW50cy9pbmRleC50cycpLFxuICAgICAgICAgICAgICAgIHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvdWJlckNvbXBvbmVudHMvaW5kZXgudHMnKSxcbiAgICAgICAgICAgICAgICBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2NvbnRhaW5lcnMvaW5kZXgudHMnKSxcbiAgICAgICAgICAgICAgICBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2hvb2tzL2luZGV4LnRzJyksXG4gICAgICAgICAgICAgICAgcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy91dGlscy9pbmRleC50cycpLFxuICAgICAgICAgICAgICAgIHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvc2VydmljZXMvaW5kZXgudHMnKSxcbiAgICAgICAgICAgICAgICBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2NvbnRleHRzL2luZGV4LnRzJyksXG4gICAgICAgICAgICAgICAgcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy90aGVtZS9pbmRleC50cycpLFxuICAgICAgICAgICAgICAgIHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvaWNvbnMvaW5kZXgudHMnKSxcbiAgICAgICAgICAgICAgICBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2Rhc2hib2FyZC5jb25maWcudHMnKSxcbiAgICAgICAgICAgICAgICBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjL3NldHVwVGVzdHMudHMnKSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBmb3JtYXRzOiBbJ2VzJ10sXG4gICAgICAgICAgICBmaWxlTmFtZTogKGZvcm1hdCwgZW50cnlOYW1lKSA9PiBgJHtlbnRyeU5hbWV9LmpzYCxcbiAgICAgICAgfSxcbiAgICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgICAgICAgcHJlc2VydmVNb2R1bGVzOiB0cnVlLFxuICAgICAgICAgICAgICAgIHByZXNlcnZlTW9kdWxlc1Jvb3Q6ICdzcmMvJyxcbiAgICAgICAgICAgICAgICBlbnRyeUZpbGVOYW1lczogKGNodW5rSW5mbykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2h1bmtJbmZvLm5hbWUuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcycpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2h1bmtJbmZvLm5hbWUucmVwbGFjZSgvbm9kZV9tb2R1bGVzL2csICdleHQnKSArICcuanMnO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdbbmFtZV0uanMnO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBZ1YsT0FBTyxVQUFVO0FBRWpXLFNBQVMsY0FBYztBQUN2QixPQUFPLFdBQVc7QUFDbEIsU0FBUyxvQkFBb0I7QUFDN0IsU0FBUyx1QkFBdUI7QUFFaEMsT0FBTyxTQUFTO0FBUGhCLElBQU0sbUNBQW1DO0FBU3pDLElBQU8sMEJBQVEsYUFBYTtBQUFBLEVBQ3hCLFNBQVM7QUFBQSxJQUNMLE1BQU07QUFBQSxNQUNGLE9BQU87QUFBQSxRQUNILFNBQVM7QUFBQSxVQUNMO0FBQUEsVUFDQTtBQUFBLFlBQ0k7QUFBQSxZQUNBO0FBQUEsY0FDSSxhQUFhO0FBQUEsY0FDYixVQUFVO0FBQUEsY0FDVixzQkFBc0IsQ0FBQyxTQUFTLFFBQVE7QUFBQSxZQUM1QztBQUFBLFVBQ0o7QUFBQSxRQUNKO0FBQUEsTUFDSjtBQUFBLElBQ0osQ0FBQztBQUFBLElBQ0QsT0FBTztBQUFBLElBQ1AsSUFBSSxFQUFFLFdBQVcsUUFBUSxTQUFTLENBQUMsbUJBQW1CLGtCQUFrQixFQUFFLENBQUM7QUFBQSxJQUMzRSxnQkFBZ0I7QUFBQSxFQUNwQjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ0wsT0FBTyxDQUFDLEVBQUUsTUFBTSxPQUFPLGFBQWEsS0FBSyxRQUFRLGtDQUFXLFFBQVEsRUFBRSxDQUFDO0FBQUEsRUFDM0U7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNILGVBQWU7QUFBQSxJQUNmLEtBQUs7QUFBQSxNQUNELE9BQU87QUFBQSxRQUNILEtBQUssUUFBUSxrQ0FBVyxjQUFjO0FBQUEsUUFDdEMsS0FBSyxRQUFRLGtDQUFXLHlCQUF5QjtBQUFBLFFBQ2pELEtBQUssUUFBUSxrQ0FBVyw2QkFBNkI7QUFBQSxRQUNyRCxLQUFLLFFBQVEsa0NBQVcseUJBQXlCO0FBQUEsUUFDakQsS0FBSyxRQUFRLGtDQUFXLG9CQUFvQjtBQUFBLFFBQzVDLEtBQUssUUFBUSxrQ0FBVyxvQkFBb0I7QUFBQSxRQUM1QyxLQUFLLFFBQVEsa0NBQVcsdUJBQXVCO0FBQUEsUUFDL0MsS0FBSyxRQUFRLGtDQUFXLHVCQUF1QjtBQUFBLFFBQy9DLEtBQUssUUFBUSxrQ0FBVyxvQkFBb0I7QUFBQSxRQUM1QyxLQUFLLFFBQVEsa0NBQVcsb0JBQW9CO0FBQUEsUUFDNUMsS0FBSyxRQUFRLGtDQUFXLHlCQUF5QjtBQUFBLFFBQ2pELEtBQUssUUFBUSxrQ0FBVyxtQkFBbUI7QUFBQSxNQUMvQztBQUFBLE1BQ0EsU0FBUyxDQUFDLElBQUk7QUFBQSxNQUNkLFVBQVUsQ0FBQyxRQUFRLGNBQWMsR0FBRyxTQUFTO0FBQUEsSUFDakQ7QUFBQSxJQUNBLGVBQWU7QUFBQSxNQUNYLFFBQVE7QUFBQSxRQUNKLGlCQUFpQjtBQUFBLFFBQ2pCLHFCQUFxQjtBQUFBLFFBQ3JCLGdCQUFnQixDQUFDLGNBQWM7QUFDM0IsY0FBSSxVQUFVLEtBQUssU0FBUyxjQUFjLEdBQUc7QUFDekMsbUJBQU8sVUFBVSxLQUFLLFFBQVEsaUJBQWlCLEtBQUssSUFBSTtBQUFBLFVBQzVEO0FBRUEsaUJBQU87QUFBQSxRQUNYO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQ0osQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
