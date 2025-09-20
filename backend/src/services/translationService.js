const axios = require('axios');

class TranslationService {
    constructor() {
        this.ai4bharatUrl = 'https://dhruva-api.bhashini.gov.in/services/inference/pipeline';
        // Fallback to a simpler API
        this.backupUrl = 'https://translate.googleapis.com/translate_a/single';
    }

    async translateText(text, targetLanguage = 'hi') {
        try {
            // Try AI4Bharat first
            const result = await this.translateWithAI4Bharat(text, targetLanguage);
            if (result.success) {
                return result;
            }
            
            // Fallback to Google Translate unofficial API
            return await this.translateWithGoogleFree(text, targetLanguage);
            
        } catch (error) {
            console.error('Translation error:', error.message);
            return {
                success: false,
                error: error.message,
                originalText: text
            };
        }
    }

    async translateWithGoogleFree(text, targetLanguage) {
        try {
            const response = await axios.get(this.backupUrl, {
                params: {
                    client: 'gtx',
                    sl: 'en',
                    tl: targetLanguage,
                    dt: 't',
                    q: text
                }
            });

            const translatedText = response.data[0][0][0];
            
            return {
                success: true,
                originalText: text,
                translatedText: translatedText,
                targetLanguage: targetLanguage,
                service: 'google-free'
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                originalText: text
            };
        }
    }

    async translateWithAI4Bharat(text, targetLanguage) {
        // AI4Bharat requires authentication, so we'll use the free Google API for now
        // This is a placeholder for future implementation
        return { success: false, error: 'AI4Bharat requires setup' };
    }

    getSupportedLanguages() {
        return {
            'hi': 'Hindi',
            'ta': 'Tamil',
            'te': 'Telugu',
            'bn': 'Bengali',
            'mr': 'Marathi',
            'gu': 'Gujarati',
            'kn': 'Kannada',
            'ml': 'Malayalam',
            'pa': 'Punjabi',
            'or': 'Odia'
        };
    }
}

module.exports = new TranslationService();