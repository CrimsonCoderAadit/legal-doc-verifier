import React, { useState, useEffect } from 'react';
import './App.css';

// Import components with error handling
let AuthModal, Sidebar, DocumentUpload, OCRResults, DocumentHistory, ProgressBar;

try {
  AuthModal = require('./components/AuthModal').default;
  Sidebar = require('./components/SideBar').default;
  DocumentUpload = require('./components/DocumentUpload').default;
  OCRResults = require('./components/OCRResults').default;
  DocumentHistory = require('./components/DocumentHistory').default;
  ProgressBar = require('./components/ProgressBar').default;
} catch (error) {
  console.error('Component import error:', error);
}

function App() {
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeSection, setActiveSection] = useState('upload');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [appError, setAppError] = useState(null);

  useEffect(() => {
    try {
      // For testing, skip authentication and use mock user
      const mockUser = { username: 'TestUser', email: 'test@example.com' };
      setUser(mockUser);
      setShowAuthModal(false);
    } catch (error) {
      console.error('App initialization error:', error);
      setAppError(error.message);
    }
  }, []);

  const handleLogin = (userData, token) => {
    try {
      setUser(userData);
      localStorage.setItem('token', token);
      setShowAuthModal(false);
    } catch (error) {
      console.error('Login error:', error);
      setAppError(error.message);
    }
  };

  const handleLogout = () => {
    try {
      setUser(null);
      localStorage.removeItem('token');
      setShowAuthModal(true);
      setCurrentDocument(null);
      setActiveSection('upload');
      setSidebarOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleUploadSuccess = (result) => {
    try {
      setCurrentDocument(result);
      setActiveSection('results');
      setIsUploading(false);
      setUploadProgress(0);
    } catch (error) {
      console.error('Upload success handler error:', error);
      setAppError(error.message);
    }
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

  const renderMainContent = () => {
    try {
      switch (activeSection) {
        case 'upload':
          return (
            <div className="main-section">
              {isUploading && ProgressBar && (
                <ProgressBar 
                  progress={uploadProgress} 
                  message="Processing document..."
                />
              )}
              {DocumentUpload ? (
                <DocumentUpload 
                  onUploadSuccess={handleUploadSuccess}
                  onUploadStart={handleUploadStart}
                  onUploadProgress={handleUploadProgress}
                  user={user}
                />
              ) : (
                <div style={{ color: 'white', textAlign: 'center', padding: '2rem' }}>
                  <h3>DocumentUpload component not loaded</h3>
                  <p>Check console for import errors</p>
                </div>
              )}
            </div>
          );
        
        case 'results':
          return currentDocument && OCRResults ? (
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
              <p>Upload a document to see results</p>
              <button 
                className="primary-btn"
                onClick={() => setActiveSection('upload')}
              >
                Upload Document
              </button>
            </div>
          );
        
        case 'history':
          return DocumentHistory ? (
            <div className="main-section">
              <DocumentHistory 
                user={user} 
                onSelectDocument={setCurrentDocument} 
              />
            </div>
          ) : (
            <div style={{ color: 'white', textAlign: 'center', padding: '2rem' }}>
              <h3>DocumentHistory component not loaded</h3>
            </div>
          );
        
        default:
          return (
            <div className="main-section">
              {DocumentUpload && (
                <DocumentUpload 
                  onUploadSuccess={handleUploadSuccess} 
                  user={user} 
                />
              )}
            </div>
          );
      }
    } catch (error) {
      console.error('Render error:', error);
      return (
        <div style={{ color: 'white', textAlign: 'center', padding: '2rem' }}>
          <h3>Rendering Error</h3>
          <p>{error.message}</p>
        </div>
      );
    }
  };

  // Error boundary display
  if (appError) {
    return (
      <div style={{ 
        background: '#1a365d', 
        color: 'white', 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <div>
          <h2>Application Error</h2>
          <p>{appError}</p>
          <button 
            onClick={() => {
              setAppError(null);
              window.location.reload();
            }}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '8px',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            Reload App
          </button>
        </div>
      </div>
    );
  }

  // Show auth modal if needed
  if (showAuthModal && AuthModal) {
    return <AuthModal onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      {Sidebar && (
        <Sidebar 
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          user={user}
          onLogout={handleLogout}
        />
      )}
      
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