import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Settings, HelpCircle } from 'lucide-react';
import '../styles/ProfileDropdown.css';

const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!user) return null;

  const displayName = user.displayName || 'User';
  const email = user.email || '';
  const photoURL = user.photoURL;
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="profile-dropdown" ref={dropdownRef}>
      <button 
        className="profile-trigger"
        onClick={() => setIsOpen(!isOpen)}
        title={displayName}
      >
        {photoURL ? (
          <img src={photoURL} alt={displayName} className="profile-avatar" />
        ) : (
          <div className="profile-avatar-placeholder">
            {initials}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="profile-menu">
          <div className="profile-info">
            {photoURL ? (
              <img src={photoURL} alt={displayName} className="profile-avatar-large" />
            ) : (
              <div className="profile-avatar-placeholder large">
                {initials}
              </div>
            )}
            <div className="profile-details">
              <div className="profile-name">{displayName}</div>
              <div className="profile-email">{email}</div>
            </div>
          </div>

          <div className="profile-menu-divider"></div>

          <div className="profile-menu-items">
            <button className="profile-menu-item">
              <User size={16} />
              <span>Profile Settings</span>
            </button>
            <button className="profile-menu-item">
              <Settings size={16} />
              <span>Preferences</span>
            </button>
            <button className="profile-menu-item">
              <HelpCircle size={16} />
              <span>Help & Support</span>
            </button>
          </div>

          <div className="profile-menu-divider"></div>

          <div className="profile-menu-items">
            <button className="profile-menu-item logout" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
