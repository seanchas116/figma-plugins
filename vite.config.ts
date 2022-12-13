import { defineConfig, Plugin, ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";

const plugin = (): Plugin => {
  return {
    name: "vite-plugin-component-catalog",
    configureServer(server: ViteDevServer) {
      // other html handled after vite's inner middlewares.
      return () => {
        server.middlewares.use("/", async (req, res, next) => {
          if (req.originalUrl !== "/") {
            return next();
          }

          const html = `
          <html>
            <head>
              <title>My App</title>
            </head>
            <body>
            <h1>Replace index.html</h1>
            </body>
          </html>
        `;

          res.end(await server.transformIndexHtml("/", html));
          next();
        });
      };
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), plugin()],
});
