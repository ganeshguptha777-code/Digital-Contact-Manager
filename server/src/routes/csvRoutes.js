const express = require('express');
const multer = require('multer');
const {
  getTemplate,
  exportContacts,
  importContacts
} = require('../controllers/csvController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Configure multer memory storage with 5MB limit and CSV filter
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'text/csv' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.originalname.toLowerCase().endsWith('.csv')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only .csv files are supported'), false);
    }
  }
});

// Template can be downloaded publicly or authenticated
router.get('/template', getTemplate);

// Export and Import require authentication
router.get('/export', protect, exportContacts);
router.post('/import', protect, upload.single('file'), importContacts);

module.exports = router;
