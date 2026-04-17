import { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { generateToken } from "../middleware/auth.js";

export async function authRoutes(app: FastifyInstance) {
  // Register
  app.post("/api/v1/auth/register", async (request, reply) => {
    const { email, password, name } = request.body as any;

    if (!email || !password) {
      return reply.status(400).send({ code: 400, msg: "Email and password are required" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return reply.status(409).send({ code: 409, msg: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash, name: name || null },
    });

    const token = generateToken({ userId: user.id, email: user.email, role: user.role });

    return reply.status(201).send({
      code: 201,
      msg: "success",
      data: {
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      },
    });
  });

  // Login
  app.post("/api/v1/auth/login", async (request, reply) => {
    const { email, password } = request.body as any;

    if (!email || !password) {
      return reply.status(400).send({ code: 400, msg: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return reply.status(401).send({ code: 401, msg: "Invalid email or password" });
    }

    const token = generateToken({ userId: user.id, email: user.email, role: user.role });

    return reply.send({
      code: 200,
      msg: "success",
      data: {
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      },
    });
  });
}
