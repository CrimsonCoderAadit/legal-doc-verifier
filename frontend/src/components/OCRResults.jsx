import React from 'react';
import TranslationPanel from './TranslationPanel';
import LegalAnalysis from './LegalAnalysis';
import SecurityAnalysis from './SecurityAnalysis';

const OCRResults = ({ result, onReset }) => {
    if (!result) {
        return null;
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(result.extractedText);
        alert('Text copied to clipboard!');
    };

    const speakText = () => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(result.extractedText);
            utterance.rate = 0.8;
            speechSynthesis.speak(utterance);
        }
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', marginTop: '20px' }}>
            <h3>Extracted Text</h3>
            
            <div style={{ marginBottom: '15px', fontSize: '14px', color: '#666' }}>
                <p><strong>File:</strong> {result.originalName}</p>
                <p><strong>Confidence:</strong> {Math.round(result.confidence * 100)}%</p>
            </div>

            <div
                style={{
                    backgroundColor: '#f8f9fa',
                    padding: '15px',
                    borderRadius: '4px',
                    border: '1px solid #e9ecef',
                    minHeight: '200px',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    maxHeight: '400px',
                    overflowY: 'auto'
                }}
            >
                {result.extractedText || 'No text extracted'}
            </div>

            <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                <button
                    onClick={copyToClipboard}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Copy Text
                </button>

                <button
                    onClick={speakText}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Listen
                </button>

                {onReset && (
                    <button
                        onClick={onReset}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Upload Another
                    </button>
                )}
            </div>

            <LegalAnalysis extractedText={result.extractedText} />
            <SecurityAnalysis extractedText={result.extractedText} uploadedFile={result.uploadedFile} />
            <TranslationPanel extractedText={result.extractedText} />
        </div>
    );
};

export default OCRResults;