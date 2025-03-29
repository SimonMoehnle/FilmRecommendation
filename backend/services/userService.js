import bcrypt from "bcryptjs";
import { getSession } from "../db.js";


// 🚀 Funktion: Neuen User erstellen
export async function registerUser(name, email, password) {
    const session = getSession();
    try {
        // ✅ 1. Prüfen, ob die E-Mail bereits existiert
        const existingUser = await session.run(
            "MATCH (u:User {email: $email}) RETURN u",
            { email }
        );

        if (existingUser.records.length > 0) {
            return { error: "E-Mail bereits vergeben!" };
        }

        // ✅ 2. Passwort sicher hashen
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // ✅ 3. User-ID automatisch generieren
        const result = await session.run(`
            MERGE (counter:Counter {id: "userId"}) 
            ON CREATE SET counter.value = 1 
            ON MATCH SET counter.value = counter.value + 1 
            WITH counter.value AS userId
            CREATE (u:User {
                userId: userId, 
                name: $name, 
                email: $email, 
                passwordHash: $hashedPassword, 
                role: "USER", 
                isBlocked: false
            })
            RETURN u.userId AS userId
        `, { name, email, hashedPassword });
        
        const rawUserId = result.records[0].get("userId");
        return { 
            message: "User erfolgreich registriert!", 
            userId: rawUserId?.low ?? rawUserId
        };
    } catch (error) {
        console.error("Fehler bei der Registrierung:", error);
        throw error;
    } finally {
        await session.close();
    }
}

export async function deleteUser(userId) {
        const session = getSession();
    try {
        // ✅ 1. Prüfen, ob der User existiert
        const userExists = await session.run(
            "MATCH (u:User {userId: toInteger($userId)}) RETURN u",
            { userId }
        );

        if (userExists.records.length === 0) {
            return { error: "User nicht gefunden!" };
        }

        // ✅ 2. User mit allen Beziehungen löschen
        await session.run(
            "MATCH (u:User {userId: toInteger($userId)}) DETACH DELETE u",
            { userId }
        );

        return { message: "User erfolgreich gelöscht!", userId };
    } catch (error) {
        console.error("Fehler beim Löschen des Users:", error);
        throw error;
    } finally {
        await session.close();
    }
}

// 🚀 Funktion: Benutzerprofil mit Bewertungen abrufen
export async function getUserProfile(userId) {
    const session = getSession();
    try {
        const result = await session.run(
            `
            MATCH (u:User {userId: $userId})-[r:RATED]->(m:Movie)
            RETURN m {
              .movieId, .title, .genre, .description, .releaseYear, .averageRating, .ratingCount
            } AS movie,
            r.score AS score,
            r.review AS review,
            r.ratedAt AS ratedAt
            `,
            { userId }
        );

        const ratedMovies = result.records.map(record => {
            const movie = record.get("movie");
            return {
                movieId: movie.movieId?.low ?? movie.movieId,
                title: movie.title,
                genre: movie.genre,
                description: movie.description,
                releaseYear: movie.releaseYear?.low ?? movie.releaseYear,
                averageRating: movie.averageRating,
                ratingCount: movie.ratingCount?.low ?? movie.ratingCount,
                score: record.get("score")?.low ?? record.get("score"),
                review: record.get("review"),
                ratedAt: record.get("ratedAt")
            };
        });

        return {
            userId,
            ratedMovies
        };
    } catch (error) {
        console.error("Fehler beim Abrufen des Benutzerprofils:", error);
        throw error;
    } finally {
        await session.close();
    }
}

// Funktion: Alle Benutzer abrufen
export async function getAllUsers() {
    const session = getSession();
    try {
        const result = await session.run("MATCH (u:User) RETURN u");
        const users = result.records.map(record => {
            const user = record.get("u").properties;
            return {
                userId: user.userId?.low ?? user.userId,
                name: user.name,
                email: user.email,
                role: user.role,
                isBlocked: user.isBlocked,
            };
        });
        return users;
    } catch (error) {
        console.error("Fehler beim Abrufen der Benutzer:", error);
        throw error;
    } finally {
        await session.close();
    }
}

//Funktion: Benutzerprofil aktualisieren
export async function updateUserProfile(userId, { name, email, password }) {
    const session = getSession();
    try {
      const updates = [];
      const params = { userId };
  
      if (name) {
        updates.push("u.name = $name");
        params.name = name;
      }
  
      if (email) {
        updates.push("u.email = $email");
        params.email = email;
      }
  
      if (password) {
        const passwordHash = await bcrypt.hash(password, 10);
        updates.push("u.passwordHash = $passwordHash");
        params.passwordHash = passwordHash;
      }
  
      if (updates.length === 0) {
        throw new Error("Keine gültigen Felder zum Aktualisieren übergeben.");
      }
  
      const query = `
        MATCH (u:User {userId: $userId})
        SET ${updates.join(", ")}
        RETURN u.userId AS userId, u.name AS name, u.email AS email
      `;
  
      const result = await session.run(query, params);
  
      if (result.records.length === 0) {
        throw new Error("User wurde nicht gefunden.");
      }
  
      const record = result.records[0];

        return {
        message: "Profil erfolgreich aktualisiert!",
        user:{
            userId: record.get("userId")?.low ?? record.get("userId"),
            name: record.get("name") ?? null,
            email: record.get("email") ?? null,
            },
        };
       
    } finally {
      await session.close();
    }
  }

// Funktion: Benutzer blockieren oder entsperren
export async function blockUser(userId, block) {
    const session = getSession();
    try {
        // Prüfen, ob der Benutzer existiert
        const userExists = await session.run(
            "MATCH (u:User {userId: toInteger($userId)}) RETURN u",
            { userId }
        );

        if (userExists.records.length === 0) {
            return { error: "Benutzer nicht gefunden!" };
        }

        // Benutzer blockieren oder entsperren
        await session.run(
            "MATCH (u:User {userId: toInteger($userId)}) SET u.isBlocked = $block RETURN u",
            { userId, block }
        );

        return {
            message: block ? "Benutzer erfolgreich blockiert!" : "Benutzer erfolgreich entsperrt!",
            userId,
        };
    } catch (error) {
        console.error("Fehler beim Blockieren/Entsperren des Benutzers:", error);
        throw error;
    } finally {
        await session.close();
    }
}


