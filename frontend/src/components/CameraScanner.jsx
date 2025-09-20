import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';

const CameraScanner = ({ onCapture }) => {
    const webcamRef = useRef(null);
    const [showCamera, setShowCamera] = useState(false);
    const [capturing, setCapturing] = useState(false);

    const capture = useCallback(() => {
        setCapturing(true);
        const imageSrc = webcamRef.current.getScreenshot();
        
        // Convert base64 to file
        fetch(imageSrc)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], `scan_${Date.now()}.jpg`, { type: 'image/jpeg' });
                onCapture(file);
                setShowCamera(false);
                setCapturing(false);
            });
    }, [onCapture]);

    const videoConstraints = {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "environment" // Use back camera on mobile
    };

    if (!showCamera) {
        return (
            <button
                onClick={() => setShowCamera(true)}
                style={{
                    width: '100%',
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    marginBottom: '1rem'
                }}
            >
                📷 Scan Document with Camera
            </button>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '1rem',
                maxWidth: '90vw',
                maxHeight: '90vh'
            }}>
                <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: '#333' }}>
                    Position Document in Frame
                </h3>
                
                <div style={{
                    position: 'relative',
                    display: 'inline-block',
                    borderRadius: '8px',
                    overflow: 'hidden'
                }}>
                    <Webcam
                        ref={webcamRef}
                        audio={false}
                        screenshotFormat="image/jpeg"
                        videoConstraints={videoConstraints}
                        style={{
                            width: '100%',
                            maxWidth: '500px',
                            height: 'auto'
                        }}
                    />
                    
                    {/* Document frame overlay */}
                    <div style={{
                        position: 'absolute',
                        top: '10%',
                        left: '10%',
                        right: '10%',
                        bottom: '10%',
                        border: '2px dashed #00ff00',
                        borderRadius: '8px',
                        pointerEvents: 'none'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '-30px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'rgba(0, 255, 0, 0.8)',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px'
                        }}>
                            Align document within frame
                        </div>
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'center',
                    marginTop: '1rem'
                }}>
                    <button
                        onClick={capture}
                        disabled={capturing}
                        style={{
                            padding: '1rem 2rem',
                            background: capturing ? '#ccc' : 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            cursor: capturing ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {capturing ? 'Capturing...' : '📸 Capture'}
                    </button>
                    
                    <button
                        onClick={() => setShowCamera(false)}
                        style={{
                            padding: '1rem 2rem',
                            background: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CameraScanner;