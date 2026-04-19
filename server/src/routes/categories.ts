import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../config/prisma.js";

// Schema validation
const createCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  sortOrder: z.number().int().nonnegative().default(0),
});

const updateCategorySchema = createCategorySchema.partial();

const queryCategorySchema = z.object({
  page: z.string().optional().default("1"),
  pageSize: z.string().optional().default("20"),
});

export async function categoryRoutes(app: FastifyInstance) {
  // Public: Get all categories
  app.get("/api/v1/categories", async (request, reply) => {
    try {
      const query = queryCategorySchema.parse(request.query);
      const page = parseInt(query.page);
      const pageSize = parseInt(query.pageSize);
      const skip = (page - 1) * pageSize;

      const [categories, total] = await Promise.all([
        prisma.category.findMany({
          include: {
            products: {
              where: { status: "active" },
              select: { id: true },
            },
          },
          orderBy: { sortOrder: "asc" },
          skip,
          take: pageSize,
        }),
        prisma.category.count(),
      ]);

      const categoriesWithCount = categories.map((cat) => ({
        ...cat,
        productCount: cat.products.length,
        products: undefined,
      }));

      return reply.send({
        code: 200,
        msg: "success",
        data: {
          list: categoriesWithCount,
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

  // Public: Get category by ID
  app.get("/api/v1/categories/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          where: { status: "active" },
          select: { id: true },
        },
      },
    });

    if (!category) {
      return reply.status(404).send({ code: 404, msg: "Category not found" });
    }

    return reply.send({
      code: 200,
      msg: "success",
      data: {
        ...category,
        productCount: category.products.length,
        products: undefined,
      },
    });
  });

  // Admin: Get all categories
  app.get("/api/v1/admin/categories", async (request, reply) => {
    try {
      const query = queryCategorySchema.parse(request.query);
      const page = parseInt(query.page);
      const pageSize = parseInt(query.pageSize);
      const skip = (page - 1) * pageSize;

      const [categories, total] = await Promise.all([
        prisma.category.findMany({
          orderBy: { sortOrder: "asc" },
          skip,
          take: pageSize,
        }),
        prisma.category.count(),
      ]);

      return reply.send({
        code: 200,
        msg: "success",
        data: {
          list: categories,
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

  // Admin: Create category
  app.post("/api/v1/admin/categories", async (request, reply) => {
    try {
      const body = createCategorySchema.parse(request.body);

      const category = await prisma.category.create({
        data: body,
      });

      return reply.status(201).send({ code: 201, msg: "success", data: category });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          code: 400,
          msg: "Invalid request body",
          data: error.errors,
        });
      }
      if (error instanceof Error && error.message.includes("Unique constraint")) {
        return reply.status(409).send({ code: 409, msg: "Slug already exists" });
      }
      throw error;
    }
  });

  // Admin: Update category
  app.put("/api/v1/admin/categories/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      const body = updateCategorySchema.parse(request.body);

      const category = await prisma.category.update({
        where: { id },
        data: body,
      });

      return reply.send({ code: 200, msg: "success", data: category });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          code: 400,
          msg: "Invalid request body",
          data: error.errors,
        });
      }
      if (error instanceof Error && error.message.includes("Record to update not found")) {
        return reply.status(404).send({ code: 404, msg: "Category not found" });
      }
      if (error instanceof Error && error.message.includes("Unique constraint")) {
        return reply.status(409).send({ code: 409, msg: "Slug already exists" });
      }
      throw error;
    }
  });

  // Admin: Delete category
  app.delete("/api/v1/admin/categories/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      await prisma.category.delete({ where: { id } });
      return reply.send({ code: 200, msg: "success", data: null });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
        return reply.status(404).send({ code: 404, msg: "Category not found" });
      }
      if (error instanceof Error && error.message.includes("Foreign key constraint")) {
        return reply.status(400).send({
          code: 400,
          msg: "Cannot delete category with existing products",
        });
      }
      throw error;
    }
  });
}
