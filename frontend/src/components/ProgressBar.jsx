import React from 'react';

const ProgressBar = ({ progress, message, steps }) => {
    const currentStep = Math.floor((progress / 100) * (steps?.length || 4));

    const defaultSteps = [
        'Uploading file...',
        'Processing image...',
        'Extracting text...',
        'Analysis complete!'
    ];

    const processSteps = steps || defaultSteps;

    return (
        <div className="progress-container">
            <div className="progress-header">
                <h4>{message || 'Processing Document'}</h4>
                <span className="progress-percentage">{Math.round(progress)}%</span>
            </div>
            
            <div className="progress-bar">
                <div 
                    className="progress-fill" 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            <div className="progress-steps">
                {processSteps.map((step, index) => (
                    <div 
                        key={index}
                        className={`progress-step ${index <= currentStep ? 'completed' : ''} ${index === currentStep ? 'active' : ''}`}
                    >
                        <div className="step-indicator">
                            {index < currentStep ? '✓' : index === currentStep ? '⏳' : '○'}
                        </div>
                        <span className="step-text">{step}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProgressBar;