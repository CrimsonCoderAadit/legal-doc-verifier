import React, { useState } from 'react';
import axios from 'axios';
import CameraScanner from './CameraScanner';

const DocumentUpload = ({ onUploadSuccess, onUploadStart, onUploadProgress, user }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [uploadStep, setUploadStep] = useState(0);

    const uploadSteps = [
        'Preparing upload...',
        'Uploading file...',
        'Processing image...',
        'Extracting text...',
        'Finalizing...'
    ];

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleCameraCapture = (file) => {
        setSelectedFile(file);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setDragOver(false);
        const file = event.dataTransfer.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const simulateProgress = () => {
        let progress = 0;
        let step = 0;
        
        const interval = setInterval(() => {
            progress += Math.random() * 15 + 5;
            
            if (progress >= 25 && step === 0) {
                setUploadStep(1);
                step = 1;
            } else if (progress >= 50 && step === 1) {
                setUploadStep(2);
                step = 2;
            } else if (progress >= 75 && step === 2) {
                setUploadStep(3);
                step = 3;
            } else if (progress >= 90 && step === 3) {
                setUploadStep(4);
                step = 4;
            }
            
            if (progress >= 100) {
                clearInterval(interval);
                progress = 100;
            }
            
            onUploadProgress && onUploadProgress(Math.min(progress, 100));
        }, 300);

        return interval;
    };

    const uploadFile = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setUploadStep(0);
        onUploadStart && onUploadStart();

        const progressInterval = simulateProgress();
        const formData = new FormData();
        formData.append('document', selectedFile);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:3001/api/documents/upload',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    },
                }
            );

            clearInterval(progressInterval);
            onUploadProgress && onUploadProgress(100);

            if (response.data.success) {
                setTimeout(() => {
                    onUploadSuccess({
                        ...response.data,
                        uploadedFile: selectedFile
                    });
                }, 500);
            }
        } catch (error) {
            clearInterval(progressInterval);
            console.error('Upload error:', error);
            alert('Upload failed: ' + (error.response?.data?.error || error.message));
        } finally {
            setUploading(false);
            setUploadStep(0);
        }
    };

    const resetFile = () => {
        setSelectedFile(null);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="upload-container">
            <div className="upload-header">
                <h2>Upload Legal Document</h2>
                <p>Scan or upload documents for AI-powered analysis and verification</p>
            </div>

            {!selectedFile && (
                <div className="upload-methods">
                    <CameraScanner onCapture={handleCameraCapture} />
                    
                    <div className="upload-divider">
                        <span>OR</span>
                    </div>
                    
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`upload-dropzone ${dragOver ? 'drag-over' : ''}`}
                    >
                        <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={handleFileSelect}
                            className="file-input"
                            id="fileInput"
                        />
                        <label htmlFor="fileInput" className="upload-label">
                            <div className="upload-icon">📄</div>
                            <h3>Choose a file or drag it here</h3>
                            <p>Supports JPG, PNG, PDF up to 10MB</p>
                            <button type="button" className="choose-file-btn">
                                Choose File
                            </button>
                        </label>
                    </div>
                </div>
            )}

            {selectedFile && !uploading && (
                <div className="file-preview">
                    <div className="file-info">
                        <div className="file-icon">📄</div>
                        <div className="file-details">
                            <h4>{selectedFile.name}</h4>
                            <p>{formatFileSize(selectedFile.size)} • {selectedFile.type}</p>
                        </div>
                        <button className="remove-file" onClick={resetFile}>✕</button>
                    </div>
                    
                    <div className="upload-actions">
                        <button 
                            className="upload-btn primary"
                            onClick={uploadFile}
                            disabled={uploading}
                        >
                            🚀 Start Analysis
                        </button>
                        <button 
                            className="upload-btn secondary"
                            onClick={resetFile}
                        >
                            Choose Different File
                        </button>
                    </div>
                </div>
            )}

            {uploading && (
                <div className="upload-progress">
                    <div className="progress-header">
                        <h3>Processing Your Document</h3>
                        <p>{uploadSteps[uploadStep]}</p>
                    </div>
                    
                    <div className="progress-steps">
                        {uploadSteps.map((step, index) => (
                            <div 
                                key={index}
                                className={`step ${index <= uploadStep ? 'completed' : ''} ${index === uploadStep ? 'active' : ''}`}
                            >
                                <div className="step-indicator">
                                    {index < uploadStep ? '✓' : index === uploadStep ? '⏳' : '○'}
                                </div>
                                <span>{step}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="upload-features">
                <h3>What happens after upload?</h3>
                <div className="features-grid">
                    <div className="feature">
                        <span className="feature-icon">🔍</span>
                        <h4>OCR Text Extraction</h4>
                        <p>Advanced AI extracts text with high accuracy</p>
                    </div>
                    <div className="feature">
                        <span className="feature-icon">⚖️</span>
                        <h4>Legal Analysis</h4>
                        <p>Identifies clauses, risks, and legal implications</p>
                    </div>
                    <div className="feature">
                        <span className="feature-icon">🛡️</span>
                        <h4>Security Verification</h4>
                        <p>Checks authenticity and security features</p>
                    </div>
                    <div className="feature">
                        <span className="feature-icon">🌐</span>
                        <h4>Multi-language Support</h4>
                        <p>Translates to 10+ Indian languages</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentUpload;