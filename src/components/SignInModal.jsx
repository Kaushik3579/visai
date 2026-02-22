import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Chrome } from 'lucide-react';
import '../styles/SignInModal.css';

const SignInModal = ({ onClose }) => {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithGoogle();
      onClose();
    } catch (err) {
      console.error('Sign in error:', err);
      
      // User-friendly error messages
      let errorMessage = 'Failed to sign in. Please try again.';
      
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign in was cancelled. Please try again.';
      } else if (err.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked by your browser. Please allow popups for this site.';
      } else if (err.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized. Please add it to Firebase authorized domains.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="signin-modal-overlay">
      <div className="signin-modal">
        <div className="signin-header">
          <h2>Sign In</h2>
          <button onClick={onClose} className="close-btn" disabled={loading}>
            <X size={20} />
          </button>
        </div>

        <div className="signin-content">
          <div className="signin-hero">
            <div className="signin-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>Welcome to Paper Writing Dashboard</h3>
            <p>Sign in to save your work across devices and access your files anywhere</p>
          </div>

          {error && (
            <div className="signin-error">
              <span>⚠️ {error}</span>
            </div>
          )}

          <div className="signin-methods">
            <button 
              onClick={handleGoogleSignIn}
              className="google-signin-btn"
              disabled={loading}
            >
              <Chrome size={20} />
              <span>{loading ? 'Signing in...' : 'Continue with Google'}</span>
            </button>
          </div>

          <div className="signin-footer">
            <p className="signin-note">
              By signing in, you agree to sync your data with our cloud service.
              Your files will be securely stored.
            </p>
            {import.meta.env.DEV && (
              <p className="signin-dev-note" style={{ fontSize: '11px', color: '#858585', marginTop: '8px' }}>
                ℹ️ Console CORS warnings are normal in development mode
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInModal;
