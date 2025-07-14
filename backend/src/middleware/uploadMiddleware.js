import multer from "multer";
import path from "path";

// disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// Multer config
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Check which field is being uploaded
    if (file.fieldname === "images") {
      if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
        cb(null, true);
      } else {
        cb(new Error("Only JPG and PNG allowed in images field!"));
      }
    } else if (file.fieldname === "videos") {
      if (file.mimetype === "video/mp4") {
        cb(null, true);
      } else {
        cb(new Error("Only MP4 videos allowed in videos field!"));
      }
    } else {
      cb(new Error("Unexpected field: " + file.fieldname));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB max file size
  }
});

export default upload;
