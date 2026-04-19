import { FastifyInstance } from "fastify";
import { prisma } from "../config/prisma.js";

export async function adminRoutes(app: FastifyInstance) {
  // Admin routes placeholder - product and category admin routes moved to products.ts and categories.ts
  // This file can be used for future admin-only endpoints that don't fit into specific resource routes
}
