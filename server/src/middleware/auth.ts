import { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
}

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return reply.status(401).send({ code: 401, msg: "Missing or invalid Authorization header" });
  }

  try {
    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    (request as any).user = payload;
  } catch {
    return reply.status(401).send({ code: 401, msg: "Invalid or expired token" });
  }
}

export async function adminMiddleware(request: FastifyRequest, reply: FastifyReply) {
  await authMiddleware(request, reply);
  if (reply.sent) return;

  const user = (request as any).user as JwtPayload;
  if (user.role !== "admin") {
    return reply.status(403).send({ code: 403, msg: "Admin access required" });
  }
}
