import admin from "firebase-admin";
import serviceAccount from "./serviceAccount.json" with { type: "json" };

if (!admin.apps.length) {
  const config: admin.AppOptions = {
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  };
  
  // Only add databaseURL if it's provided
  if (process.env.FIREBASE_DB_URL) {
    config.databaseURL = process.env.FIREBASE_DB_URL;
  }
  
  admin.initializeApp(config);
}

// Only export db if database URL is configured
export const db = process.env.FIREBASE_DB_URL ? admin.database() : null;
export default admin;
