import React, { useState } from 'react';
import axios from 'axios';

const DocumentUpload = ({ onUploadSuccess }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
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
        setSelectedFile(file);
    };

    const uploadFile = async () => {
        if (!selectedFile) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('document', selectedFile);

        try {
            const response = await axios.post(
                'http://localhost:3001/api/documents/upload',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (response.data.success) {
                onUploadSuccess(response.data);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed: ' + (error.response?.data?.error || error.message));
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Upload Document</h2>
            
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                    border: `2px dashed ${dragOver ? '#007bff' : '#ccc'}`,
                    borderRadius: '8px',
                    padding: '40px',
                    textAlign: 'center',
                    backgroundColor: dragOver ? '#f8f9fa' : 'white',
                    cursor: 'pointer'
                }}
            >
                <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    id="fileInput"
                />
                <label htmlFor="fileInput" style={{ cursor: 'pointer' }}>
                    {selectedFile ? (
                        <p>Selected: {selectedFile.name}</p>
                    ) : (
                        <div>
                            <p>Drag and drop a document here, or click to select</p>
                            <p style={{ fontSize: '14px', color: '#666' }}>
                                Supported: JPG, PNG, PDF
                            </p>
                        </div>
                    )}
                </label>
            </div>

            <button
                onClick={uploadFile}
                disabled={!selectedFile || uploading}
                style={{
                    marginTop: '20px',
                    padding: '10px 20px',
                    backgroundColor: uploading ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: uploading ? 'not-allowed' : 'pointer'
                }}
            >
                {uploading ? 'Processing...' : 'Upload & Extract Text'}
            </button>
        </div>
    );
};

export default DocumentUpload;
