import React, { useState } from 'react';
import axios from 'axios';

const LegalAnalysis = ({ extractedText }) => {
    const [analysis, setAnalysis] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);

    const analyzeDocument = async () => {
        if (!extractedText) return;

        setAnalyzing(true);
        try {
            const response = await axios.post(
                'http://localhost:3001/api/documents/analyze',
                { text: extractedText }
            );

            if (response.data.success) {
                setAnalysis(response.data.analysis);
            }
        } catch (error) {
            console.error('Analysis error:', error);
            alert('Analysis failed: ' + (error.response?.data?.error || error.message));
        } finally {
            setAnalyzing(false);
        }
    };

    const getRiskColor = (level) => {
        switch (level) {
            case 'high': return '#dc2626';
            case 'medium': return '#d97706';
            case 'low': return '#059669';
            default: return '#6b7280';
        }
    };

    const getRiskBgColor = (level) => {
        switch (level) {
            case 'high': return '#fef2f2';
            case 'medium': return '#fffbeb';
            case 'low': return '#f0fdf4';
            default: return '#f9fafb';
        }
    };

    // Check if document is not legal
    const isNotLegalDocument = analysis && (
        analysis.documentType.type === 'unknown' && 
        analysis.documentType.confidence < 0.1 && 
        analysis.clauses.length === 0
    );

    return (
        <div style={{
            background: 'rgba(17, 24, 39, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(75, 85, 99, 0.3)',
            borderRadius: '16px',
            padding: '2rem',
            marginTop: '2rem'
        }}>
            <h3 style={{ color: '#60a5fa', marginBottom: '1rem' }}>Legal Document Analysis</h3>
            
            <button
                onClick={analyzeDocument}
                disabled={!extractedText || analyzing}
                style={{
                    padding: '0.75rem 1.5rem',
                    background: analyzing ? '#374151' : 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: analyzing ? 'not-allowed' : 'pointer',
                    marginBottom: '1.5rem'
                }}
            >
                {analyzing ? 'Analyzing...' : 'Analyze Legal Document'}
            </button>

            {isNotLegalDocument && (
                <div style={{
                    background: 'linear-gradient(135deg, #f87171 0%, #dc2626 100%)',
                    color: 'white',
                    padding: '2rem',
                    borderRadius: '12px',
                    textAlign: 'center',
                    border: '2px solid #dc2626'
                }}>
                    <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>⚠️ Not a Legal Document</h2>
                    <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                        This document does not appear to contain legal content or clauses.
                    </p>
                    <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                        This tool is designed specifically for legal documents such as contracts, 
                        agreements, property deeds, and other legal papers.
                    </p>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginTop: '1rem'
                    }}>
                        <p style={{ fontSize: '0.9rem', margin: 0 }}>
                            <strong>Supported Documents:</strong> Loan Agreements, Property Deeds, 
                            Rental Contracts, Employment Contracts, Insurance Policies, Power of Attorney
                        </p>
                    </div>
                </div>
            )}

            {analysis && !isNotLegalDocument && (
                <div>
                    {/* Document Type */}
                    <div style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        borderLeft: '4px solid #3b82f6'
                    }}>
                        <h4 style={{ color: '#60a5fa', marginBottom: '0.5rem' }}>Document Type</h4>
                        <p style={{ color: '#e2e8f0' }}>
                            {analysis.documentType.type.replace('_', ' ').toUpperCase()} 
                            <span style={{ 
                                marginLeft: '1rem',
                                padding: '0.25rem 0.5rem',
                                background: getRiskBgColor(analysis.documentType.riskLevel),
                                color: getRiskColor(analysis.documentType.riskLevel),
                                borderRadius: '4px',
                                fontSize: '0.8rem'
                            }}>
                                {analysis.documentType.riskLevel.toUpperCase()} RISK
                            </span>
                        </p>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                            Confidence: {Math.round(analysis.documentType.confidence * 100)}%
                        </p>
                    </div>

                    {/* Risk Score */}
                    <div style={{
                        background: getRiskBgColor(analysis.riskScore >= 7 ? 'high' : analysis.riskScore >= 4 ? 'medium' : 'low'),
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        borderLeft: `4px solid ${getRiskColor(analysis.riskScore >= 7 ? 'high' : analysis.riskScore >= 4 ? 'medium' : 'low')}`
                    }}>
                        <h4 style={{ color: getRiskColor(analysis.riskScore >= 7 ? 'high' : analysis.riskScore >= 4 ? 'medium' : 'low'), marginBottom: '0.5rem' }}>
                            Overall Risk Score: {analysis.riskScore}/10
                        </h4>
                        <p style={{ color: '#1f2937', fontSize: '0.9rem' }}>{analysis.summary}</p>
                    </div>

                    {/* Warnings */}
                    {analysis.warnings.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                            <h4 style={{ color: '#f59e0b', marginBottom: '0.5rem' }}>⚠️ Warnings</h4>
                            {analysis.warnings.map((warning, index) => (
                                <div key={index} style={{
                                    background: '#fef3c7',
                                    color: '#92400e',
                                    padding: '0.75rem',
                                    borderRadius: '6px',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.9rem'
                                }}>
                                    {warning.message}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Extracted Clauses */}
                    {analysis.clauses.length > 0 && (
                        <div>
                            <h4 style={{ color: '#60a5fa', marginBottom: '1rem' }}>Key Clauses Found</h4>
                            {analysis.clauses.map((clause, index) => (
                                <div key={clause.id} style={{
                                    background: 'rgba(17, 24, 39, 0.9)',
                                    border: `1px solid ${getRiskColor(clause.riskLevel)}`,
                                    borderRadius: '8px',
                                    padding: '1rem',
                                    marginBottom: '1rem'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <h5 style={{ color: '#f1f5f9', margin: 0 }}>
                                            {clause.type.replace('_', ' ').toUpperCase()}
                                        </h5>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            background: getRiskBgColor(clause.riskLevel),
                                            color: getRiskColor(clause.riskLevel),
                                            borderRadius: '4px',
                                            fontSize: '0.7rem'
                                        }}>
                                            {clause.riskLevel.toUpperCase()}
                                        </span>
                                    </div>
                                    
                                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem', fontStyle: 'italic' }}>
                                        "{clause.text.substring(0, 150)}..."
                                    </p>
                                    
                                    <p style={{ color: '#e2e8f0', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                        <strong>Plain English:</strong> {clause.explanation}
                                    </p>
                                    
                                    <p style={{ color: '#60a5fa', fontSize: '0.8rem' }}>
                                        <strong>Legal Reference:</strong> {clause.legalReference}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LegalAnalysis;