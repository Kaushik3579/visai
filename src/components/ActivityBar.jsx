import { 
  Files, 
  Quote, 
  Database, 
  Settings,
  BookOpen,
  Info,
  FolderOpen,
  Puzzle
} from 'lucide-react';
import '../styles/ActivityBar.css';

const ActivityBar = ({ activeView, onViewChange }) => {
  const activities = [
    { id: 'explorer', icon: Files, label: 'Explorer', tooltip: 'Explorer (Ctrl+Shift+E)' },
    { id: 'search', icon: Quote, label: 'Citation Engine', tooltip: 'Citation Engine (Ctrl+Shift+F)' },
    { id: 'recent', icon: Database, label: 'Metadata', tooltip: 'Metadata Manager' },
    { id: 'citations', icon: BookOpen, label: 'References', tooltip: 'Reference Manager' },
    { id: 'extensions', icon: Puzzle, label: 'Extensions', tooltip: 'Extensions' },
    { id: 'settings', icon: Settings, label: 'Settings', tooltip: 'Settings' },
    { id: 'info', icon: Info, label: 'Info', tooltip: 'About' },
  ];

  return (
    <div className="activity-bar">
      <div className="activity-items">
        {activities.map(activity => (
          <button
            key={activity.id}
            className={`activity-item ${activeView === activity.id ? 'active' : ''}`}
            onClick={() => onViewChange(activity.id)}
            title={activity.tooltip}
          >
            <activity.icon size={24} />
            <span className="activity-label">{activity.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ActivityBar;
