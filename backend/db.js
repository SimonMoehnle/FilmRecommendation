import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
const user = process.env.NEO4J_USER || 'neo4j';
const password = process.env.NEO4J_PASSWORD || 'test';

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

function getSession() {
  return driver.session();
}

async function createSchema() {
  const session = driver.session();
  try {
    // Constraints für eindeutige Identifikation der Knoten
    await session.run(`
      CREATE CONSTRAINT userIdConstraint IF NOT EXISTS
      ON (u:User)
      ASSERT u.userId IS UNIQUE;
    `);
    await session.run(`
      CREATE CONSTRAINT movieIdConstraint IF NOT EXISTS
      ON (m:Movie)
      ASSERT m.movieId IS UNIQUE;
    `);
    await session.run(`
      CREATE CONSTRAINT genreNameConstraint IF NOT EXISTS
      ON (g:Genre)
      ASSERT g.genreName IS UNIQUE;
    `);
    await session.run(`
      CREATE CONSTRAINT personIdConstraint IF NOT EXISTS
      ON (p:Person)
      ASSERT p.personId IS UNIQUE;
    `);

    await session.run(`
      CALL apoc.schema.assert(
        {
          User: {
            userId: 'INTEGER',
            email: 'STRING',
            passwordHash: 'STRING',
            role: 'STRING',
            isBlocked: 'BOOLEAN'
          },
          Movie: {
            movieId: 'INTEGER',
            title: 'STRING',
            genre: 'STRING',
            description: 'STRING',
            releaseYear: 'INTEGER',
            averageRating: 'FLOAT',
            ratingCount: 'INTEGER'
          },
          Genre: {
            genreName: 'STRING',
            description: 'STRING'
          },
          Person: {
            personId: 'STRING',
            name: 'STRING'
          }
        },
        {
          RATED: { score: 'INTEGER', review: 'STRING', ratedAt: 'DATETIME' },
          BELONGS_TO: {},
          FAVORITE: {},
          SHARED: {},
          SIMILAR_TO: { similarity: 'FLOAT' },
          HAS_ACTOR: {},
          DIRECTED_BY: {}
        }
      );
    `);

    console.log('Lokales Neo4j-Schema wurde erfolgreich erstellt.');
  } catch (error) {
    console.error('Fehler beim Erstellen des Schemas:', error);
  } finally {
    await session.close();
  }
}

export { driver, createSchema, getSession };
