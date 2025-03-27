// movies-schema.js

export const createMovieSchema = {
    body: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        releaseYear: { type: 'integer' }
      },
      required: ['title', 'description', 'releaseYear']
    },
    response: {
      200:{
        type: 'object',
        properties: {
        movieId: { type: 'integer' }
       }
    },
      201: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          movieId: { type: 'integer' }
        }
      },
      400: {
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      }
    }
  };
  