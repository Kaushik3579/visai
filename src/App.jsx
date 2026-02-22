import { AuthProvider } from './context/AuthContext';
import { FileSystemProvider } from './context/FileSystemContext';
import { DocumentProvider } from './context/DocumentContext';
import Dashboard from './components/Dashboard';
import './App.css'

function App() {
  return (
    <AuthProvider>
      <FileSystemProvider>
        <DocumentProvider>
          <Dashboard />
        </DocumentProvider>
      </FileSystemProvider>
    </AuthProvider>
  )
}

export default App
