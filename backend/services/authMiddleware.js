import jwt from "jsonwebtoken";

export function requireAnyRole(allowedRoles) {
  return async function (request, reply) {
    try {
      await request.jwtVerify(); // prüft Token & füllt request.user

      if (!allowedRoles.includes(request.user.role)) {
        return reply.status(403).send({ error: "Nicht berechtigt" });
      }
    } catch (err) {
      return reply.status(401).send({ error: "Token fehlt oder ungültig" });
    }
  };
}