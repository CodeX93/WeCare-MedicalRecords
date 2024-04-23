import { db } from "../config.js";
import { addDoc, collection, getDocs, getDoc, doc } from "firebase/firestore";

// Create a new prescription template
const createTemplate = async (req, res) => {
  try {
    const { comments, recordTitle, medications, isVisibleToDoctor } = req.body;

    if (!comments || !recordTitle || !medications) {
      return res.status(400).send("Incomplete data provided.");
    }

    if (!Array.isArray(medications)) {
      return res
        .status(400)
        .send(
          "Structure of data is incorrect. 'medications' must be an array."
        );
    }

    const result = await addDoc(collection(db, "Template"), {
      comments,
      recordTitle,
      medications,
      isVisibleToDoctor,
    });
    res.status(201).send(`Created a new template with ID: ${result.id}`);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

// Retrieve all prescription templates
const getTemplate = async (req, res) => {
  try {
    const templatesQuerySnapshot = await getDocs(collection(db, "Template"));
    const templates = templatesQuerySnapshot.docs.map((doc) => ({
      id: doc.id,
      data: doc.data(),
    }));
    res.status(200).json(templates);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Fetch a specific prescription template by ID
const getSpecificTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    if (!templateId) {
      return res.status(400).send("Template ID is required.");
    }

    const templateDoc = await getDoc(doc(db, "Template", templateId));
    if (!templateDoc.exists()) {
      return res.status(404).send("Template not found.");
    }

    const templateData = templateDoc.data();
    res.status(200).json({ id: templateDoc.id, data: templateData });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export { createTemplate, getTemplate, getSpecificTemplate };
