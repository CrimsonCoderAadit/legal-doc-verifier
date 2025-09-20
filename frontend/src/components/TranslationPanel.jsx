import React, { useState } from 'react';
import axios from 'axios';

const TranslationPanel = ({ extractedText }) => {
    const [selectedLanguage, setSelectedLanguage] = useState('hi');
    const [translatedText, setTranslatedText] = useState('');
    const [translating, setTranslating] = useState(false);
    const [languages] = useState({
        'hi': 'Hindi (हिंदी)',
        'ta': 'Tamil (தமிழ்)',
        'te': 'Telugu (తెలుగు)',
        'bn': 'Bengali (বাংলা)',
        'mr': 'Marathi (मराठी)',
        'gu': 'Gujarati (ગુજરાતી)',
        'kn': 'Kannada (ಕನ್ನಡ)',
        'ml': 'Malayalam (മലയാളം)',
        'pa': 'Punjabi (ਪੰਜਾਬੀ)',
        'or': 'Odia (ଓଡ଼ିଆ)'
    });

    const translateText = async () => {
        if (!extractedText) return;

        setTranslating(true);
        try {
            const response = await axios.post(
                'http://localhost:3001/api/documents/translate',
                {
                    text: extractedText,
                    targetLanguage: selectedLanguage
                }
            );

            if (response.data.success) {
                setTranslatedText(response.data.translatedText);
            }
        } catch (error) {
            console.error('Translation error:', error);
            alert('Translation failed: ' + (error.response?.data?.error || error.message));
        } finally {
            setTranslating(false);
        }
    };

    const speakText = (text, language = 'en') => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
            utterance.rate = 0.8;
            speechSynthesis.speak(utterance);
        }
    };

    return (
        <div style={{
            background: 'rgba(17, 24, 39, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(75, 85, 99, 0.3)',
            borderRadius: '16px',
            padding: '2rem',
            marginTop: '2rem'
        }}>
            <h3 style={{ color: '#60a5fa', marginBottom: '1rem' }}>Translation</h3>
            
            <div style={{ marginBottom: '1rem' }}>
                <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    style={{
                        padding: '0.5rem',
                        borderRadius: '8px',
                        border: '1px solid #374151',
                        background: '#1f2937',
                        color: '#fff',
                        marginRight: '1rem'
                    }}
                >
                    {Object.entries(languages).map(([code, name]) => (
                        <option key={code} value={code}>{name}</option>
                    ))}
                </select>

                <button
                    onClick={translateText}
                    disabled={!extractedText || translating}
                    style={{
                        padding: '0.5rem 1rem',
                        background: translating ? '#374151' : 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: translating ? 'not-allowed' : 'pointer'
                    }}
                >
                    {translating ? 'Translating...' : 'Translate'}
                </button>
            </div>

            {translatedText && (
                <div>
                    <div style={{
                        background: 'rgba(17, 24, 39, 0.9)',
                        border: '1px solid rgba(75, 85, 99, 0.3)',
                        borderRadius: '8px',
                        padding: '1.5rem',
                        marginBottom: '1rem',
                        color: '#f1f5f9',
                        fontFamily: 'Arial, sans-serif',
                        fontSize: '1.1rem',
                        lineHeight: '1.8',
                        whiteSpace: 'pre-wrap'
                    }}>
                        {translatedText}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={() => speakText(translatedText, selectedLanguage)}
                            style={{
                                padding: '0.5rem 1rem',
                                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            🔊 Listen
                        </button>

                        <button
                            onClick={() => navigator.clipboard.writeText(translatedText)}
                            style={{
                                padding: '0.5rem 1rem',
                                background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            📋 Copy
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TranslationPanel;