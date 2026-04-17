import { FastifyInstance } from "fastify";
import { prisma } from "../config/prisma.js";

export async function adminRoutes(app: FastifyInstance) {
  // List products
  app.get("/api/v1/admin/products", async (request, reply) => {
    const { page = "1", pageSize = "20", status, categoryId } = request.query as any;
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const take = parseInt(pageSize);

    const where: any = {};
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.product.count({ where }),
    ]);

    return reply.send({
      code: 200,
      msg: "success",
      data: {
        list: products,
        pagination: { page: parseInt(page), pageSize: take, total, totalPages: Math.ceil(total / take) },
      },
    });
  });

  // Create product
  app.post("/api/v1/admin/products", async (request, reply) => {
    const { name, description, price, images, categoryId, stock, status } = request.body as any;

    if (!name || price == null || !categoryId) {
      return reply.status(400).send({ code: 400, msg: "name, price, and categoryId are required" });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        price,
        images: images || [],
        categoryId,
        stock: stock ?? 0,
        status: status || "active",
      },
      include: { category: true },
    });

    return reply.status(201).send({ code: 201, msg: "success", data: product });
  });
}
