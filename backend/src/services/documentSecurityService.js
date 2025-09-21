const fs = require('fs');
const crypto = require('crypto');
const sharp = require('sharp');
const jsQR = require('jsqr');

class DocumentSecurityService {
    constructor() {
        this.securityPatterns = {
            qrCodeIndicators: [
                'government.in',
                'nic.in', 
                'gov.in',
                'uidai.gov.in',
                'registration',
                'certificate'
            ],
            suspiciousPatterns: [
                'fake',
                'duplicate', 
                'copy',
                'specimen',
                'draft',
                'template',
                'sample'
            ],
            officialSeals: [
                'government of india',
                'registrar',
                'sub-registrar',
                'collector',
                'tehsildar',
                'revenue',
                'court',
                'notary',
                'commissioner',
                'district magistrate'
            ]
        };
    }

    async analyzeDocumentSecurity(imagePath, extractedText) {
        try {
            const analysis = {
                documentHash: this.generateDocumentHash(imagePath),
                qrAnalysis: await this.analyzeQRCodes(imagePath, extractedText),
                securityFeatures: this.checkSecurityFeatures(extractedText),
                authenticityScore: 0,
                flags: [],
                recommendations: []
            };

            analysis.authenticityScore = this.calculateAuthenticityScore(analysis);
            analysis.flags = this.generateSecurityFlags(analysis);
            analysis.recommendations = this.generateRecommendations(analysis);

            return {
                success: true,
                security: analysis
            };

        } catch (error) {
            console.error('Document security analysis error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    generateDocumentHash(imagePath) {
        try {
            const imageBuffer = fs.readFileSync(imagePath);
            const hash = crypto.createHash('sha256').update(imageBuffer).digest('hex');
            
            return {
                algorithm: 'SHA-256',
                hash: hash,
                timestamp: new Date().toISOString(),
                fileSize: imageBuffer.length
            };
        } catch (error) {
            throw new Error('Failed to generate document hash: ' + error.message);
        }
    }

    async analyzeQRCodes(imagePath, extractedText) {
        try {
            // Convert image to grayscale for QR detection
            const { data, info } = await sharp(imagePath)
                .greyscale()
                .raw()
                .toBuffer({ resolveWithObject: true });

            // Create RGBA array for jsQR
            const imageData = new Uint8ClampedArray(info.width * info.height * 4);
            for (let i = 0; i < data.length; i++) {
                const pixelIndex = i * 4;
                const grayValue = data[i];
                imageData[pixelIndex] = grayValue;     // R
                imageData[pixelIndex + 1] = grayValue; // G
                imageData[pixelIndex + 2] = grayValue; // B
                imageData[pixelIndex + 3] = 255;       // A
            }

            const qrCode = jsQR(imageData, info.width, info.height);

            if (qrCode) {
                return {
                    found: true,
                    data: qrCode.data,
                    isValid: this.validateQRCode(qrCode.data),
                    type: this.identifyQRType(qrCode.data),
                    textMatch: this.verifyQRWithText(qrCode.data, extractedText)
                };
            } else {
                return {
                    found: false,
                    data: null,
                    isValid: false,
                    type: 'none',
                    textMatch: { matched: false, score: 0 }
                };
            }

        } catch (error) {
            console.error('QR code analysis failed:', error);
            return {
                found: false,
                data: null,
                isValid: false,
                type: 'error',
                textMatch: { matched: false, score: 0 },
                error: error.message
            };
        }
    }

    validateQRCode(qrData) {
        if (!qrData) return false;
        
        const data = qrData.toLowerCase();
        return this.securityPatterns.qrCodeIndicators.some(pattern => 
            data.includes(pattern.toLowerCase())
        );
    }

    identifyQRType(qrData) {
        if (!qrData) return 'none';
        
        const data = qrData.toLowerCase();
        
        if (data.includes('uidai') || data.includes('aadhaar')) {
            return 'Aadhaar Verification';
        } else if (data.includes('registration')) {
            return 'Registration Document';
        } else if (data.includes('certificate')) {
            return 'Certificate Verification';
        } else if (data.startsWith('http')) {
            return 'URL Verification';
        } else {
            return 'General Data';
        }
    }

    verifyQRWithText(qrData, extractedText) {
        if (!qrData || !extractedText) {
            return { matched: false, score: 0 };
        }

        const qrWords = qrData.split(/\s+/).filter(word => word.length > 3);
        const textLower = extractedText.toLowerCase();
        
        let matchCount = 0;
        qrWords.forEach(word => {
            if (textLower.includes(word.toLowerCase())) {
                matchCount++;
            }
        });

        const score = qrWords.length > 0 ? (matchCount / qrWords.length) * 100 : 0;
        
        return {
            matched: score > 50,
            score: Math.round(score),
            matchedWords: matchCount,
            totalWords: qrWords.length
        };
    }

    checkSecurityFeatures(extractedText) {
        const features = {
            officialSeals: [],
            securityMarks: [],
            suspiciousContent: [],
            formatIndicators: []
        };

        const textLower = extractedText.toLowerCase();

        // Check for official seals/stamps
        this.securityPatterns.officialSeals.forEach(seal => {
            if (textLower.includes(seal)) {
                features.officialSeals.push(seal);
            }
        });

        // Check for suspicious content
        this.securityPatterns.suspiciousPatterns.forEach(pattern => {
            if (textLower.includes(pattern)) {
                features.suspiciousContent.push(pattern);
            }
        });

        // Check for security marks
        const securityKeywords = [
            'watermark', 'security', 'authenticated', 'verified', 
            'original', 'seal', 'stamp', 'embossed'
        ];
        securityKeywords.forEach(keyword => {
            if (textLower.includes(keyword)) {
                features.securityMarks.push(keyword);
            }
        });

        // Check format indicators
        const formatIndicators = [
            'doc no', 'document number', 'serial number', 
            'reference number', 'file number', 'registration number'
        ];
        formatIndicators.forEach(indicator => {
            if (textLower.includes(indicator)) {
                features.formatIndicators.push(indicator);
            }
        });

        return features;
    }

    calculateAuthenticityScore(analysis) {
        let score = 50; // Base score

        // QR Code factors
        if (analysis.qrAnalysis.found) {
            score += 15;
            if (analysis.qrAnalysis.isValid) {
                score += 15;
            }
            if (analysis.qrAnalysis.textMatch.matched) {
                score += analysis.qrAnalysis.textMatch.score * 0.2;
            }
        } else {
            score -= 10; // Penalty for no QR code
        }

        // Security features factors
        score += analysis.securityFeatures.officialSeals.length * 8;
        score += analysis.securityFeatures.securityMarks.length * 5;
        score += analysis.securityFeatures.formatIndicators.length * 3;
        
        // Suspicious content penalty
        score -= analysis.securityFeatures.suspiciousContent.length * 30;

        return Math.max(0, Math.min(100, Math.round(score)));
    }

    generateSecurityFlags(analysis) {
        const flags = [];

        if (!analysis.qrAnalysis.found) {
            flags.push({
                type: 'warning',
                message: 'No QR codes detected - verify document manually',
                severity: 'medium'
            });
        }

        if (analysis.qrAnalysis.found && !analysis.qrAnalysis.isValid) {
            flags.push({
                type: 'warning',
                message: 'QR code found but does not contain expected government patterns',
                severity: 'medium'
            });
        }

        if (analysis.qrAnalysis.textMatch && !analysis.qrAnalysis.textMatch.matched) {
            flags.push({
                type: 'error',
                message: 'QR code content does not match document text',
                severity: 'high'
            });
        }

        if (analysis.securityFeatures.suspiciousContent.length > 0) {
            flags.push({
                type: 'error',
                message: `Suspicious content detected: ${analysis.securityFeatures.suspiciousContent.join(', ')}`,
                severity: 'high'
            });
        }

        if (analysis.authenticityScore < 30) {
            flags.push({
                type: 'error',
                message: 'Very low authenticity score - document may be fraudulent',
                severity: 'high'
            });
        } else if (analysis.authenticityScore < 60) {
            flags.push({
                type: 'warning',
                message: 'Low authenticity score - verify document carefully',
                severity: 'medium'
            });
        }

        if (analysis.securityFeatures.officialSeals.length === 0) {
            flags.push({
                type: 'info',
                message: 'No official seals detected in document text',
                severity: 'low'
            });
        }

        return flags;
    }

    generateRecommendations(analysis) {
        const recommendations = [];

        if (analysis.authenticityScore < 70) {
            recommendations.push('Verify document with issuing authority');
            recommendations.push('Cross-check document details manually');
        }

        if (!analysis.qrAnalysis.found) {
            recommendations.push('Look for physical security features like watermarks');
            recommendations.push('Check for embossed seals or stamps');
        }

        if (analysis.securityFeatures.officialSeals.length === 0) {
            recommendations.push('Verify presence of official stamps or seals');
        }

        if (analysis.securityFeatures.suspiciousContent.length > 0) {
            recommendations.push('Document contains suspicious markers - seek legal verification');
        }

        recommendations.push('Keep document hash for future verification');
        recommendations.push('Store original document securely');

        return recommendations;
    }
}

module.exports = new DocumentSecurityService();