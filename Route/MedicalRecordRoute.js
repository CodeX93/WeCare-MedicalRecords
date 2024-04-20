import express from "express";
import upload from "../multer.js";
import {
  addRecordWithoutPrescription,
  addRecordWithPrescription,
  getMedicalRecordsByPatientId,
  updatedVisibility,
  deleteMedicalRecordById,
} from "../Controller/MedicalRecordController.js";

const router = express.Router();

// Configure multer for file uploads
// const upload = multer({
//   limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB file size limit
//   dest: "RecordFiles", // Destination folder for uploaded files
// });

router.post(
  "/medical-record/without-prescription",
  upload.single("RecordFile"),
  addRecordWithoutPrescription
);

router.post("/medical-record/with-prescription", addRecordWithPrescription);
router.post("/medical-record/", getMedicalRecordsByPatientId);
router.post("/updateVisiblity/", updatedVisibility);
router.post("/delete/", deleteMedicalRecordById);

export default router;
