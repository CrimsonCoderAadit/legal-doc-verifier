import React, { useState } from 'react';
import DocumentUpload from './components/DocumentUpload';
import OCRResults from './components/OCRResults';
import './App.css';

function App() {
  const [ocrResult, setOcrResult] = useState(null);

  const handleUploadSuccess = (result) => {
    setOcrResult(result);
  };

  const resetApp = () => {
    setOcrResult(null);
  };

  return (
    <div className="App">
      <header className="header">
        <h1>Legal Document Verification System</h1>
        <p>Advanced OCR technology for legal document analysis and verification</p>
      </header>

      <div className="main-content">
        <div className="content-wrapper">
          <div className="upload-section">
            <DocumentUpload onUploadSuccess={handleUploadSuccess} />
          </div>

          {ocrResult && (
            <div className="results-section">
              <OCRResults result={ocrResult} onReset={resetApp} />
            </div>
          )}
        </div>

        <aside className="features-sidebar">
          <h3>Features</h3>
          <div className="feature-item">
            <div className="feature-icon">📄</div>
            <div className="feature-text">Document OCR Scanning</div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🔍</div>
            <div className="feature-text">Text Extraction & Analysis</div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🛡️</div>
            <div className="feature-text">Security Verification</div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🌐</div>
            <div className="feature-text">Multi-language Support</div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">⚡</div>
            <div className="feature-text">Fast Processing</div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;