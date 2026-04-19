import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../config/prisma.js";

// Schema validation
const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  images: z.array(z.string()).optional(),
  categoryId: z.string().uuid(),
  stock: z.number().int().nonnegative().default(0),
  status: z.enum(["active", "inactive"]).default("active"),
});

const updateProductSchema = createProductSchema.partial();

const queryProductSchema = z.object({
  page: z.string().optional().default("1"),
  pageSize: z.string().optional().default("20"),
  status: z.enum(["active", "inactive"]).optional(),
  categoryId: z.string().uuid().optional(),
});

export async function productRoutes(app: FastifyInstance) {
  // Public: Get all products
  app.get("/api/v1/products", async (request, reply) => {
    try {
      const query = queryProductSchema.parse(request.query);
      const page = parseInt(query.page);
      const pageSize = parseInt(query.pageSize);
      const skip = (page - 1) * pageSize;

      const where: any = { status: "active" };
      if (query.status) where.status = query.status;
      if (query.categoryId) where.categoryId = query.categoryId;

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: { category: true },
          orderBy: { createdAt: "desc" },
          skip,
          take: pageSize,
        }),
        prisma.product.count({ where }),
      ]);

      return reply.send({
        code: 200,
        msg: "success",
        data: {
          list: products,
          pagination: {
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
          },
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          code: 400,
          msg: "Invalid query parameters",
          data: error.errors,
        });
      }
      throw error;
    }
  });

  // Public: Get product by ID
  app.get("/api/v1/products/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      return reply.status(404).send({ code: 404, msg: "Product not found" });
    }

    return reply.send({ code: 200, msg: "success", data: product });
  });

  // Admin: Get all products (including inactive)
  app.get("/api/v1/admin/products", async (request, reply) => {
    try {
      const query = queryProductSchema.parse(request.query);
      const page = parseInt(query.page);
      const pageSize = parseInt(query.pageSize);
      const skip = (page - 1) * pageSize;

      const where: any = {};
      if (query.status) where.status = query.status;
      if (query.categoryId) where.categoryId = query.categoryId;

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: { category: true },
          orderBy: { createdAt: "desc" },
          skip,
          take: pageSize,
        }),
        prisma.product.count({ where }),
      ]);

      return reply.send({
        code: 200,
        msg: "success",
        data: {
          list: products,
          pagination: {
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
          },
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          code: 400,
          msg: "Invalid query parameters",
          data: error.errors,
        });
      }
      throw error;
    }
  });

  // Admin: Create product
  app.post("/api/v1/admin/products", async (request, reply) => {
    try {
      const body = createProductSchema.parse(request.body);

      const product = await prisma.product.create({
        data: body,
        include: { category: true },
      });

      return reply.status(201).send({ code: 201, msg: "success", data: product });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          code: 400,
          msg: "Invalid request body",
          data: error.errors,
        });
      }
      throw error;
    }
  });

  // Admin: Update product
  app.put("/api/v1/admin/products/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      const body = updateProductSchema.parse(request.body);

      const product = await prisma.product.update({
        where: { id },
        data: body,
        include: { category: true },
      });

      return reply.send({ code: 200, msg: "success", data: product });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          code: 400,
          msg: "Invalid request body",
          data: error.errors,
        });
      }
      if (error instanceof Error && error.message.includes("Record to update not found")) {
        return reply.status(404).send({ code: 404, msg: "Product not found" });
      }
      throw error;
    }
  });

  // Admin: Delete product
  app.delete("/api/v1/admin/products/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      await prisma.product.delete({ where: { id } });
      return reply.send({ code: 200, msg: "success", data: null });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
        return reply.status(404).send({ code: 404, msg: "Product not found" });
      }
      throw error;
    }
  });
}
