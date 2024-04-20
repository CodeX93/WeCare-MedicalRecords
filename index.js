import express from "express";
import cors from "cors";
import medicalrecordRoutes from "./Route/MedicalRecordRoute.js";
import multer from "multer";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

dotenv.config();

// Use fileURLToPath and dirname to get the directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import path module
import path from "path";

const port = process.env.PORT || 4001;
const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(cors({ origin: true, credentials: true }));
app.use(express.urlencoded({ extended: false }));

// Configure multer for file uploads
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB file size limit
  dest: path.join(__dirname, "RecordFiles"),
});

// Serve static files from the "RecordFiles" directory
app.use(express.static(path.join(__dirname, "RecordFiles")));

// Use the route for handling medical records
app.use("/medicalrecord", medicalrecordRoutes);

// Route for file uploads

// Start the server
app.listen(port, () => {
  console.log(`App is listening at PORT ${port}`);
});
