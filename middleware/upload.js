import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload folder exists
const uploadPath = './uploads';
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
}    

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function (req, file, cb) {       
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${Date.now()}${ext}`);
    },
});

// File filter for only image files
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|avif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
};

// Export multer config
const upload = multer({
    storage,
    fileFilter,
});

export default upload;
