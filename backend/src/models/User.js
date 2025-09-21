const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const documentSchema = new mongoose.Schema({
    filename: String,
    originalName: String,
    uploadDate: { type: Date, default: Date.now },
    extractedText: String,
    fileHash: String,
    analysisResults: {
        legal: {
            documentType: Object,
            clauses: Array,
            riskAssessment: Object,
            summary: String,
            warnings: Array
        },
        security: {
            authenticityScore: Number,
            qrAnalysis: Object,
            securityFeatures: Object,
            flags: Array,
            documentHash: Object
        },
        translation: {
            translations: Array,
            supportedLanguages: Array
        }
    },
    tags: [String],
    isBookmarked: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    documents: [documentSchema],
    preferences: {
        defaultLanguage: { type: String, default: 'hi' },
        theme: { type: String, default: 'dark' },
        autoSave: { type: Boolean, default: true }
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);