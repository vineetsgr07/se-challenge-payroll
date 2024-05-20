const express = require('express');
const router = express.Router();
const { uploadFile, getPayrollReport } = require('../controllers/payrollController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), uploadFile);
router.get('/report', getPayrollReport);

module.exports = router;
