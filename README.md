# Paper Writing & Citations Dashboard

A modern, feature-rich React + Vite dashboard for academic paper writing, PDF management, and citation handling with an intuitive file explorer interface.

## 🚀 Features

### ☁️ **Cloud Storage with Firestore**
- **User Authentication Required** - Sign in with Google to access features
- **Create Folders** - Organize your PDFs in custom folders
- **Upload PDFs** - Store PDF files securely in Firebase Cloud Storage
- **Delete Files/Folders** - Manage your cloud storage
- **Rename Items** - Update folder and file names
- **PDF Only** - Restricted to PDF files for focused document management
- **Per-User Collections** - Each user has their own isolated data in Firestore
- **Automatic Sync** - Changes sync instantly across devices

### 🎯 **Multi-Panel IDE Interface**
- **Activity Bar** - VS Code-style icon navigation on the left
- **Explorer Panel** - Complete file management system
- **Search Panel** - Search across all files and content
- **Recent Files** - Quick access to recently opened files
- **Citation Manager** - Manage all your academic citations
- **Settings Panel** - Customize your workspace preferences
- **Info Panel** - Help and keyboard shortcuts

### 📁 **Advanced File Management**
- **File Explorer** - VS Code-like file tree interface
- **Drag & Drop** - Move files and folders with ease
- **File Operations** - Create, rename, delete files and folders
- **File Upload** - Upload multiple files including PDFs, text files, images
- **Persistent Storage** - Files are saved to localStorage

### 🔍 **Powerful Search**
- Search by filename or content
- Live search results as you type
- View results grouped by file
- Click to open and navigate to matches
- Preview content matches with line numbers

### 📄 **PDF Viewer**
- View PDF documents directly in the browser
- Page navigation (Previous/Next)
- Zoom controls (50% - 300%)
- Download PDF files
- Smooth rendering with PDF.js

### ✍️ **Powerful Text Editor**
- Monaco Editor integration (VS Code's editor)
- Syntax highlighting for multiple languages
- Auto-save every 30 seconds
- Manual save with Ctrl+S / Cmd+S
- Word count tracker
- Multiple file tabs
- Dark theme optimized

### 📚 **Citation Manager**
- Add and manage citations
- Multiple citation styles:
  - APA
  - MLA
  - Chicago
  - BibTeX
- Copy citations to clipboard
- Rich citation form with all required fields
- Persistent storage

### 🔐 **Firebase Authentication**
- Google Sign-In integration
- User profile management
- Profile dropdown with avatar
- Secure authentication flow
- Persistent user sessions

### 🎨 **Modern UI/UX**
- Dark theme (VS Code inspired)
- Responsive design
- Collapsible sidebars
- Smooth animations and transitions
- Intuitive controls

## 🛠️ Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup

1. **Clone or navigate to the project directory**
   ```bash
   cd VISAI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Firebase Setup (For Google Authentication)

1. **Create a Firebase project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the setup wizard
   - Once created, click on "Web" (</>) to add a web app

2. **Enable Google Authentication**
   - In Firebase Console, go to **Authentication** > **Sign-in method**
   - Click on **Google** provider
   - Enable it and save

3. **Get your Firebase config**
   - In Firebase Console, go to **Project Settings** (gear icon)
   - Scroll down to "Your apps" section
   - Copy the Firebase configuration object

4. **Update the configuration**
   - Open `src/firebase/config.js`
   - Replace the placeholder values with your actual Firebase config:
   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key-here",
     authDomain: "your-project-id.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project-id.appspot.com",
     messagingSenderId: "your-messaging-sender-id",
     appId: "your-app-id"
   };
   ```

5. **Restart the development server**
   - Stop the server (Ctrl+C) and run `npm run dev` again

**Note**: Without Firebase configuration, the authentication features will show an error. You can still use all other features of the dashboard.

## 📦 Dependencies

- **React** - UI framework
- **Vite** - Build tool
- **Firebase** - Authentication and backend services
- **@monaco-editor/react** - Code editor
- **react-pdf & pdfjs-dist** - PDF viewing
- **@dnd-kit/core** - Drag and drop functionality
- **lucide-react** - Icon library

## 🎯 Usage

### Navigating the Interface

The dashboard uses a multi-panel layout similar to VS Code:

1. **Activity Bar** (leftmost) - Click icons to switch between features
2. **Side Panel** - Shows content for the selected feature
3. **Main Editor** - View and edit your documents
4. **File Tabs** - Switch between open files

### Using the Activity Bar

Click on any icon in the activity bar to open its panel:

- **📁 Explorer** - Browse and manage your files
- **🔍 Search** - Search across all files
- **🕐 Recent** - View recently opened files
- **📚 Citations** - Manage your citations
- **⚙️ Settings** - Customize preferences
- **ℹ️ Info** - View help and shortcuts

### Getting Started with Cloud Storage

**Important**: You must sign in with Google to use the cloud storage features.

1. **Sign In**
   - Click the **Sign In** button in the top-right header
   - Click **Continue with Google** in the modal
   - Authenticate with your Google account

2. **Create Your First Folder**
   - Once signed in, you'll see "☁️ Cloud Storage" in the header
   - Click the **folder+** icon in the Explorer panel
   - Enter a folder name (e.g., "Research Papers")
   - Click Create

3. **Upload PDF Files**
   - Select a folder in the Explorer (click on it)
   - Click the **Upload** button in the header
   - Drag and drop PDF files or click to browse
   - Only PDF files are accepted
   - Files will be uploaded to Firebase Cloud Storage

4. **Manage Your Files**
   - **Rename**: Click the edit icon next to any file/folder
   - **Delete**: Click the trash icon
   - **Open PDF**: Click on any PDF file to view it
   - **Download**: Use the download button in the PDF viewer

### Data Storage Structure

Your data is stored in Firestore with the following structure:
```
users/{userId}/
  ├── folders/{folderId}/
  │   ├── name: "Research Papers"
  │   ├── createdAt: timestamp
  │   ├── updatedAt: timestamp
  │   └── files/{fileId}/
  │       ├── name: "document.pdf"
  │       ├── fileType: "application/pdf"
  │       ├── size: 1024000
  │       ├── storagePath: "users/{userId}/folders/{folderId}/files/{fileId}_document.pdf"
  │       ├── downloadURL: "https://..."
  │       ├── createdAt: timestamp
  │       └── updatedAt: timestamp
```

PDF files are stored in Firebase Storage at: `users/{userId}/folders/{folderId}/files/{fileId}_{filename}`

### Uploading Files

1. **Sign in first** - Authentication required for cloud storage
2. **Create a folder** - You cannot upload to the root workspace
3. **Select the folder** - Click on a folder in the Explorer
4. Click the **Upload** button in the header
5. Drag and drop PDF files or click to browse
6. Only PDF files are accepted - files saved to Firebase Cloud Storage

### Managing Files

**Cloud Storage Operations:**

- **Create Folder**: Click the folder+ icon in the explorer - creates folder in Firestore
- **Rename**: Click the edit icon next to any file/folder - updates Firestore
- **Delete**: Click the trash icon - removes from Firebase Storage and Firestore
- **Upload PDF**: Use the Upload button - saves to Firebase Cloud Storage
- **Open PDF**: Click on any PDF file to view it
- **Download**: Use the download button in the PDF viewer

**Notes**: 
- All changes sync automatically across your devices
- You must be signed in to perform any operations
- Each user's data is completely isolated

### Viewing PDFs

1. Sign in with your Google account
2. Create and select a folder
3. Upload PDF files to the folder
4. Click on any PDF file in the explorer
5. Use navigation controls to browse pages
6. Zoom in/out as needed
7. Download with the download button in the toolbar

All PDF files are loaded from Firebase Cloud Storage.

### Managing Citations

1. Click the **Book** icon in the header
2. Click **Add Citation**
3. Fill in the citation details
4. Select your preferred citation style
5. Copy formatted citations to clipboard

### Using Authentication

1. **Sign In**
   - Click the **Sign In** button in the top-right header
   - Click **Sign in with Google** in the modal
   - Authenticate with your Google account
   - Your profile will appear in the top-right corner

2. **Profile Menu**
   - Click on your profile avatar to open the dropdown
   - View your name and email
   - Access Settings (⚙️)
   - Get Help (?)
   - Sign out when done

3. **Sign Out**
   - Click your profile avatar
   - Click **Sign Out** at the bottom of the menu
   - You'll be signed out and can sign in again anytime

**Note**: Authentication is optional. You can use all features without signing in, but signing in allows for future cloud sync capabilities.

## 🗂️ Project Structure

```
VISAI/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx          # Main dashboard component
│   │   ├── ActivityBar.jsx        # Left icon navigation bar
│   │   ├── FileExplorer.jsx       # File tree with drag-drop
│   │   ├── SearchPanel.jsx        # Search functionality
│   │   ├── RecentFiles.jsx        # Recent files list
│   │   ├── SettingsPanel.jsx      # Settings and preferences
│   │   ├── InfoPanel.jsx          # Help and information
│   │   ├── FileUpload.jsx         # File upload modal
│   │   ├── PDFViewer.jsx          # PDF viewing component
│   │   ├── PaperEditor.jsx        # Monaco text editor
│   │   ├── CitationManager.jsx    # Citation management
│   │   ├── SignInModal.jsx        # Google sign-in modal
│   │   └── ProfileDropdown.jsx    # User profile menu
│   ├── context/
│   │   ├── FileSystemContext.jsx  # File system state management
│   │   └── AuthContext.jsx        # Authentication state management
│   ├── firebase/
│   │   └── config.js              # Firebase configuration
│   ├── styles/
│   │   ├── Dashboard.css
│   │   ├── ActivityBar.css
│   │   ├── FileExplorer.css
│   │   ├── SearchPanel.css
│   │   ├── RecentFiles.css
│   │   ├── SettingsPanel.css
│   │   ├── InfoPanel.css
│   │   ├── FileUpload.css
│   │   ├── PDFViewer.css
│   │   ├── PaperEditor.css
│   │   ├── CitationManager.css
│   │   ├── SignInModal.css
│   │   └── ProfileDropdown.css
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── package.json
└── README.md
```

## 🔑 Keyboard Shortcuts

- **Ctrl+S / Cmd+S** - Save current file
- **Ctrl+Shift+E** - Open Explorer panel
- **Ctrl+Shift+F** - Open Search panel
- **Enter** - Confirm rename/new folder
- **Escape** - Cancel rename/new folder

## 💾 Data Persistence

**Cloud Storage Mode** (Firestore + Firebase Storage):
- All folders and files are stored in Firebase Cloud
- File metadata stored in Firestore
- Actual PDF files stored in Firebase Storage
- Citations stored in browser localStorage
- Data syncs across all devices where you're signed in
- Each user has completely isolated data

**Browser Compatibility**:
- **Chrome** ✅ Full support
- **Edge** ✅ Full support  
- **Firefox** ✅ Full support
- **Safari** ✅ Full support

**Note**: Cloud storage works on all modern browsers. No special APIs required.

## 🎨 Customization

### Changing Editor Theme
Edit `PaperEditor.jsx` and change the `theme` prop:
```jsx
<Editor theme="vs-light" /> // or "vs-dark", "hc-black"
```

### Adding Citation Styles
Add new styles in the `formatCitation` function in `CitationManager.jsx`

## 🐛 Troubleshooting

### Cannot create folders or upload files
- Make sure you're signed in with your Google account
- Check your internet connection
- Verify Firebase is properly configured in the console

### "Please select a folder first" error
- You cannot upload files directly to the root workspace
- Create a folder first, then select it before uploading

### PDFs not loading
- Ensure the PDF file is valid and not corrupted
- Check browser console for errors
- Try a different PDF file
- Check your internet connection (files load from Firebase Storage)

### Authentication not working
- Verify Firebase configuration in `src/firebase/config.js`
- Enable Google authentication in Firebase Console
- Add your domain to Firebase authorized domains
- Check browser console for specific error messages

### Files not syncing across devices
- Make sure you're signed in with the same Google account
- Check internet connection on both devices
- Refresh the page to load latest data

## 🚧 Future Enhancements

- [x] Cloud storage with Firestore and Firebase Storage
- [x] PDF-only file management
- [x] Firebase authentication with Google
- [x] Per-user data isolation
- [x] Rename files and folders
- [ ] Support for additional file types (text, markdown)
- [ ] PDF annotation and highlighting
- [ ] Advanced search filters (by date, size)
- [ ] Find and replace across multiple files
- [ ] Move files between folders
- [ ] Collaborative editing
- [ ] Citation import from DOI/URL
- [ ] File preview in explorer
- [ ] Version control/history
- [ ] Custom themes
- [ ] Firefox/Safari fallback improvements

## 📄 License

MIT License - Feel free to use this project for your academic work!

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

---

**Happy Writing! 📝✨**

# visai
# visai
