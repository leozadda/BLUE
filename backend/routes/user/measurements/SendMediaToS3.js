const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');

// Set up how we want to handle file uploads
const upload = multer({
    dest: '/tmp/uploads/',
    limits: {
        fileSize: 5 * 1024 * 1024,  // 5MB limit
        files: 1
    },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/^(image|video)/)) {
            cb(new Error('Only image and video files are allowed!'), false);
        }
        cb(null, true);
    }
});

// Set up S3 client
const s3Client = new S3Client({ 
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// Function to upload file to S3
const uploadToS3 = async (file, userId) => {
    const filename = `user_${userId}/progress/${Date.now()}_${file.originalname}`;
    
    await s3Client.send(new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: filename,
        Body: fs.createReadStream(file.path),
        ContentType: file.mimetype,
    }));

    return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;
};

module.exports = { upload, uploadToS3 };