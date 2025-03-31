import { getSession } from "../db.js";
import bcrypt from "bcryptjs"; 

export async function registerAdmin(name, email, password) {
  const session = getSession();
  try {
    // Prüfen, ob E-Mail bereits existiert
    const existingUser = await session.run(
      "MATCH (u:User {email: $email}) RETURN u",
      { email }
    );

    if (existingUser.records.length > 0) {
      return { error: "E-Mail bereits vergeben!" };
    }

    // Passwort hashen
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Admin erstellen
    const result = await session.run(
      `
      MERGE (counter:Counter {id: "userId"}) 
      ON CREATE SET counter.value = 1 
      ON MATCH SET counter.value = counter.value + 1 
      WITH counter.value AS userId
      CREATE (u:User {
        userId: userId, 
        name: $name, 
        email: $email, 
        passwordHash: $hashedPassword, 
        role: "ADMIN", 
        isBlocked: false
      })
      RETURN u.userId AS userId
      `,
      { name, email, hashedPassword }
    );

    const rawUserId = result.records[0].get("userId");
    return {
      message: "Admin erfolgreich registriert!",
      userId: rawUserId?.low ?? rawUserId,
    };
  } catch (error) {
    console.error("Fehler bei der Admin-Registrierung:", error);
    throw error;
  } finally {
    await session.close();
  }
}

export async function blockUser(userId, block) {
  const session = getSession();
  try {
    await session.run(
      `
      MATCH (u:User {userId: toInteger($userId)})
      SET u.isBlocked = $block
      `,
      { userId, block }
    );

    return {
      message: `Benutzer wurde erfolgreich ${block ? "gesperrt" : "entsperrt"}.`,
      userId,
    };
  } finally {
    await session.close();
  }
}


// Funktion zur Abfrage von Genre-Trends
export async function getGenreTrends(days = 30, groupBy = "day") {
  const session = getSession(); 
  const baseParams = { days: Number(days) };

  const query =
    groupBy === "week"
      ? `
        MATCH (:User)-[r:RATED]->(m:Movie)
        WHERE r.ratedAt >= datetime() - duration({days: $days})
        WITH m.genre AS genre,
             toString(date.truncate('week', r.ratedAt)) AS period,
             avg(r.score) AS avgRating,
             count(*) AS ratingCount
        RETURN genre, period, avgRating, ratingCount
        ORDER BY period
      `
      : `
        MATCH (:User)-[r:RATED]->(m:Movie)
        WHERE r.ratedAt >= datetime() - duration({days: $days})
        WITH m.genre AS genre,
             toString(date(r.ratedAt)) AS period,
             avg(r.score) AS avgRating,
             count(*) AS ratingCount
        RETURN genre, period, avgRating, ratingCount
        ORDER BY period
      `;

  try {
    const result = await session.run(query, baseParams);
    console.log("📊 Genre-Trends:", result.records.length);

    const mapped = result.records.map((record) => ({
      genre: record.get("genre"),
      period: record.get("period"),
      avgRating: record.get("avgRating").toNumber?.() ?? record.get("avgRating"),
      ratingCount: record.get("ratingCount").toNumber?.() ?? record.get("ratingCount"),
    }));

    return { data: mapped }; 
  } catch (error) {
    console.error("❌ Fehler in getGenreTrends():", error);
    return { error: "Fehler beim Abrufen der Genre-Trends" };
  } finally {
    await session.close();
  }
}






