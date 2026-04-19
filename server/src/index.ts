import Fastify from "fastify";
import cors from "@fastify/cors";
import { authRoutes } from "./routes/auth.js";
import { adminRoutes } from "./routes/admin.js";
import { productRoutes } from "./routes/products.js";
import { categoryRoutes } from "./routes/categories.js";
import { cartRoutes } from "./routes/cart.js";
import { orderRoutes } from "./routes/orders.js";
import { addressRoutes } from "./routes/addresses.js";
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

// Public product and category routes
app.register(productRoutes);
app.register(categoryRoutes);

// Cart routes (auth required)
app.register(cartRoutes);

// Order routes (auth required)
app.register(orderRoutes);

// Address routes (auth required)
app.register(addressRoutes);

// Admin routes (admin auth required)
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
