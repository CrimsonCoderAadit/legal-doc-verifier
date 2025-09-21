import React from 'react';

const Sidebar = ({ isOpen, onToggle, activeSection, onSectionChange, user, onLogout }) => {
    const menuItems = [
        {
            id: 'upload',
            label: 'Upload Document',
            icon: '📤',
            description: 'Scan new documents'
        },
        {
            id: 'results',
            label: 'Analysis Results',
            icon: '📊',
            description: 'View current analysis'
        },
        {
            id: 'history',
            label: 'Document History',
            icon: '📁',
            description: 'Your uploaded documents'
        }
    ];

    const analysisTools = [
        {
            id: 'legal-analysis',
            label: 'Legal Analysis',
            icon: '⚖️',
            description: 'AI-powered legal review'
        },
        {
            id: 'security-check',
            label: 'Security Verification',
            icon: '🛡️',
            description: 'Document authenticity'
        },
        {
            id: 'translation',
            label: 'Translation',
            icon: '🌐',
            description: 'Multi-language support'
        }
    ];

    return (
        <div className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <div className="logo">
                    <span className="logo-icon">⚖️</span>
                    <span className="logo-text">LegalVerify</span>
                </div>
                <button className="sidebar-close" onClick={onToggle}>✕</button>
            </div>

            <div className="sidebar-user">
                <div className="user-avatar">
                    {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="user-details">
                    <div className="username">{user?.username}</div>
                    <div className="user-email">{user?.email}</div>
                </div>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-section">
                    <h3>Main</h3>
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                            onClick={() => onSectionChange(item.id)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <div className="nav-content">
                                <span className="nav-label">{item.label}</span>
                                <span className="nav-description">{item.description}</span>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="nav-section">
                    <h3>Analysis Tools</h3>
                    {analysisTools.map(tool => (
                        <div key={tool.id} className="nav-item tool-item">
                            <span className="nav-icon">{tool.icon}</span>
                            <div className="nav-content">
                                <span className="nav-label">{tool.label}</span>
                                <span className="nav-description">{tool.description}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </nav>

            <div className="sidebar-footer">
                <button className="logout-btn" onClick={onLogout}>
                    <span>🚪</span>
                    Logout
                </button>
            </div>
        </div>
    );
};

export default SideBar;