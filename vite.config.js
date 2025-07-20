import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		TanStackRouterVite({ autoCodeSplitting: true }),
		viteReact(),
		tailwindcss(),
	],
	server: {
		middlewareMode: false,
	},
	configureServer(server) {
		// Serve widget.min.js from dist folder during development
		server.middlewares.use("/widget.min.js", (req, res, next) => {
			const widgetPath = resolve(__dirname, "dist/widget.min.js");
			if (existsSync(widgetPath)) {
				res.setHeader("Content-Type", "application/javascript");
				const fs = require("fs");
				const content = fs.readFileSync(widgetPath);
				res.end(content);
			} else {
				res.statusCode = 404;
				res.end("Widget not found. Run npm run build first.");
			}
		});
	},
	test: {
		globals: true,
		environment: "jsdom",
	},
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
		},
	},
	build: {
		rollupOptions: {
			input: {
				main: resolve(__dirname, "index.html"),
				widget: resolve(__dirname, "src/widget/index.ts"),
			},
			output: {
				entryFileNames: (assetInfo) => {
					return assetInfo.name === "widget"
						? "widget.min.js"
						: "assets/[name]-[hash].js";
				},
				chunkFileNames: "assets/[name]-[hash].js",
				assetFileNames: "assets/[name]-[hash][extname]",
			},
		},
	},
});
