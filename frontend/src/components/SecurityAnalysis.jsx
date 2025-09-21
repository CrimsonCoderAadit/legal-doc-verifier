import React, { useState } from 'react';
import axios from 'axios';

const SecurityAnalysis = ({ extractedText, uploadedFile }) => {
    const [securityAnalysis, setSecurityAnalysis] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);

    const analyzeDocumentSecurity = async () => {
        if (!extractedText || !uploadedFile) return;

        setAnalyzing(true);
        try {
            const formData = new FormData();
            formData.append('document', uploadedFile);
            formData.append('extractedText', extractedText);

            const response = await axios.post(
                'http://localhost:3001/api/documents/security-check',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (response.data.success) {
                setSecurityAnalysis(response.data.security);
            }
        } catch (error) {
            console.error('Security analysis error:', error);
            alert('Security analysis failed: ' + (error.response?.data?.error || error.message));
        } finally {
            setAnalyzing(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return '#059669';
        if (score >= 60) return '#d97706';
        return '#dc2626';
    };

    const getScoreBgColor = (score) => {
        if (score >= 80) return '#f0fdf4';
        if (score >= 60) return '#fffbeb';
        return '#fef2f2';
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'high': return '#dc2626';
            case 'medium': return '#d97706';
            case 'low': return '#059669';
            default: return '#6b7280';
        }
    };

    // Check if QR code is not legal/government-related
    const isNonLegalQR = securityAnalysis && 
        securityAnalysis.qrAnalysis.found && 
        !securityAnalysis.qrAnalysis.isValid;

    return (
        <div style={{
            background: 'rgba(17, 24, 39, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(75, 85, 99, 0.3)',
            borderRadius: '16px',
            padding: '2rem',
            marginTop: '2rem'
        }}>
            <h3 style={{ color: '#60a5fa', marginBottom: '1rem' }}>Document Security Analysis</h3>
            
            <button
                onClick={analyzeDocumentSecurity}
                disabled={!extractedText || !uploadedFile || analyzing}
                style={{
                    padding: '0.75rem 1.5rem',
                    background: analyzing ? '#374151' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: analyzing ? 'not-allowed' : 'pointer',
                    marginBottom: '1.5rem'
                }}
            >
                {analyzing ? 'Checking Security...' : 'Verify Document Authenticity'}
            </button>

            {securityAnalysis && (
                <div>
                    {/* Non-Legal QR Code Warning */}
                    {isNonLegalQR && (
                        <div style={{
                            background: 'linear-gradient(135deg, #f87171 0%, #dc2626 100%)',
                            color: 'white',
                            padding: '2rem',
                            borderRadius: '12px',
                            textAlign: 'center',
                            border: '2px solid #dc2626',
                            marginBottom: '1.5rem'
                        }}>
                            <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Non-Legal QR Code Detected</h2>
                            <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                                This document contains a QR code that does not appear to be from an official legal or government source.
                            </p>
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                padding: '1rem',
                                borderRadius: '8px',
                                marginTop: '1rem'
                            }}>
                                <p style={{ fontSize: '0.9rem', margin: 0, marginBottom: '0.5rem' }}>
                                    <strong>QR Code Type:</strong> {securityAnalysis.qrAnalysis.type}
                                </p>
                                <p style={{ fontSize: '0.9rem', margin: 0 }}>
                                    <strong>Content Preview:</strong> {securityAnalysis.qrAnalysis.data.substring(0, 100)}...
                                </p>
                            </div>
                            <p style={{ fontSize: '0.9rem', marginTop: '1rem', opacity: 0.9 }}>
                                Legal documents should contain QR codes from government domains (.gov.in, .nic.in) or official verification systems.
                            </p>
                        </div>
                    )}

                    {/* No QR Code Found */}
                    {securityAnalysis && !securityAnalysis.qrAnalysis.found && (
                        <div style={{
                            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                            color: 'white',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            textAlign: 'center',
                            border: '2px solid #f59e0b',
                            marginBottom: '1.5rem'
                        }}>
                            <h2 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>No QR Code Detected</h2>
                            <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
                                Most authentic legal documents contain security QR codes for verification.
                            </p>
                            <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                                Verify document authenticity through other security features or manual verification.
                            </p>
                        </div>
                    )}

                    {/* Authentic Legal QR Code */}
                    {securityAnalysis && securityAnalysis.qrAnalysis.found && securityAnalysis.qrAnalysis.isValid && (
                        <div style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            textAlign: 'center',
                            border: '2px solid #059669',
                            marginBottom: '1.5rem'
                        }}>
                            <h2 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>Valid Legal QR Code Found</h2>
                            <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
                                Document contains a QR code from an official government or legal source.
                            </p>
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                padding: '1rem',
                                borderRadius: '8px',
                                marginTop: '1rem'
                            }}>
                                <p style={{ fontSize: '0.9rem', margin: 0 }}>
                                    <strong>QR Type:</strong> {securityAnalysis.qrAnalysis.type}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Authenticity Score */}
                    <div style={{
                        background: getScoreBgColor(securityAnalysis.authenticityScore),
                        padding: '1.5rem',
                        borderRadius: '12px',
                        marginBottom: '1.5rem',
                        borderLeft: `4px solid ${getScoreColor(securityAnalysis.authenticityScore)}`
                    }}>
                        <h4 style={{ color: getScoreColor(securityAnalysis.authenticityScore), marginBottom: '0.5rem' }}>
                            Authenticity Score: {securityAnalysis.authenticityScore}/100
                        </h4>
                        <p style={{ color: '#1f2937', fontSize: '0.9rem' }}>
                            {securityAnalysis.authenticityScore >= 80 ? 'Document appears highly authentic' :
                             securityAnalysis.authenticityScore >= 60 ? 'Document authenticity uncertain - verify carefully' :
                             'Document may be fraudulent - requires manual verification'}
                        </p>
                    </div>

                    {/* Document Hash */}
                    <div style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        borderLeft: '4px solid #3b82f6'
                    }}>
                        <h4 style={{ color: '#60a5fa', marginBottom: '0.5rem' }}>Document Fingerprint</h4>
                        <p style={{ color: '#e2e8f0', fontSize: '0.8rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                            {securityAnalysis.documentHash.hash}
                        </p>
                        <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                            Generated: {new Date(securityAnalysis.documentHash.timestamp).toLocaleString()}
                        </p>
                        <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                            File Size: {Math.round(securityAnalysis.documentHash.fileSize / 1024)} KB
                        </p>
                    </div>

                    {/* QR Content Verification */}
                    {securityAnalysis.qrAnalysis.found && (
                        <div style={{
                            background: 'rgba(17, 24, 39, 0.9)',
                            border: `1px solid ${securityAnalysis.qrAnalysis.textMatch.matched ? '#059669' : '#d97706'}`,
                            borderRadius: '8px',
                            padding: '1rem',
                            marginBottom: '1rem'
                        }}>
                            <h4 style={{ color: '#60a5fa', marginBottom: '0.5rem' }}>QR Content Verification</h4>
                            <div style={{ marginBottom: '0.5rem' }}>
                                <p style={{ 
                                    color: securityAnalysis.qrAnalysis.textMatch.matched ? '#059669' : '#d97706', 
                                    fontSize: '0.9rem' 
                                }}>
                                    {securityAnalysis.qrAnalysis.textMatch.matched ? '✓' : '⚠'} Text Match: {securityAnalysis.qrAnalysis.textMatch.score}%
                                </p>
                                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                                    Matched {securityAnalysis.qrAnalysis.textMatch.matchedWords} of {securityAnalysis.qrAnalysis.textMatch.totalWords} key terms
                                </p>
                            </div>
                            <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontFamily: 'monospace', fontStyle: 'italic' }}>
                                QR Data: {securityAnalysis.qrAnalysis.data.substring(0, 150)}...
                            </p>
                        </div>
                    )}

                    {/* Security Features */}
                    <div style={{ marginBottom: '1rem' }}>
                        <h4 style={{ color: '#60a5fa', marginBottom: '0.5rem' }}>Security Features Analysis</h4>
                        <div style={{
                            background: 'rgba(17, 24, 39, 0.9)',
                            padding: '1rem',
                            borderRadius: '8px'
                        }}>
                            <p style={{ color: '#e2e8f0', marginBottom: '0.5rem' }}>
                                <strong>Official Seals Found:</strong> {securityAnalysis.securityFeatures.officialSeals.length}
                                {securityAnalysis.securityFeatures.officialSeals.length > 0 && (
                                    <span style={{ color: '#94a3b8', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                                        ({securityAnalysis.securityFeatures.officialSeals.slice(0, 2).join(', ')})
                                    </span>
                                )}
                            </p>
                            <p style={{ color: '#e2e8f0', marginBottom: '0.5rem' }}>
                                <strong>Security Marks:</strong> {securityAnalysis.securityFeatures.securityMarks.length}
                                {securityAnalysis.securityFeatures.securityMarks.length > 0 && (
                                    <span style={{ color: '#94a3b8', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                                        ({securityAnalysis.securityFeatures.securityMarks.slice(0, 2).join(', ')})
                                    </span>
                                )}
                            </p>
                            <p style={{ color: '#e2e8f0', marginBottom: '0.5rem' }}>
                                <strong>Format Indicators:</strong> {securityAnalysis.securityFeatures.formatIndicators.length}
                                {securityAnalysis.securityFeatures.formatIndicators.length > 0 && (
                                    <span style={{ color: '#94a3b8', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                                        ({securityAnalysis.securityFeatures.formatIndicators.slice(0, 2).join(', ')})
                                    </span>
                                )}
                            </p>
                            {securityAnalysis.securityFeatures.suspiciousContent.length > 0 && (
                                <p style={{ color: '#dc2626', fontWeight: 'bold' }}>
                                    <strong>Suspicious Content:</strong> {securityAnalysis.securityFeatures.suspiciousContent.join(', ')}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Security Flags */}
                    {securityAnalysis.flags.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                            <h4 style={{ color: '#f59e0b', marginBottom: '0.5rem' }}>Security Alerts</h4>
                            {securityAnalysis.flags.map((flag, index) => (
                                <div key={index} style={{
                                    background: flag.severity === 'high' ? '#fef2f2' : flag.severity === 'medium' ? '#fffbeb' : '#f0f9ff',
                                    color: getSeverityColor(flag.severity),
                                    padding: '0.75rem',
                                    borderRadius: '6px',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.9rem',
                                    borderLeft: `4px solid ${getSeverityColor(flag.severity)}`
                                }}>
                                    <strong>{flag.severity.toUpperCase()}:</strong> {flag.message}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Recommendations */}
                    {securityAnalysis.recommendations.length > 0 && (
                        <div>
                            <h4 style={{ color: '#60a5fa', marginBottom: '0.5rem' }}>Security Recommendations</h4>
                            <div style={{
                                background: 'rgba(17, 24, 39, 0.9)',
                                padding: '1rem',
                                borderRadius: '8px'
                            }}>
                                <ul style={{ color: '#e2e8f0', marginLeft: '1rem', margin: 0 }}>
                                    {securityAnalysis.recommendations.map((rec, index) => (
                                        <li key={index} style={{ marginBottom: '0.5rem' }}>{rec}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SecurityAnalysis;