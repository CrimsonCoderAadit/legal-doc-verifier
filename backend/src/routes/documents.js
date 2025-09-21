const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const ocrService = require('../services/ocrService');
const translationService = require('../services/translationService');
const legalAnalysisService = require('../services/legalAnalysisService');
const documentSecurityService = require('../services/documentSecurityService');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only JPEG, JPG, PNG, and PDF files are allowed'));
        }
    }
});

// Upload and process document with user authentication
router.post('/upload', auth, upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log('Processing document for user:', req.user.username);

        // Generate file hash
        const fileBuffer = fs.readFileSync(req.file.path);
        const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

        // Perform OCR
        const ocrResult = await ocrService.extractText(req.file.path);

        if (ocrResult.success) {
            // Save document to user's record
            const documentRecord = {
                filename: req.file.filename,
                originalName: req.file.originalname,
                uploadDate: new Date(),
                extractedText: ocrResult.text,
                fileHash: fileHash,
                analysisResults: {
                    legal: null,
                    security: null,
                    translation: null
                }
            };

            // Add to user's documents
            req.user.documents.push(documentRecord);
            await req.user.save();

            const response = {
                success: true,
                documentId: documentRecord._id,
                filename: req.file.filename,
                originalName: req.file.originalname,
                extractedText: ocrResult.text,
                confidence: ocrResult.confidence,
                uploadedFile: req.file
            };

            res.json(response);
        } else {
            res.status(500).json({
                success: false,
                error: ocrResult.error
            });
        }

        // Clean up uploaded file after processing
        setTimeout(() => {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }, 5000);

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Save analysis results
router.post('/save-analysis', auth, async (req, res) => {
    try {
        const { documentId, analysisType, analysisData } = req.body;

        const user = await User.findById(req.user._id);
        const document = user.documents.id(documentId);

        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        document.analysisResults[analysisType] = analysisData;
        await user.save();

        res.json({ success: true, message: 'Analysis saved' });

    } catch (error) {
        console.error('Save analysis error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get user's documents
router.get('/my-documents', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({
            success: true,
            documents: user.documents.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
        });
    } catch (error) {
        console.error('Get documents error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Existing routes (analyze, translate, security-check) remain the same...
// Legal analysis endpoint
router.post('/analyze', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        const analysis = legalAnalysisService.analyzeDocument(text);
        res.json({ success: true, analysis: analysis });

    } catch (error) {
        console.error('Legal analysis error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Translation endpoint
router.post('/translate', async (req, res) => {
    try {
        const { text, targetLanguage = 'hi' } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        const result = await translationService.translateText(text, targetLanguage);

        if (result.success) {
            res.json({
                success: true,
                originalText: result.originalText,
                translatedText: result.translatedText,
                targetLanguage: targetLanguage,
                service: result.service
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }

    } catch (error) {
        console.error('Translation route error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Security check endpoint
router.post('/security-check', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { extractedText } = req.body;
        if (!extractedText) {
            return res.status(400).json({ error: 'Extracted text is required' });
        }

        const securityResult = await documentSecurityService.analyzeDocumentSecurity(
            req.file.path, 
            extractedText
        );

        if (securityResult.success) {
            res.json({
                success: true,
                security: securityResult.security
            });
        } else {
            res.status(500).json({
                success: false,
                error: securityResult.error
            });
        }

        setTimeout(() => {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }, 5000);

    } catch (error) {
        console.error('Security analysis error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;