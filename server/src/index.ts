import Fastify from "fastify";
import cors from "@fastify/cors";
import { authRoutes } from "./routes/auth.js";
import { adminRoutes } from "./routes/admin.js";
import { adminMiddleware } from "./middleware/auth.js";
import { env } from "./config/env.js";

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });

// Health check
app.get("/health", async () => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

// Public auth routes
app.register(authRoutes);

// Admin routes (auth required)
app.register(
  async (instance) => {
    instance.addHook("onRequest", adminMiddleware);
    await adminRoutes(instance);
  },
  { prefix: "" }
);

const start = async () => {
  try {
    await app.listen({ port: env.port, host: "0.0.0.0" });
    console.log(`🚀 Server running on http://localhost:${env.port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
