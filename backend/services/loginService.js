import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

fastify.post("/login", async (request, reply) => {
  const { email, password } = request.body;
  const session = getSession();

  const result = await session.run("MATCH (u:User {email: $email}) RETURN u", { email });

  if (result.records.length === 0) {
    return reply.status(401).send({ error: "Ungültige Anmeldedaten" });
  }

  const user = result.records[0].get("u").properties;
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return reply.status(401).send({ error: "Falsches Passwort" });
  }

  const token = jwt.sign(
    { userId: user.userId, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return reply.send({ message: "Login erfolgreich", token });
});
