import bcrypt from "bcrypt";

// 🚀 Funktion: Alle User abrufen
export async function getAllUsers() {
    const session = getSession();
    try {
        const result = await session.run("MATCH (u:User) RETURN u");
        return result.records.map((record) => record.get("u").properties);
    } catch (error) {
        console.error("Fehler beim Abrufen der User:", error);
        throw error;
    } finally {
        await session.close();
    }
}

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
            WITH counter.value AS newId
            CREATE (u:User {
                userId: "U" + newId, 
                name: $name, 
                email: $email, 
                passwordHash: $hashedPassword, 
                role: "USER", 
                isBlocked: false, 
                createdAt: datetime(), 
                updatedAt: datetime()
            })
            RETURN u.userId AS userId
        `, { name, email, hashedPassword });

        return { message: "User erfolgreich registriert!", userId: result.records[0].get("userId") };
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
            "MATCH (u:User {userId: $userId}) RETURN u",
            { userId }
        );

        if (userExists.records.length === 0) {
            return { error: "User nicht gefunden!" };
        }

        // ✅ 2. User mit allen Beziehungen löschen
        await session.run(
            "MATCH (u:User {userId: $userId}) DETACH DELETE u",
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
