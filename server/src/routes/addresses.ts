import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { authMiddleware } from "../middleware/auth.js";

// Schema validation
const createAddressSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().optional(),
  zip: z.string().min(1),
  country: z.string().default("US"),
  isDefault: z.boolean().default(false),
});

const updateAddressSchema = createAddressSchema.partial().omit({ isDefault: true });

export async function addressRoutes(app: FastifyInstance) {
  // All address routes require authentication
  app.addHook("onRequest", authMiddleware);

  // Get user's addresses
  app.get("/api/v1/addresses", async (request, reply) => {
    const user = (request as any).user;

    const addresses = await prisma.address.findMany({
      where: {
        userId: user.userId,
        orderId: null, // Only get addresses not used in orders
      },
      orderBy: { isDefault: "desc" },
    });

    return reply.send({ code: 200, msg: "success", data: { list: addresses } });
  });

  // Get address by ID
  app.get("/api/v1/addresses/:id", async (request, reply) => {
    const user = (request as any).user;
    const { id } = request.params as { id: string };

    const address = await prisma.address.findFirst({
      where: {
        id,
        userId: user.userId,
      },
    });

    if (!address) {
      return reply.status(404).send({ code: 404, msg: "Address not found" });
    }

    return reply.send({ code: 200, msg: "success", data: address });
  });

  // Create address
  app.post("/api/v1/addresses", async (request, reply) => {
    const user = (request as any).user;

    try {
      const body = createAddressSchema.parse(request.body);

      // If setting as default, remove default from other addresses
      if (body.isDefault) {
        await prisma.address.updateMany({
          where: {
            userId: user.userId,
            isDefault: true,
          },
          data: { isDefault: false },
        });
      }

      const address = await prisma.address.create({
        data: {
          ...body,
          userId: user.userId,
        },
      });

      return reply.status(201).send({ code: 201, msg: "success", data: address });
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

  // Update address
  app.put("/api/v1/addresses/:id", async (request, reply) => {
    const user = (request as any).user;
    const { id } = request.params as { id: string };

    try {
      const body = updateAddressSchema.parse(request.body);

      const address = await prisma.address.updateMany({
        where: {
          id,
          userId: user.userId,
        },
        data: body,
      });

      if (address.count === 0) {
        return reply.status(404).send({ code: 404, msg: "Address not found" });
      }

      // Fetch updated address
      const updatedAddress = await prisma.address.findUnique({
        where: { id },
      });

      return reply.send({ code: 200, msg: "success", data: updatedAddress });
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

  // Set default address
  app.put("/api/v1/addresses/:id/default", async (request, reply) => {
    const user = (request as any).user;
    const { id } = request.params as { id: string };

    // Verify address exists and belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id,
        userId: user.userId,
      },
    });

    if (!address) {
      return reply.status(404).send({ code: 404, msg: "Address not found" });
    }

    // Remove default from other addresses
    await prisma.address.updateMany({
      where: {
        userId: user.userId,
        isDefault: true,
      },
      data: { isDefault: false },
    });

    // Set as default
    await prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });

    return reply.send({ code: 200, msg: "success", data: null });
  });

  // Delete address
  app.delete("/api/v1/addresses/:id", async (request, reply) => {
    const user = (request as any).user;
    const { id } = request.params as { id: string };

    const result = await prisma.address.deleteMany({
      where: {
        id,
        userId: user.userId,
        orderId: null, // Can only delete addresses not used in orders
      },
    });

    if (result.count === 0) {
      return reply.status(404).send({
        code: 404,
        msg: "Address not found or cannot be deleted",
      });
    }

    return reply.send({ code: 200, msg: "success", data: null });
  });
}
