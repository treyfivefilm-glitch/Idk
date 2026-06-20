import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Routes `/api/comics/search` to the same handler used in production
 * (Vercel serverless function) so local `npm run dev` exercises identical
 * proxy logic — no separate dev-only mock of the route itself.
 */
function comicVineApiPlugin(): Plugin {
  return {
    name: 'comicvine-api-dev-middleware',
    configureServer(server) {
      server.middlewares.use('/api/comics/search', async (req, res) => {
        const { default: handler } = await server.ssrLoadModule('/api/comics/search.ts');
        await handler(req, res);
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Empty prefix loads ALL env vars (not just VITE_-prefixed) into process.env
  // so the dev-middleware proxy above can read COMICVINE_API_KEY etc.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));

  return {
    plugins: [react(), tailwindcss(), comicVineApiPlugin()],
  };
})
