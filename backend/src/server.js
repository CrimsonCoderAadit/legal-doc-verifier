// Load environment variables FIRST
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Import routes AFTER dotenv is loaded
const documentsRouter = require('./routes/documents');

const app = express();
const PORT = process.env.PORT || 3001;

// Enhanced CORS and middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add headers middleware
app.use((req, res, next) => {
    res.header('Content-Type', 'application/json');
    next();
});

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Routes
app.get('/', (req, res) => {
    console.log('Root route accessed');
    res.json({ 
        message: 'Legal Document Verification API is running!',
        version: '1.0.0',
        status: 'active',
        endpoints: [
            'GET /',
            'GET /health',
            'GET /api/test',
            'POST /api/documents/upload'
        ]
    });
});

app.get('/health', (req, res) => {
    console.log('Health route accessed');
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/api/test', (req, res) => {
    console.log('Test route accessed');
    res.json({ message: 'API is working!' });
});

// API routes
app.use('/api/documents', documentsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    console.log('404 route accessed:', req.path);
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Uploads directory: ${uploadsDir}`);
    console.log(`Google Cloud API Key: ${process.env.GOOGLE_CLOUD_API_KEY ? 'Configured' : 'Missing'}`);
});