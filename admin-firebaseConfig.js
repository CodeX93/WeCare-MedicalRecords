import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const serviceAccount = JSON.parse(process.env.serviceAccountKey);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://wecare-medicalrecords.appspot.com",
});

export default admin;
