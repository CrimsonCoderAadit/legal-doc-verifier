import React, { useState, useEffect } from 'react';

const DocumentHistory = ({ user, onSelectDocument }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/api/documents/my-documents', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setDocuments(data.documents);
            }
        } catch (error) {
            console.error('Failed to fetch documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = doc.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            doc.extractedText.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (filterType === 'all') return matchesSearch;
        
        const docType = doc.analysisResults?.legal?.documentType?.type;
        return matchesSearch && docType === filterType;
    });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDocumentTypeIcon = (type) => {
        const icons = {
            'property_deed': '🏠',
            'loan_agreement': '💰',
            'rental_agreement': '🏢',
            'employment_contract': '💼',
            'insurance_policy': '🛡️',
            'power_of_attorney': '📋'
        };
        return icons[type] || '📄';
    };

    const getRiskColor = (score) => {
        if (score >= 80) return '#059669';
        if (score >= 60) return '#d97706';
        return '#dc2626';
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading your documents...</p>
            </div>
        );
    }

    return (
        <div className="document-history">
            <div className="history-header">
                <h2>Document History</h2>
                <p>Your uploaded and analyzed documents</p>
            </div>

            <div className="history-controls">
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search documents..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <span className="search-icon">🔍</span>
                </div>

                <select 
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="filter-select"
                >
                    <option value="all">All Documents</option>
                    <option value="property_deed">Property Deeds</option>
                    <option value="loan_agreement">Loan Agreements</option>
                    <option value="rental_agreement">Rental Agreements</option>
                    <option value="employment_contract">Employment Contracts</option>
                    <option value="insurance_policy">Insurance Policies</option>
                </select>
            </div>

            <div className="documents-grid">
                {filteredDocuments.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📂</div>
                        <h3>No documents found</h3>
                        <p>Upload your first document to get started</p>
                    </div>
                ) : (
                    filteredDocuments.map((doc) => (
                        <div 
                            key={doc._id} 
                            className="document-card"
                            onClick={() => onSelectDocument(doc)}
                        >
                            <div className="document-header">
                                <div className="document-icon">
                                    {getDocumentTypeIcon(doc.analysisResults?.legal?.documentType?.type)}
                                </div>
                                <div className="document-info">
                                    <h4 className="document-name">{doc.originalName}</h4>
                                    <p className="document-date">{formatDate(doc.uploadDate)}</p>
                                </div>
                            </div>

                            <div className="document-preview">
                                <p>{doc.extractedText.substring(0, 150)}...</p>
                            </div>

                            <div className="document-meta">
                                {doc.analysisResults?.legal && (
                                    <div className="meta-item">
                                        <span className="meta-label">Type:</span>
                                        <span className="meta-value">
                                            {doc.analysisResults.legal.documentType?.type?.replace('_', ' ') || 'Unknown'}
                                        </span>
                                    </div>
                                )}

                                {doc.analysisResults?.security && (
                                    <div className="meta-item">
                                        <span className="meta-label">Security:</span>
                                        <span 
                                            className="meta-value security-score"
                                            style={{ color: getRiskColor(doc.analysisResults.security.authenticityScore) }}
                                        >
                                            {doc.analysisResults.security.authenticityScore}/100
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="document-actions">
                                <button className="view-btn">View Analysis</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DocumentHistory;