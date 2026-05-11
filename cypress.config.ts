import { defineConfig } from 'cypress';
import * as dotenv from 'dotenv';
import admin from 'firebase-admin';

dotenv.config({ path: '.env.local' });
import { getApps, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getAdminFirestore() {
  const serviceAccount = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    universe_domain: 'googleapis.com',
  };

  const currentApps = getApps();
  const app = currentApps.length
    ? currentApps[0]
    : admin.initializeApp({ credential: admin.credential.cert(serviceAccount as ServiceAccount) });

  return getFirestore(app);
}

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    video: true,
    experimentalModifyObstructiveThirdPartyCode: true,
    setupNodeEvents(on, config) {
      on('task', {
        async clearTestUserCards() {
          const uid = config.env.TEST_USER_UID;
          const firestore = getAdminFirestore();
          const collection = firestore.collection(`users/${uid}/indexCards`);
          const docs = await collection.listDocuments();

          if (docs.length > 0) {
            const batch = firestore.batch();
            docs.forEach((doc) => batch.delete(doc));
            await batch.commit();
          }

          return null;
        },

        async seedTestCard({ term, definition }: { term: string; definition: string }) {
          const uid = config.env.TEST_USER_UID;
          const firestore = getAdminFirestore();
          await firestore.collection(`users/${uid}/indexCards`).add({ term, definition });
          return null;
        },
      });
    },
  },
});
