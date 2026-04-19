import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { authMiddleware } from "../middleware/auth.js";

// Schema validation
const createOrderSchema = z.object({
  addressId: z.string().uuid(),
  cartItemIds: z.array(z.string().uuid()).min(1),
});

const queryOrderSchema = z.object({
  page: z.string().optional().default("1"),
  pageSize: z.string().optional().default("20"),
  status: z.enum(["pending", "paid", "shipped", "delivered", "cancelled"]).optional(),
});

export async function orderRoutes(app: FastifyInstance) {
  // All order routes require authentication
  app.addHook("onRequest", authMiddleware);

  // Get user's orders
  app.get("/api/v1/orders", async (request, reply) => {
    const user = (request as any).user;

    try {
      const query = queryOrderSchema.parse(request.query);
      const page = parseInt(query.page);
      const pageSize = parseInt(query.pageSize);
      const skip = (page - 1) * pageSize;

      const where: any = { userId: user.userId };
      if (query.status) where.status = query.status;

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: pageSize,
        }),
        prisma.order.count({ where }),
      ]);

      return reply.send({
        code: 200,
        msg: "success",
        data: {
          list: orders,
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

  // Get order by ID
  app.get("/api/v1/orders/:id", async (request, reply) => {
    const user = (request as any).user;
    const { id } = request.params as { id: string };

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        address: true,
      },
    });

    if (!order) {
      return reply.status(404).send({ code: 404, msg: "Order not found" });
    }

    // Check if user owns this order
    if (order.userId !== user.userId) {
      return reply.status(403).send({ code: 403, msg: "Access denied" });
    }

    return reply.send({ code: 200, msg: "success", data: order });
  });

  // Create order from cart
  app.post("/api/v1/orders", async (request, reply) => {
    const user = (request as any).user;

    try {
      const body = createOrderSchema.parse(request.body);

      // Verify address exists and belongs to user
      const address = await prisma.address.findFirst({
        where: {
          id: body.addressId,
          userId: user.userId,
          orderId: null, // Address not already used in another order
        },
      });

      if (!address) {
        return reply.status(404).send({ code: 404, msg: "Address not found or already used" });
      }

      // Get cart items
      const cartItems = await prisma.cartItem.findMany({
        where: {
          id: { in: body.cartItemIds },
          userId: user.userId,
        },
        include: {
          product: true,
        },
      });

      if (cartItems.length === 0) {
        return reply.status(400).send({ code: 400, msg: "No valid cart items found" });
      }

      // Check stock availability
      for (const item of cartItems) {
        if (item.product.status !== "active") {
          return reply.status(400).send({
            code: 400,
            msg: `Product ${item.product.name} is not available`,
          });
        }
        if (item.product.stock < item.quantity) {
          return reply.status(400).send({
            code: 400,
            msg: `Insufficient stock for ${item.product.name}`,
            data: { availableStock: item.product.stock },
          });
        }
      }

      // Calculate total
      const total = cartItems.reduce((sum, item) => {
        return sum + Number(item.product.price) * item.quantity;
      }, 0);

      // Create order
      const order = await prisma.order.create({
        data: {
          userId: user.userId,
          status: "pending",
          totalAmount: total,
        },
      });

      // Update address to link to order
      await prisma.address.update({
        where: { id: body.addressId },
        data: { orderId: order.id },
      });

      // Update product stock
      for (const item of cartItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Remove cart items
      await prisma.cartItem.deleteMany({
        where: {
          id: { in: body.cartItemIds },
        },
      });

      // Fetch complete order
      const completeOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include: {
          address: true,
        },
      });

      return reply.status(201).send({ code: 201, msg: "success", data: completeOrder });
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

  // Cancel order
  app.put("/api/v1/orders/:id/cancel", async (request, reply) => {
    const user = (request as any).user;
    const { id } = request.params as { id: string };

    const order = await prisma.order.findUnique({
      where: { id },
      include: { address: true },
    });

    if (!order) {
      return reply.status(404).send({ code: 404, msg: "Order not found" });
    }

    if (order.userId !== user.userId) {
      return reply.status(403).send({ code: 403, msg: "Access denied" });
    }

    if (order.status !== "pending") {
      return reply.status(400).send({
        code: 400,
        msg: "Only pending orders can be cancelled",
      });
    }

    await prisma.order.update({
      where: { id },
      data: { status: "cancelled" },
    });

    return reply.send({ code: 200, msg: "success", data: null });
  });
}
