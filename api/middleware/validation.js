import Joi from 'joi';

// User validation schemas
export const validateUserRegistration = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

export const validateUserLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

// Bible verse validation schemas
export const validateBibleVerse = (req, res, next) => {
  const schema = Joi.object({
    text: Joi.string().min(10).max(1000).required(),
    book: Joi.string().min(2).max(50).required(),
    chapter: Joi.number().integer().min(1).max(150).required(),
    verse: Joi.number().integer().min(1).max(200).required(),
    translation: Joi.string().max(10).default('NIV'),
    image: Joi.string().uri().optional(),
    isActive: Joi.boolean().default(true),
    isFeatured: Joi.boolean().default(false),
    displayDate: Joi.date().iso().optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

export const validateBibleVerseUpdate = (req, res, next) => {
  const schema = Joi.object({
    text: Joi.string().min(10).max(1000).optional(),
    book: Joi.string().min(2).max(50).optional(),
    chapter: Joi.number().integer().min(1).max(150).optional(),
    verse: Joi.number().integer().min(1).max(200).optional(),
    translation: Joi.string().max(10).optional(),
    image: Joi.string().uri().optional(),
    isActive: Joi.boolean().optional(),
    isFeatured: Joi.boolean().optional(),
    displayDate: Joi.date().iso().optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

// Audio episode validation schemas
export const validateAudioEpisode = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(200).required(),
    description: Joi.string().min(10).max(2000).required(),
    audioUrl: Joi.string().uri().required(),
    coverImage: Joi.string().uri().required(),
    slot: Joi.string().valid('MORNING', 'EVENING').required(),
    episodeDate: Joi.date().iso().optional(),
    isPublished: Joi.boolean().default(true)
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

export const validateAudioEpisodeUpdate = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(200).optional(),
    description: Joi.string().min(10).max(2000).optional(),
    audioUrl: Joi.string().uri().optional(),
    coverImage: Joi.string().uri().optional(),
    slot: Joi.string().valid('MORNING', 'EVENING').optional(),
    episodeDate: Joi.date().iso().optional(),
    isPublished: Joi.boolean().optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

export const validateAudioComment = (req, res, next) => {
  const schema = Joi.object({
    authorName: Joi.string().min(2).max(100).required(),
    authorEmail: Joi.string().email().required(),
    content: Joi.string().min(2).max(1000).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

// Blog post validation schemas
export const validateBlogPost = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().min(5).max(200).required(),
    slug: Joi.string().min(3).max(100).optional(),
    excerpt: Joi.string().min(10).max(500).required(),
    content: Joi.string().min(50).required(),
    featuredImage: Joi.string().uri().required(),
    category: Joi.string().valid('FAITH', 'BIBLE_STUDY', 'PRAYER', 'TESTIMONY', 'REFLECTION', 'OTHER').default('OTHER'),
    tags: Joi.array().items(Joi.string().min(2).max(20)).max(10).default([]),
    status: Joi.string().valid('DRAFT', 'PUBLISHED', 'ARCHIVED').default('DRAFT'),
    readTime: Joi.number().integer().min(1).max(60).default(5),
    isFeatured: Joi.boolean().default(false),
    seoTitle: Joi.string().max(60).optional(),
    seoDescription: Joi.string().max(160).optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

export const validateBlogPostUpdate = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().min(5).max(200).optional(),
    slug: Joi.string().min(3).max(100).optional(),
    excerpt: Joi.string().min(10).max(500).optional(),
    content: Joi.string().min(50).optional(),
    featuredImage: Joi.string().uri().optional(),
    category: Joi.string().valid('FAITH', 'BIBLE_STUDY', 'PRAYER', 'TESTIMONY', 'REFLECTION', 'OTHER').optional(),
    tags: Joi.array().items(Joi.string().min(2).max(20)).max(10).optional(),
    status: Joi.string().valid('DRAFT', 'PUBLISHED', 'ARCHIVED').optional(),
    readTime: Joi.number().integer().min(1).max(60).optional(),
    isFeatured: Joi.boolean().optional(),
    seoTitle: Joi.string().max(60).optional(),
    seoDescription: Joi.string().max(160).optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

// Contact validation schemas
export const validateContact = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    subject: Joi.string().min(5).max(200).required(),
    message: Joi.string().min(10).max(2000).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

// Donation validation schemas
export const validateDonation = (req, res, next) => {
  const schema = Joi.object({
    donorName: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    amount: Joi.number().positive().max(10000).required(),
    currency: Joi.string().valid('USD', 'EUR', 'GBP', 'CAD', 'AUD').default('USD'),
    paymentMethod: Joi.string().valid('PAYPAL', 'BANK_TRANSFER', 'OTHER').default('OTHER'),
    message: Joi.string().max(500).optional(),
    isAnonymous: Joi.boolean().default(false)
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};