import admin from "../admin-firebaseConfig.js";
import {
  getDocs,
  addDoc,
  collection,
  query,
  where,
  updateDoc,
  doc,
  getDoc,
  deleteDoc,
  getFirestore,
} from "firebase/firestore";
import nodemailer from "nodemailer";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

// const storageBucket = admin.storage().bucket();

import { db } from "../config.js";

//CREATE MEDICAL RECORDS WITHOUT PRESCRIPTIONS
const addRecordWithoutPrescription = async (req, res) => {
  try {
    console.log(req.file);
    console.log(req.body);
    const { comments, date, patientId, recordType, recordTitle } = req.body;
    const email = req.params.email;
    const isVisibleToDoctor = true;

    if (!req.file) {
      return res.status(400).json({ error: "File not provided" });
    }

    const file = req.file;
    const fileName = `${Date.now()}_${file.originalname}`;
    const fileRef = ref(getStorage(), `MedicalRecord/${fileName}`);

    await uploadBytes(fileRef, file.buffer);

    // Get the download URL of the uploaded file
    const fileUrl = await getDownloadURL(fileRef); // Use getDownloadURL method

    const id = uuidv4();
    const medicalRecord = {
      id,
      comments,
      date,
      fileUrl,
      isVisibleToDoctor,
      recordType,
      recordTitle,
    };

    const result = await addDoc(
      collection(db, "PatientRecords", patientId, "medical_records"),
      medicalRecord
    );

    res.status(200).json({
      message: "Medical record without prescription added successfully",
      fileUrl,
    });

    const patientEmail = email;
    const subject = "Medical Record";
    const message = `A new medical record has been added for you. Please check your medical records for details.`;
    await sendEmail(patientEmail, subject, message);
  } catch (error) {
    console.error("Error adding medical record without prescription:", error);
    res
      .status(500)
      .json({ error: "Failed to add medical record without prescription" });
  }
};

// Function to send email
const sendEmail = async (to, subject, message) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "wecareemrsystem345@gmail.com",
        pass: "vuxi enzs yzvv johu",
      },
    });

    // Email options
    const mailOptions = {
      from: "wecareemrsystem345@gmail.com", // Sender email
      to: to, // Recipient email
      subject: subject,
      text: message,
    };

    // Send email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

//CREATE MEDICAL RECORDS WITH PRESCRIPTIONS

const addRecordWithPrescription = async (req, res) => {
  try {
    const {
      comments,
      recordTitle,
      patientId,
      medications,
      isVisibleToDoctor,
      doctorUuid,
      date,
      templateId,
    } = req.body;

    const email = req.params.email; // Extract email from request parameters

    // Validate if medications array is provided
    if (
      !medications ||
      !Array.isArray(medications) ||
      medications.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "Medications not provided or invalid" });
    }

    // Validate if email is provided
    if (!email) {
      return res.status(400).json({ error: "Email not provided" });
    }

    let medicalRecordData = {
      id: uuidv4(),
      comments,
      date: date ? date : new Date(),
      isVisibleToDoctor,
      medications: medications.map((item) => ({
        medicineName: item.medicineName, // Adjust field name
        medicationType: item.medicationType,
        dosage: item.dosage,
        duration: item.duration,
      })),
      recordType: "Prescriptions",
      recordTitle,
    };

    // Fetch template data if templateId is provided
    if (templateId) {
      const templateDoc = await getDoc(doc(db, "Template", templateId));
      if (templateDoc.exists()) {
        const templateData = templateDoc.data();
        // Merge template data with medical record data, allowing user to override template data
        medicalRecordData = {
          ...medicalRecordData,
          ...templateData,
        };
      }
    }

    if (doctorUuid) {
      medicalRecordData.doctorUuid = doctorUuid;
    }

    // Check if file is provided
    if (req.file) {
      console.log("file included");
      const file = req.file;
      const fileName = `${Date.now()}_${file.originalname}`;
      const fileRef = ref(getStorage(), `MedicalRecord/${fileName}`);
      await uploadBytes(fileRef, file.buffer);
      const fileUrl = await getDownloadURL(fileRef);
      medicalRecordData.fileUrl = fileUrl;
    }

    // Add the medical record data to Firestore
    const result = await addDoc(
      collection(db, "PatientRecords", patientId, "medical_records"),
      medicalRecordData
    );

    res.status(200).json({
      message: "Medical Record added successfully",
      id: result.id,
    });

    // Send email notification
    const subject = "Prescription";
    const message = `Here is a copy of your generated prescription:
    Diagnosis: ${recordTitle} 
    Comments: ${comments}  
    Medications: ${JSON.stringify(medications)}`;
    await sendEmail(email, subject, message);
  } catch (err) {
    console.error(err.message);
    res
      .status(500)
      .json({ error: "Failed to add medical record with prescription" });
  }
};

//GET MEDICAL RECORDS FOR A SPECIFIC PATIENT
const getMedicalRecordsByPatientId = async (req, res) => {
  try {
    const { patientId } = req.body;

    if (!patientId) {
      return res.status(400).json({ error: "PatientId not provided" });
    }

    const medicalRecordsRef = collection(
      db,
      "PatientRecords",
      patientId,
      "medical_records"
    );

    const q = query(medicalRecordsRef);
    const querySnapshot = await getDocs(q);

    const medicalRecords = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const record = {
        id: doc.id,
        comments: data.comments,
        date: data.date,
        isVisibleToDoctor: data.isVisibleToDoctor,
        recordType: data.recordType,
        recordTitle: data.recordTitle,
        medications: data.medications.map((item) => ({
          // Update to handle medications
          name: item.medicineName,
          medicationType: item.medicationType,
          dosage: item.dosage,
          duration: item.duration,
        })),
        fileUrl: data.fileUrl || "", // Add fileUrl if available
      };
      medicalRecords.push(record);
    });

    res.status(200).json({ medicalRecords });
  } catch (error) {
    console.error("Error retrieving medical records:", error);
    res.status(500).json({ error: "Failed to retrieve medical records" });
  }
};

const updatedVisibility = async (req, res) => {
  try {
    const { patientId, recordId } = req.body;

    // Validate if patientId and recordId are provided
    if (!patientId || !recordId) {
      return res
        .status(400)
        .json({ error: "PatientId or recordId not provided" });
    }

    // Query Firestore to find the document with recordId field equal to the specified recordId value

    const medicalRecordQuery = query(
      collection(db, "PatientRecords", patientId, "medical_records"),
      where("id", "==", recordId)
    );
    const medicalRecordSnapshot = await getDocs(medicalRecordQuery);

    // Check if any document matches the query
    if (medicalRecordSnapshot.empty) {
      return res.status(404).json({ error: "Medical record not found" });
    }

    // Since recordId should be unique, there should be only one document in the snapshot
    const medicalRecordDoc = medicalRecordSnapshot.docs[0];

    // Get the current value of isVisibleToDoctor
    const currentVisibility = medicalRecordDoc.data().isVisibleToDoctor;

    // Toggle the isVisibleToDoctor flag
    const updatedVisibility = !currentVisibility;

    // Update the medical record document in Firestore
    await updateDoc(medicalRecordDoc.ref, {
      isVisibleToDoctor: updatedVisibility,
    });

    // Return a success response
    res.status(200).json({
      message: "Visibility toggled successfully",
      isVisibleToDoctor: updatedVisibility,
    });
  } catch (error) {
    // Handle errors
    console.error("Error toggling visibility:", error);
    res.status(500).json({ error: "Failed to toggle visibility" });
  }
};

const deleteMedicalRecordById = async (req, res) => {
  try {
    const { patientId, recordId } = req.body;

    // Validate if patientId and recordId are provided
    if (!patientId || !recordId) {
      return res
        .status(400)
        .json({ error: "PatientId or recordId not provided" });
    }

    // Query Firestore to find the document with recordId field equal to the specified recordId value
    const medicalRecordQuery = query(
      collection(db, "PatientRecords", patientId, "medical_records"),
      where("id", "==", recordId)
    );
    const medicalRecordSnapshot = await getDocs(medicalRecordQuery);

    // Check if any document matches the query
    if (medicalRecordSnapshot.empty) {
      return res.status(404).json({ error: "Medical record not found" });
    }

    // Since recordId should be unique, there should be only one document in the snapshot
    const medicalRecordDoc = medicalRecordSnapshot.docs[0];

    // Delete the medical record document from Firestore
    await deleteDoc(medicalRecordDoc.ref);

    // Return a success response
    res.status(200).json({
      message: "Medical record deleted successfully",
    });
  } catch (error) {
    // Handle errors
    console.error("Error deleting medical record:", error);
    res.status(500).json({ error: "Failed to delete medical record" });
  }
};

export {
  addRecordWithoutPrescription,
  addRecordWithPrescription,
  getMedicalRecordsByPatientId,
  updatedVisibility,
  deleteMedicalRecordById,
};
