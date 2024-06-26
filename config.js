import { initializeApp } from "firebase/app";
import dotenv from "dotenv";
import { collection, getFirestore } from "firebase/firestore";
dotenv.config();

const firebaseConfig = JSON.parse(process.env.firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const PatientRecords = collection(db, "PatientRecords");
const Template = collection(db, "Templates");
// const analytics = getAnalytics(app);

export { app, db, PatientRecords, Template };
