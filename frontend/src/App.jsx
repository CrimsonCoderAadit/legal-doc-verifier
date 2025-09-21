import React, { useState, useEffect } from 'react';
import Sidebar from './components/SideBar';
import AuthModal from './components/AuthModal';
import DocumentUpload from './components/DocumentUpload';
import OCRResults from './components/OCRResults';
import DocumentHistory from './components/DocumentHistory';
import ProgressBar from './components/ProgressBar';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeSection, setActiveSection] = useState('upload');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      validateToken(token);
    } else {
      setShowAuthModal(true);
    }
  }, []);

  const validateToken = async (token) => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        localStorage.removeItem('token');
        setShowAuthModal(true);
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      localStorage.removeItem('token');
      setShowAuthModal(true);
    }
  };

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    setShowAuthModal(true);
    setCurrentDocument(null);
    setActiveSection('upload');
    setSidebarOpen(false);
  };

  const handleUploadSuccess = (result) => {
    setCurrentDocument(result);
    setActiveSection('results');
    setIsUploading(false);
    setUploadProgress(0);
  };

  const handleUploadStart = () => {
    setIsUploading(true);
    setUploadProgress(0);
  };

  const handleUploadProgress = (progress) => {
    setUploadProgress(progress);
  };

  const resetDocument = () => {
    setCurrentDocument(null);
    setActiveSection('upload');
  };

  const handleSelectDocument = (document) => {
    setCurrentDocument({
      success: true,
      documentId: document._id,
      filename: document.filename,
      originalName: document.originalName,
      extractedText: document.extractedText,
      confidence: 0.95,
      analysisResults: document.analysisResults
    });
    setActiveSection('results');
  };

  const renderMainContent = () => {
    switch (activeSection) {
      case 'upload':
        return (
          <div className="main-section">
            {isUploading && (
              <ProgressBar 
                progress={uploadProgress} 
                message="Processing document..."
              />
            )}
            <DocumentUpload 
              onUploadSuccess={handleUploadSuccess}
              onUploadStart={handleUploadStart}
              onUploadProgress={handleUploadProgress}
              user={user}
            />
          </div>
        );
      case 'results':
        return currentDocument ? (
          <div className="main-section">
            <OCRResults 
              result={currentDocument} 
              onReset={resetDocument}
              user={user}
            />
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <h3>No document selected</h3>
            <p>Upload a document or select from history to see results</p>
            <button 
              className="primary-btn"
              onClick={() => setActiveSection('upload')}
            >
              Upload Document
            </button>
          </div>
        );
      case 'history':
        return (
          <div className="main-section">
            <DocumentHistory 
              user={user} 
              onSelectDocument={handleSelectDocument} 
            />
          </div>
        );
      default:
        return (
          <DocumentUpload 
            onUploadSuccess={handleUploadSuccess} 
            user={user} 
          />
        );
    }
  };

  if (showAuthModal) {
    return <AuthModal onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <Sidebar 
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        user={user}
        onLogout={handleLogout}
      />
      
      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <header className="app-header">
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <h1>Legal Document Verification</h1>
          <div className="header-actions">
            <div className="user-info">
              <span>Welcome, {user?.username}</span>
            </div>
          </div>
        </header>

        <main className="content-area">
          {renderMainContent()}
        </main>
      </div>

      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}

export default App;