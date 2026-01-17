import multer from 'multer';

// Use memory storage for files since we'll be saving to the database
const storage = multer.memoryStorage();

// Image upload filter
const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed!'), false);
  }
};

// Video upload filter
const videoFileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only MP4, WebM, OGG, and MOV videos are allowed!'), false);
  }
};

// Export middleware
export const uploadSingle = multer({
  storage: storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}).single('image');

export const uploadVideo = multer({
  storage: storage,
  fileFilter: videoFileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
}).single('video');

// Error handling middleware
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 50MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files.'
      });
    }
  }

  if (error.message === 'Only image and video files are allowed!') {
    return res.status(400).json({
      success: false,
      message: 'Only image and video files are allowed!'
    });
  }

  next(error);
};



