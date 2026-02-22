import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Chrome, Lock, Cloud, Sparkles, Zap } from 'lucide-react';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithGoogle();
    } catch (err) {
      console.error('Sign in error:', err);
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
    <div className="login-shell">
      <div className="login-orb login-orb-one" />
      <div className="login-orb login-orb-two" />
      <div className="login-left fade-up">
        <div className="brand-pill">
          <span className="brand-dot" />
          VISAI Workspace
        </div>
        <h1>
          Write. Cite. Publish.
          <span>Everything in one focused workspace.</span>
        </h1>
        <p className="login-subtitle">
          A minimalist research environment built for clarity, versioning, and fast citations.
        </p>

        <div className="login-features">
          <div className="feature-item">
            <Cloud size={18} />
            <div>
              <strong>Cloud synced</strong>
              <span>Access your papers anywhere.</span>
            </div>
          </div>
          <div className="feature-item">
            <Sparkles size={18} />
            <div>
              <strong>Focused editing</strong>
              <span>Distraction-free writing tools.</span>
            </div>
          </div>
          <div className="feature-item">
            <Zap size={18} />
            <div>
              <strong>Smart references</strong>
              <span>Generate citations instantly.</span>
            </div>
          </div>
        </div>

        <div className="login-stats">
          <div className="stat-card">
            <span className="stat-label">Auto-save</span>
            <span className="stat-value">Enabled</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Sync latency</span>
            <span className="stat-value">&lt; 2s</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Workspace</span>
            <span className="stat-value">Encrypted</span>
          </div>
        </div>
      </div>

      <div className="login-right fade-up">
        <div className="login-card">
          <div className="card-header">
            <Lock size={18} />
            <div>
              <h2>Sign in to continue</h2>
              <p>Use your Google account to unlock the workspace.</p>
            </div>
          </div>

          {error && <div className="login-error">{error}</div>}

          <button
            className="google-signin-btn"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <Chrome size={18} />
            <span>{loading ? 'Signing in...' : 'Continue with Google'}</span>
          </button>

          <div className="login-tags">
            <span>Secure auth</span>
            <span>Private storage</span>
            <span>Instant sync</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
