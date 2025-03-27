import jwt from "jsonwebtoken";

export function requireRole(requiredRole) {
  return async function (request, reply) {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return reply.status(401).send({ error: "Token fehlt" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.role !== requiredRole) {
        return reply.status(403).send({ error: "Nicht berechtigt" });
      }

      request.user = decoded; // z.B. { userId: 'U1', role: 'ADMIN' }
    } catch (err) {
      return reply.status(401).send({ error: "Ungültiger Token" });
    }
  };
}
