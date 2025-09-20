const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ocrService = require('../services/ocrService');

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
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
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

// Upload and OCR endpoint
router.post('/upload', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log('File uploaded:', req.file.filename);

        // Perform OCR
        const ocrResult = await ocrService.extractText(req.file.path);

        if (ocrResult.success) {
            res.json({
                success: true,
                filename: req.file.filename,
                originalName: req.file.originalname,
                extractedText: ocrResult.text,
                confidence: ocrResult.confidence
            });
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

module.exports = router;

// Add this route to your existing documents.js file

const translationService = require('../services/translationService');

// Translation endpoint
router.post('/translate', async (req, res) => {
    try {
        const { text, targetLanguage = 'hi' } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        console.log(`Translating to ${targetLanguage}:`, text.substring(0, 50) + '...');

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

// Get supported languages
router.get('/languages', (req, res) => {
    const languages = translationService.getSupportedLanguages();
    res.json({ languages });
});

const legalAnalysisService = require('../services/legalAnalysisService');

// Legal analysis endpoint
router.post('/analyze', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        console.log('Analyzing document:', text.substring(0, 100) + '...');

        const analysis = legalAnalysisService.analyzeDocument(text);

        res.json({
            success: true,
            analysis: analysis
        });

    } catch (error) {
        console.error('Legal analysis error:', error);
        res.status(500).json({ error: error.message });
    }
});