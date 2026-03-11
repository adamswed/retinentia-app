import { VertexAI } from '@google-cloud/vertexai';

export const vertex = new VertexAI({
  project: process.env.FIREBASE_PROJECT_ID,
  location: 'us-central1',
  googleAuthOptions: {
    credentials: {
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY,
    },
  },
});
