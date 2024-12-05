const express = require('express');
const connection = require('../connection'); // Ensure your DB connection is correct

const multer = require('multer');
const path = require('path');
const fs = require('fs'); 
const router = express.Router();


const uploadFolder = path.resolve(__dirname, 'E:/Admin Panel/Angular Second/ng-admin-panel/src/app/media');

if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
  }
  
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder); // Save files to the 'media' folder
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName); // Use a unique name to avoid overwrites
  },
});
console.log('Upload folder:', uploadFolder);
const upload = multer({ storage });



router.post('/add-media', upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }
  
    const filePath = `/${req.file.filename}`;
    const fileName = req.file.filename;
  
    // Save file info to the database
    const sql = 'INSERT INTO media (file_name, file_path) VALUES (?, ?)';
    connection.query(sql, [fileName, filePath], (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Database error' .err,
          error: err,
        });
      }
  
      res.status(200).json({
        success: true,
        message: 'File uploaded successfully',
        filePath,
      });
    });
  });


module.exports = router;