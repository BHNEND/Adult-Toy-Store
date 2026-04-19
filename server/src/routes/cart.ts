import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { authMiddleware } from "../middleware/auth.js";

// Schema validation
const addToCartSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive().default(1),
});

const updateCartItemSchema = z.object({
  quantity: z.number().int().nonnegative(),
});

export async function cartRoutes(app: FastifyInstance) {
  // All cart routes require authentication
  app.addHook("onRequest", authMiddleware);

  // Get cart items
  app.get("/api/v1/cart", async (request, reply) => {
    const user = (request as any).user;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.userId },
      include: {
        product: {
          include: { category: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const total = cartItems.reduce((sum, item) => {
      return sum + Number(item.product.price) * item.quantity;
    }, 0);

    return reply.send({
      code: 200,
      msg: "success",
      data: {
        items: cartItems,
        total: total.toFixed(2),
        itemCount: cartItems.length,
      },
    });
  });

  // Add item to cart
  app.post("/api/v1/cart", async (request, reply) => {
    const user = (request as any).user;

    try {
      const body = addToCartSchema.parse(request.body);

      // Verify product exists and is active
      const product = await prisma.product.findUnique({
        where: { id: body.productId },
      });

      if (!product) {
        return reply.status(404).send({ code: 404, msg: "Product not found" });
      }

      if (product.status !== "active") {
        return reply.status(400).send({ code: 400, msg: "Product is not available" });
      }

      if (product.stock < body.quantity) {
        return reply.status(400).send({
          code: 400,
          msg: "Insufficient stock",
          data: { availableStock: product.stock },
        });
      }

      // Upsert cart item
      const cartItem = await prisma.cartItem.upsert({
        where: {
          userId_productId: {
            userId: user.userId,
            productId: body.productId,
          },
        },
        update: {
          quantity: {
            increment: body.quantity,
          },
        },
        create: {
          userId: user.userId,
          productId: body.productId,
          quantity: body.quantity,
        },
        include: {
          product: {
            include: { category: true },
          },
        },
      });

      return reply.status(201).send({ code: 201, msg: "success", data: cartItem });
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

  // Update cart item quantity
  app.put("/api/v1/cart/:id", async (request, reply) => {
    const user = (request as any).user;
    const { id } = request.params as { id: string };

    try {
      const body = updateCartItemSchema.parse(request.body);

      if (body.quantity === 0) {
        // Delete item if quantity is 0
        await prisma.cartItem.deleteMany({
          where: {
            id,
            userId: user.userId,
          },
        });
        return reply.send({ code: 200, msg: "success", data: null });
      }

      const cartItem = await prisma.cartItem.updateMany({
        where: {
          id,
          userId: user.userId,
        },
        data: {
          quantity: body.quantity,
        },
      });

      if (cartItem.count === 0) {
        return reply.status(404).send({ code: 404, msg: "Cart item not found" });
      }

      return reply.send({ code: 200, msg: "success", data: null });
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

  // Remove item from cart
  app.delete("/api/v1/cart/:id", async (request, reply) => {
    const user = (request as any).user;
    const { id } = request.params as { id: string };

    const result = await prisma.cartItem.deleteMany({
      where: {
        id,
        userId: user.userId,
      },
    });

    if (result.count === 0) {
      return reply.status(404).send({ code: 404, msg: "Cart item not found" });
    }

    return reply.send({ code: 200, msg: "success", data: null });
  });

  // Clear cart
  app.delete("/api/v1/cart", async (request, reply) => {
    const user = (request as any).user;

    await prisma.cartItem.deleteMany({
      where: { userId: user.userId },
    });

    return reply.send({ code: 200, msg: "success", data: null });
  });
}
