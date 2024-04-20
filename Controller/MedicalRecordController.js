import admin from "../admin-firebaseConfig.js";
import { v4 as uuidv4 } from "uuid";

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

import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
// const storageBucket = admin.storage().bucket();

import { db } from "../config.js";

const addRecordWithoutPrescription = async (req, res) => {
  try {
    console.log(req.file);
    console.log(req.body);
    const { comments, date, patientId, recordType, recordTitle } = req.body;
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
      patientId,
      recordType,
      recordTitle,
    };

    const medicalRecordRef = collection(db, "medicalRecord");
    await addDoc(medicalRecordRef, medicalRecord);

    res.status(200).json({
      message: "Medical record without prescription added successfully",
      fileUrl,
    });
  } catch (error) {
    console.error("Error adding medical record without prescription:", error);
    res
      .status(500)
      .json({ error: "Failed to add medical record without prescription" });
  }
};

const addRecordWithPrescription = async (req, res) => {
  try {
    // Extract data from the request body
    console.log(req.body);
    const {
      comments,
      date,
      isVisibleToDoctor,
      patientId,
      recordType,
      recordTitle,
      prescription,
      file, // Make the "file" field optional
    } = req.body;

    const isVisible = isVisibleToDoctor === "true";
    req.body.isVisibleToDoctor = isVisible;

    // Create an array to store Medicine objects
    const medicines = prescription.map((item) => ({
      complaint: item.complaint,
      dosage: item.dosage,
      duration: item.duration,
      medicineName: item.medicineName,
    }));

    // Create a new instance of MedicalRecord
    const id = uuidv4();
    const medicalRecordData = {
      id,
      comments,
      date,
      isVisibleToDoctor,
      patientId: patientId,
      medicines,
      recordType,
      recordTitle,
    };

    // Check if the "file" field exists and handle file upload logic if needed
    if (file) {
      console.log("file included");
    }
    // console.log(medicalRecordData);
    // Post MedicalRecord data to Firestore
    const medicalRecordRef = await collection(db, "medicalRecord");
    const recordRef = await addDoc(medicalRecordRef, medicalRecordData);

    // Return a success response

    res.status(200).json({
      message: "Medical Record added successfully",
      id: recordRef.id,
    });
  } catch (err) {
    console.error(err.message);
    res
      .status(500)
      .json({ error: "Failed to add medical record with prescription" });
  }
};

const getMedicalRecordsByPatientId = async (req, res) => {
  try {
    // Extract patientId from request body
    const { patientId } = req.body;

    // Check if patientId is provided
    if (!patientId) {
      return res.status(400).json({ error: "PatientId not provided" });
    }

    // Query medical records collection for records with the given patientId
    const q = query(
      collection(db, "medicalRecord"),
      where("patientId", "==", patientId)
    );
    const querySnapshot = await getDocs(q);

    // Extract medical record data from query snapshot
    const medicalRecords = [];
    querySnapshot.forEach((doc) => {
      medicalRecords.push({ id: doc.id, ...doc.data() });
    });

    // Return medical record data as response
    res.status(200).json({ medicalRecords });
  } catch (error) {
    console.error("Error retrieving medical records:", error);
    res.status(500).json({ error: "Failed to retrieve medical records" });
  }
};

const updatedVisibility = async (req, res) => {
  try {
    // Extract the value of id field from request body
    const { id } = req.body;

    // Validate if id is provided
    if (!id) {
      return res
        .status(400)
        .json({ error: "ID not provided in the request body" });
    }

    // Query Firestore to find the document with id field equal to the specified id value
    const medicalRecordQuery = query(
      collection(db, "medicalRecord"),
      where("id", "==", id)
    );
    const medicalRecordSnapshot = await getDocs(medicalRecordQuery);

    // Check if any document matches the query
    if (medicalRecordSnapshot.empty) {
      return res.status(404).json({ error: "Medical record not found" });
    }

    // Since id should be unique, there should be only one document in the snapshot
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
    // Extract the value of id field from request body
    const { id } = req.body;

    // Validate if id is provided
    if (!id) {
      return res
        .status(400)
        .json({ error: "ID not provided in the request body" });
    }

    // Query Firestore to find the document with id field equal to the specified id value
    const medicalRecordQuery = query(
      collection(db, "medicalRecord"),
      where("id", "==", id)
    );
    const medicalRecordSnapshot = await getDocs(medicalRecordQuery);

    // Check if any document matches the query
    if (medicalRecordSnapshot.empty) {
      return res.status(404).json({ error: "Medical record not found" });
    }

    // Since id should be unique, there should be only one document in the snapshot
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
