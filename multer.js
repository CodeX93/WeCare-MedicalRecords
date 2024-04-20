import multer from "multer";

// Define storage for uploaded files
const storage = multer.diskStorage({
  // Set destination for uploaded files
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  // Set filename for uploaded files
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

// Set options for multer
const upload = multer({
  storage: storage,
  // Increase the field size limit (adjust as needed)
  limits: {
    fieldSize: 1024 * 1024 * 10, // 10 MB
  },
});

// Now you can use the 'upload' middleware in your route handler
export default upload;
