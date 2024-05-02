// import express from "express";
// import multer from "multer";
// import path from "path";
// import { Router } from "express";
// import { fileURLToPath } from "url";
// import { checkToken } from "../middlewares/checkToken.js";

// const router = Router();

// // Set up multer for file uploads
// const storage = multer.diskStorage({
//   destination: "./uploads",
//   filename: function (req, file, cb) {
//     cb(
//       null,
//       file.fieldname + "-" + Date.now() + path.extname(file.originalname)
//     );
//   },
// });

// const upload = multer({
//   storage: storage,
// }).any();

// // Define a route for handling image uploads
// router.post("/upload", checkToken, (req, res) => {
//   upload(req, res, (err) => {
//     if (err) {
//       return res.status(500).json({
//         success: false,
//         error: err.message,
//       });
//     }

//     const imageUrls = req.files.map((file) => `/uploads/${file.filename}`);

//     res.status(200).json({
//       success: true,
//       imageUrls: imageUrls,
//     });
//   });
// });

// // single image upload
// router.post("/single-upload", checkToken, (req, res) => {
//   upload(req, res, (err) => {
//     if (err) {
//       return res.status(500).json({
//         success: false,
//         error: err.message,
//       });
//     }
//     const imageUrl = `/uploads/${req.files[0].filename}`;

//     res.status(200).json({
//       success: true,
//       imageUrl: imageUrl,
//     });
//   });
// });

// // get image
// router.get("/uploads/:filename", (req, res) => {
//   const filename = req.params.filename;
//   const filePath = path.join(
//     path.join(
//       path.dirname(fileURLToPath(import.meta.url)),
//       "../uploads",
//       filename
//     )
//   );
//   res.sendFile(filePath, (err) => {
//     if (err) {
//       res.status(500).json({
//         success: false,
//         error: "Internal Server Error",
//       });
//     }
//   });
// });

// export default router;


import express, { Router } from "express";
import multer from "multer";
import AWS from "aws-sdk";
import { checkToken } from "../middlewares/checkToken.js";

const router = Router();

// AWS S3 configuration
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

// Set up multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
});

// Helper function to upload file to S3
const uploadFileToS3 = (file) => {
  return new Promise((resolve, reject) => {
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `${file.originalname}-${Date.now()}`, // Ensure the file name is unique
      Body: file.buffer,
      // ACL: 'public-read', // Optionally make file public
    };

    s3.upload(uploadParams, function(err, data) {
      if (err) {
        return reject(err);
      }
      return resolve(data.Location); // Returns the URL of the uploaded file
    });
  });
};

// Define a route for handling image uploads
router.post("/upload", checkToken, upload.any(), async (req, res) => {
  try {
    const uploadPromises = req.files.map(file => uploadFileToS3(file));
    const imageUrls = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      imageUrls: imageUrls,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});


router.post("/single-upload", checkToken, (req, res) => {
  upload.any()(req, res, async (err) => {
    try {
      if (err) {
        throw new Error(err.message);
      }

      const file = req.files[0]; 
     
      const imageUrl = await uploadFileToS3(file);

      res.status(200).json({
        success: true,
        imageUrl: imageUrl,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });
});


export default router;

// accessKeyId =AKIA4S2FEUAUHZFTM4WX
// secretAccessKey= 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