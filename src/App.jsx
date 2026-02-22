import { AuthProvider } from './context/AuthContext';
import { FileSystemProvider } from './context/FileSystemContext';
import { DocumentProvider } from './context/DocumentContext';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';
import { useAuth } from './context/AuthContext';
import './App.css'

function App() {
  return (
    <AuthProvider>
      <FileSystemProvider>
        <DocumentProvider>
          <AppContent />
        </DocumentProvider>
      </FileSystemProvider>
    </AuthProvider>
  )
}

const AppContent = () => {
  const { user } = useAuth();
  return user ? <Dashboard /> : <LoginPage />;
};

export default App
