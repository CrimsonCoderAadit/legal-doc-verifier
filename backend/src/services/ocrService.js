const axios = require('axios');
const fs = require('fs');

class OCRService {
    constructor() {
        this.apiKey = process.env.GOOGLE_CLOUD_API_KEY;
        this.apiUrl = 'https://vision.googleapis.com/v1/images:annotate';
        
        // Debug logging
        console.log('API Key loaded:', this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'NOT FOUND');
        console.log('API Key length:', this.apiKey ? this.apiKey.length : 0);
    }

    async extractText(imagePath) {
        try {
            console.log('Making request to:', `${this.apiUrl}?key=${this.apiKey.substring(0, 10)}...`);
            
            const imageBuffer = fs.readFileSync(imagePath);
            const base64Image = imageBuffer.toString('base64');

            const requestBody = {
                requests: [
                    {
                        image: {
                            content: base64Image
                        },
                        features: [
                            {
                                type: 'TEXT_DETECTION',
                                maxResults: 1
                            }
                        ]
                    }
                ]
            };

            const response = await axios.post(
                `${this.apiUrl}?key=${this.apiKey}`,
                requestBody,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.responses[0].textAnnotations) {
                return {
                    success: true,
                    text: response.data.responses[0].textAnnotations[0].description,
                    confidence: response.data.responses[0].textAnnotations[0].confidence || 0.95
                };
            } else {
                return {
                    success: false,
                    error: 'No text found in image'
                };
            }

        } catch (error) {
            console.error('OCR Error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || error.message
            };
        }
    }
}

module.exports = new OCRService();