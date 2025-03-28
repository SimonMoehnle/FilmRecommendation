import jwt from "jsonwebtoken";

export function requireAnyRole(allowedRoles) {
  return async function (request, reply) {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return reply.status(401).send({ error: "Token fehlt" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!allowedRoles.includes(decoded.role)) {
        return reply.status(403).send({ error: "Nicht berechtigt" });
      }

      request.user = decoded;
    } catch (err) {
      return reply.status(401).send({ error: "Ungültiger Token" });
    }
  };
}

