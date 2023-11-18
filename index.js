import express from "express";
import cors from "cors";
import MedicalRecordRoute from "./Route/MedicalRecordRoute.js";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();
const port = process.env.PORT;

const app = express();

app.use(express.json({ extended: false }));
app.use(bodyParser.json());
app.use(cors({ origin: true, credentials: true }));
app.use(express.urlencoded({ extended: false }));

app.use("/medicalrecord", MedicalRecordRoute);
app.listen(port, () => {
  console.log(`App is listening at PORT 4001`);
});
