import express from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const router = express.Router();

// Configure cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const makePublicId = (file) => {
  const safeBaseName = path
    .parse(file.originalname || 'image')
    .name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'image';

  return `${file.fieldname}-${safeBaseName}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'cloth-couture/products',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    resource_type: 'image',
    overwrite: false,
    public_id: makePublicId(file),
  }),
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images only (jpg/jpeg/png)!'));
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

router.post('/', upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send({ message: 'No file uploaded' });
  }

  const fileUrls = req.files
    .map((file) => file.secure_url || file.path)
    .filter(Boolean);

  if (fileUrls.length !== req.files.length) {
    return res.status(500).send({ message: 'Failed to get stable image URLs from Cloudinary upload.' });
  }

  console.log(`Generated external file URLs: ${JSON.stringify(fileUrls)}`);
  res.send(fileUrls);
});

export default router;
