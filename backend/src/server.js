const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const documentsRouter = require('./routes/documents');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB connection with better error handling
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('📊 Connected to MongoDB successfully');
    } catch (err) {
        console.error('❌ MongoDB connection failed:', err.message);
        console.log('🔧 Please check your MONGODB_URI in .env file');
        console.log('💡 For testing without DB, you can temporarily comment out this connection');
        // Don't exit, let the app run without DB for testing
    }
};

connectDB();

// Rest of your server setup
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

app.get('/', (req, res) => {
    res.json({ 
        message: 'Legal Document Verification API is running!',
        version: '2.0.0',
        status: 'active',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

app.use('/api/auth', authRouter);
app.use('/api/documents', documentsRouter);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Uploads directory: ${uploadsDir}`);
    console.log(`🔑 Google Cloud API Key: ${process.env.GOOGLE_CLOUD_API_KEY ? 'Configured' : 'Missing'}`);
});