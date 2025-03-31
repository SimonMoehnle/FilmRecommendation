import fs from "fs/promises";
import path from "path";
import { writeLog } from "../services/writeLog.js";
import { requireAnyRole } from "../services/authMiddleware.js";

export default async function logRoutes(fastify) {
  // 📝 POST /log → Logs schreiben
  fastify.post("/log", {
    preHandler: requireAnyRole(["USER", "ADMIN"])
  }, async (request, reply) => {
    const { message, level = "info", metadata = {} } = request.body;

    try {
      await writeLog({ message, level, metadata });
      return reply.send({ success: true });
    } catch (error) {
      console.error("❌ Fehler in /log Route:", error);
      return reply.status(500).send({ error: "Logging fehlgeschlagen" });
    }
  });

  // 🔎 GET /admin/logs → Logs anzeigen
  fastify.get("/admin/logs", {
    preHandler: requireAnyRole(["ADMIN"])
  }, async (request, reply) => {
    try {
      // ❗ Optional: Admin-Rollenprüfung einbauen!
      const logPath = path.join(process.cwd(), "logs", "combined.log");
      const content = await fs.readFile(logPath, "utf-8");

      return reply.send({ log: content });
    } catch (err) {
      return reply.status(500).send({ error: "Fehler beim Lesen der Logdatei" });
    }
  });
}
